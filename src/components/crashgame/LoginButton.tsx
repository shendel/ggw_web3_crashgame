import { useState, useEffect } from 'react'
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import { useConfirmationModal } from '@/components/ConfirmationModal'
import { useNotification } from "@/contexts/NotificationContext";
import SignMessage from '@/web3/SignMessage'

import {
  BACKEND
} from '@/config'

const LoginButton = (props) => {
  const {
    onLogin = () => {}
  } = props
  const [ isPreLogin, setIsPreLogin ] = useState(false)
  const [ isLogin, setIsLogin ] = useState(false)
  const [ isSignMessage, setIsSignMessage ] = useState(false)
  const {
    isConnected,
    injectedWeb3,
    injectedAccount,
    injectedChainId,
    switchNetwork,
    isSwitchingNetwork,
  } = useInjectedWeb3()
  
  const [ loginSeed, setLoginSeed ] = useState(false)
  const [ loginUtx, setLoginUtx ] = useState(false)
  const [ loginSignature, setLoginSignature ] = useState(false)
  const [ loginMessageHash, setLoginMessageHash ] = useState(false)
  
  const handlePreLogin = () => {
    setLoginSeed(false)
    setLoginUtx(false)
    fetch(BACKEND + '/pre-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address: injectedAccount })
    }).then(async (answer) => {
      const res = await answer.json()
      console.log(res)
      const {
        seed,
        utx
      }  = res
      setLoginSeed(seed)
      setLoginUtx(utx)
      SignMessage({
        activeWeb3: injectedWeb3,
        userAddress: injectedAccount.toLowerCase(),
        signedData: [
          { t: 'address', v: injectedAccount.toLowerCase() },
          { t: 'uint256', v: utx },
          { t: 'bytes32', v: seed }
        ]
      }).then((data) => {
        const { signature, messageHash } = data
        console.log('>> login signature', signature)
        console.log('>> login messageHash', messageHash)
        setLoginSignature(signature)
        setLoginMessageHash(messageHash)
        fetch(BACKEND + '/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address: injectedAccount,
            seed,
            utx,
            signature,
            messageHash
          })
        }).then(async (answer) => {
          const res = await answer.json()
          onLogin({
            seed,
            utx,
            signature,
            messageHash
          })
          console.log('>>> login answer', res)
        }).catch((err) => {
          console.log('>> fail login', err)
        })
      }).catch((err) => {
        console.log('Fail sign', err)
      })
    }).catch((err) => {
      console.log('ERROR', err)
    })
  }
  return (
    <button
      onClick={handlePreLogin}
      disabled={isLogin}
      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center space-x-2"
    >
      {isLogin
        ? `Login In...`
        : `Login and Start Play`
      }
    </button>
  )
}

export default LoginButton