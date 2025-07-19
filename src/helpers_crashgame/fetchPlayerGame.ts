import CrashGameJson from "@/abi/CrashGame.json"
import Web3 from 'web3'
import { Interface as AbiInterface } from '@ethersproject/abi'
import getMultiCall, { getMultiCallAddress, getMultiCallInterface }from '@/web3/getMultiCall'

import { callMulticall } from '@/helpers/callMulticall'

const fetchPlayerGame = (options) => {
  const {
    address,
    chainId,
    playerAddress,
  } = {
    ...options
  }

  return new Promise((resolve, reject) => {
    const CrashGameAbi = CrashGameJson.abi

    const multicall = getMultiCall(chainId)
    const abiI = new AbiInterface(CrashGameAbi)

    callMulticall({
      multicall,
      target: address,
      encoder: abiI,
      calls: {
        playerGame: {
          func: 'getPlayerGame', args: [ playerAddress ]
        }
      }
    }).then((mcAnswer) => {
    console.log('>>> MC ANSWER', mcAnswer)
      resolve({
        chainId,
        address,
        playerAddress,
        ...mcAnswer,
      })

    }).catch((err) => {
      console.log('>>> Fail fetchPlayerGame', err)
      reject(err)
    })
  })
}

export default fetchPlayerGame
