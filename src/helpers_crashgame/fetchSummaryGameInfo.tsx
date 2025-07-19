import CrashGameJson from "@/abi/CrashGame.json"
import Web3 from 'web3'
import { Interface as AbiInterface } from '@ethersproject/abi'
import { GET_CHAIN_RPC } from '@/web3/chains'
import getMultiCall, { getMultiCallAddress, getMultiCallInterface }from '@/web3/getMultiCall'

import { callMulticall } from '@/helpers/callMulticall'
import Web3ObjectToArray from "@/helpers/Web3ObjectToArray"
import { fromWei } from '@/helpers/wei'

const fetchSummaryGameInfo = (options) => {
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
        tokenInfo:              { func: 'getTokenInfo', args: [ '0x0000000000000000000000000000000000000000' ] },
        owner:                  { func: 'owner' },
        oracle:                 { func: 'oracle' },
        burnAndStakePercent:    { func: 'onLosePercentToProcess' },
        burnAndStakeAddress:    { func: 'burnAndStakeAddress' },
        tokenAddress:           { func: 'token' },
        playersCount:           { func: 'playersCount' },
        totalPlayersDeposit:    { func: 'totalPlayersDeposit' },
        gamesCount:             { func: 'roundsCounter' },
        //totalWonAmount:         { func: 'totalWonAmount' },
        //totalLostAmount:        { func: 'totalLostAmount' },
        minMultiplier:          { func: 'minMultiplier' },
        maxMultiplier:          { func: 'maxMultiplier' },
        gameBank:               { func: 'bankAmount' },
        pendingBank:            { func: 'pendingBankAmount' },
        minBet:                 { func: 'minBet' },
        maxBet:                 { func: 'maxBet' }
      }
    }).then((mcAnswer) => {
      
      resolve({
        chainId,
        address,
        ...mcAnswer,
      })

    }).catch((err) => {
      console.log('>>> Fail fetch all info', err)
      reject(err)
    })
  })
}

export default fetchSummaryGameInfo