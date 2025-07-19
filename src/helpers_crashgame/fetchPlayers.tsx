import CrashGameJson from "@/abi/CrashGame.json"
import Web3 from 'web3'
import { Interface as AbiInterface } from '@ethersproject/abi'
import { GET_CHAIN_RPC } from '@/web3/chains'
import getMultiCall, { getMultiCallAddress, getMultiCallInterface }from '@/web3/getMultiCall'

import { callMulticall } from '@/helpers/callMulticall'
import Web3ObjectToArray from "@/helpers/Web3ObjectToArray"
import { fromWei } from '@/helpers/wei'

const fetchPlayers = (options) => {
  const {
    address,
    chainId,
    offset,
    limit,
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
        playersCount: { func: 'playersCount' },
        players: {
          func: 'getPlayers',
          args: [ offset, limit ],
          asArray: true
        }
      }
    }).then((mcAnswer) => {
      resolve({
        chainId,
        address,
        offset,
        limit,
        ...mcAnswer,
      })

    }).catch((err) => {
      console.log('>>> Fail fetch all info', err)
      reject(err)
    })
  })
}

export default fetchPlayers