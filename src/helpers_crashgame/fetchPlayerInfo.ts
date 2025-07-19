import CrashGameJson from "@/abi/CrashGame.json"
import Web3 from 'web3'
import { Interface as AbiInterface } from '@ethersproject/abi'
import getMultiCall, { getMultiCallAddress, getMultiCallInterface }from '@/web3/getMultiCall'

import { callMulticall } from '@/helpers/callMulticall'

const fetchPlayerInfo = (options) => {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
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
        playerInfo: {
          func: 'players', args: [ playerAddress ]
        },
        bankAmount: {
          func: 'bankAmount'
        }
      }
    }).then((mcAnswer) => {
      console.log('>>> fetchPlayerInfo', mcAnswer)
      resolve({
        chainId,
        address,
        playerAddress,
        ...mcAnswer,
      })

    }).catch((err) => {
      console.log('>>> Fail fetchPlayerInfo', err)
      reject(err)
    })
  })
}

export default fetchPlayerInfo
