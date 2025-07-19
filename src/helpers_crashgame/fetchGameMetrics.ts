import CrashGameJson from "@/abi/CrashGame.json"
import Web3 from 'web3'
import { Interface as AbiInterface } from '@ethersproject/abi'
import getMultiCall, { getMultiCallAddress, getMultiCallInterface }from '@/web3/getMultiCall'

import { callMulticall } from '@/helpers/callMulticall'

const fetchGameMetrics = (options) => {
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
        metrics: { func: 'getTimeMetrics' },
        interval: { func: 'roundInterval' },
      }
    }).then((mcAnswer) => {
      resolve({
        chainId,
        address,
        ...mcAnswer,
      })

    }).catch((err) => {
      console.log('>>> Fail fetchGameMetrics', err)
      reject(err)
    })
  })
}

export default fetchGameMetrics
