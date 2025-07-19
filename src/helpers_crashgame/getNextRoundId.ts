import CrashGameJson from "@/abi/CrashGame.json"
import Web3 from 'web3'
import { Interface as AbiInterface } from '@ethersproject/abi'
import getMultiCall, { getMultiCallAddress, getMultiCallInterface }from '@/web3/getMultiCall'

import { callMulticall } from '@/helpers/callMulticall'

const getNextRoundId = (options) => {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
  const {
    address,
    chainId,
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
        nextRoundId: {
          func: 'getNextRound'
        }
      }
    }).then((mcAnswer) => {
      resolve({
        chainId,
        address,
        ...mcAnswer,
      })

    }).catch((err) => {
      console.log('>>> Fail getNextRoundId', err)
      reject(err)
    })
  })
}

export default getNextRoundId
