import { useEffect, useState } from 'react'
import fetchGameToken from '@/helpers_crashgame/fetchGameToken'
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import { useConfirmationModal } from '@/components/ConfirmationModal'
import { useNotification } from "@/contexts/NotificationContext";
import { getTransactionLink, getShortTxHash } from '@/helpers/etherscan'
import { fromWei, toWei } from '@/helpers/wei'
import BigNumber from "bignumber.js"
import GameBankDeposit from './GameBankDeposit'
import GameBankWithdraw from './GameBankWithdraw'
import addTokensToGameBank from '@/helpers_crashgame/addTokensToGameBank'
import withdrawGameBank from '@/helpers_crashgame/withdrawGameBank'
import approveToken from '@/helpers/approveToken'

import {
  MAINNET_CHAIN_ID,
  GAME_CONTRACT
} from '@/config'
const GameBank = (props) => {
  const {
    gameBank,
    tokenInfo: {
      symbol: tokenSymbol,
      decimals: tokenDecimals,
    },
    onBankUpdated = () => {}
  } = props

  const { addNotification } = useNotification()
  const { openModal, closeModal } = useConfirmationModal()
  const {
    isConnected,
    injectedWeb3,
    injectedAccount,
    injectedChainId,
    switchNetwork,
    isSwitchingNetwork,
  } = useInjectedWeb3()
  
  const [ tokenAddress, setTokenAddress ] = useState(``)
  const [ userBalance, setUserBalance ] = useState(0)
  const [ userAllowance, setUserAllowance ] = useState(0)
  const [ needUpdateUser, setNeedUpdateUser ] = useState(true)
  const [ isFetchgingUserInfo, setIsFetchingUserInfo ] = useState(true)
  
  useEffect(() => {
    if (isConnected && injectedAccount && needUpdateUser) {
      setNeedUpdateUser(false)
      setIsFetchingUserInfo(true)
      fetchGameToken({
        playerAddress: injectedAccount,
        address: GAME_CONTRACT,
        chainId: MAINNET_CHAIN_ID
      }).then((answer) => {
        console.log('>>> GAME BANK', answer)
        const {
          tokenInfo: {
            allowance: userAllowance,
            balance: userBalance,
            tokenAddress,
          }
        } = answer
        setUserAllowance(userAllowance)
        setUserBalance(userBalance)
        setTokenAddress(tokenAddress)
        setIsFetchingUserInfo(false)
      }).catch((err) => {
        console.log('>err 2', err)
        setIsFetchingUserInfo(false)
      })
    }
  }, [ isConnected, injectedAccount, needUpdateUser ])

  const handleClose = () => {
    closeModal('GAME_BANK_INFO')
  }
  
  const handleAdd = () => {
    openModal({
      title: `Add tokens to Game Bank`,
      hideBottomButtons: true,
      fullWidth: true,
      id: 'GAME_BANK_ADD',
      onClose: (data) => {
        
      },
      content: (
        <GameBankDeposit
          userBalance={userBalance}
          userAllowance={userAllowance}
          tokenDecimals={tokenDecimals}
          tokenSymbol={tokenSymbol}
          onApprove={handleApprove}
          onDeposit={handleDeposit}
          onCancel={() => {
            closeModal('GAME_BANK_ADD')
          }}
        />
      )
    })
  };

  const handleWithdraw = (amount: number, setLoading: (loading: boolean) => void) => {
    setLoading(true);
    addNotification('info', 'Withdrawing game bank. Confirm transaction')
    withdrawGameBank({
      activeWeb3: injectedWeb3,
      address: GAME_CONTRACT,
      amount: `0x` + new BigNumber(toWei(amount, tokenDecimals)).toString(16),
      onTrx: (txHash) => {
        addNotification('info', 'Withdraw transaction', getTransactionLink(MAINNET_CHAIN_ID, txHash), getShortTxHash(txHash))
      },
      onSuccess: () => {
        addNotification('success', `Successfull withdrawed`)
        setLoading(false)
        setNeedUpdateUser(true)
        onBankUpdated()
        closeModal('GAME_BANK_WITHDRAW')
        closeModal('GAME_BANK_INFO')
      },
      onError: () => {
        addNotification('error', 'Fail withdraw')
        setLoading(false)
      }
    }).catch((err) => {})
  }
  const openWithdraw = () => {
    openModal({
      title: `Withdraw game bank`,
      hideBottomButtons: true,
      fullWidth: true,
      id: 'GAME_BANK_WITHDRAW',
      onClose: (data) => {
        
      },
      content: (
        <GameBankWithdraw
          bankBalance={gameBank}
          tokenDecimals={tokenDecimals}
          tokenSymbol={tokenSymbol}
          onWithdraw={handleWithdraw}
          onCancel={() => {
            closeModal('GAME_BANK_WITHDRAW')
          }}
        />
      )
    })
  };
  const handleApprove = (
    amount: number,
    setLoading: (loading: boolean) => void,
    setAllowance: (newAllowance) => void
  ) => {
    setLoading(true)
    addNotification('info', `Approving ${tokenSymbol}. Confirm transaction`)
    approveToken({
      activeWallet: injectedAccount,
      activeWeb3: injectedWeb3,
      tokenAddress: tokenAddress,
      approveFor: GAME_CONTRACT,
      weiAmount: toWei(amount, tokenDecimals),
      onTrx: (txHash) => {
        addNotification('info', 'Approving transaction', getTransactionLink(MAINNET_CHAIN_ID, txHash), getShortTxHash(txHash))
      },
      onSuccess: () => {
        addNotification('success', `Token ${tokenSymbol} successfull approved`)
        setLoading(false)
        setUserAllowance(toWei(amount, tokenDecimals))
        setAllowance(toWei(amount, tokenDecimals))
      },
      onError: () => {
        addNotification('error', 'Fail approving')
        setLoading(false)
      }
    }).catch((err) => {})
  };
  
  const handleDeposit = (amount: number, setLoading: (loading: boolean) => void) => {
    setLoading(true);
    addNotification('info', 'Add tokens to Game Bank. Confirm transaction')
    addTokensToGameBank({
      activeWeb3: injectedWeb3,
      address: GAME_CONTRACT,
      amount: `0x` + new BigNumber(toWei(amount, tokenDecimals)).toString(16),
      onTrx: (txHash) => {
        addNotification('info', 'Add tokens transaction', getTransactionLink(MAINNET_CHAIN_ID, txHash), getShortTxHash(txHash))
      },
      onSuccess: () => {
        addNotification('success', `Tokens successfull added`)
        setLoading(false)
        setNeedUpdateUser(true)
        onBankUpdated()
        closeModal('GAME_BANK_ADD')
        closeModal('GAME_BANK_INFO')
      },
      onError: () => {
        addNotification('error', 'Fail add')
        setLoading(false)
      }
    }).catch((err) => {})
  }
  
  return (
    <div>
      {/* Баланс банка */}
      <div className="mb-6 text-center">
        <p className="text-3xl font-extrabold text-green-400">
          {fromWei(gameBank, tokenDecimals)}
        </p>
        <p className="text-sm text-gray-400 mt-1">{tokenSymbol}</p>
      </div>

      {/* Кнопки Add / Withdraw */}
      <div className="flex flex-col space-y-3 mb-4">
        <button
          onClick={handleAdd}
          disabled={isFetchgingUserInfo}
          className={`py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition cursor-pointer`}
        >
          {'Add Tokens'}
        </button>

        <button
          onClick={openWithdraw}
          disabled={new BigNumber(gameBank).isEqualTo(0) || isFetchgingUserInfo}
          className={`py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition  cursor-pointer ${
            (new BigNumber(gameBank).isEqualTo(0))
              ? 'opacity-70 cursor-not-allowed'
              : ''
          }`}
        >
          {'Withdraw Tokens'}
        </button>
      </div>

      {/* Кнопка Close */}
      <div className="text-center">
        <button
          onClick={handleClose}
          className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-lg transition disabled:bg-gray-800 disabled:text-gray-500"
        >
          {`Close`}
        </button>
      </div>
    </div>
  );
}

export default GameBank