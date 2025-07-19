import CrashGameJson from "@/abi/CrashGame.json"
import Web3 from 'web3'
import { Interface as AbiInterface } from '@ethersproject/abi'
import { GET_CHAIN_RPC } from '@/web3/chains'
import getMultiCall, { getMultiCallAddress, getMultiCallInterface }from '@/web3/getMultiCall'

import { callMulticall } from '@/helpers/callMulticall'
import Web3ObjectToArray from "@/helpers/Web3ObjectToArray"
import { fromWei } from '@/helpers/wei'

const fetchPlayerGames = (options) => {
  const {
    address,
    chainId,
    playerAddress,
    offset,
    limit,
  } = {
    ...options
  }
console.log(options)
  return new Promise((resolve, reject) => {
    const CrashGameAbi = CrashGameJson.abi

    const multicall = getMultiCall(chainId)
    const abiI = new AbiInterface(CrashGameAbi)

    callMulticall({
      multicall,
      target: address,
      encoder: abiI,
      calls: {
        games: {
          func: 'getPlayerRounds',
          args: [ playerAddress, offset, limit ],
          asArray: true
        }
      }
    }).then((mcAnswer) => {
      const games = Object.keys(mcAnswer.games[0]).map((i) => {
        return {
          ...mcAnswer.games[0][i],
          betAmount: mcAnswer.games[1][i],
          cashOutAmount: mcAnswer.games[2][i],
          cashOutMultiplier: mcAnswer.games[3][i]
        }
      })
      resolve({
        chainId,
        address,
        offset,
        limit,
        games,
      })

    }).catch((err) => {
      console.log('>>> Fail fetch all info', err)
      reject(err)
    })
  })
}

export default fetchPlayerGames