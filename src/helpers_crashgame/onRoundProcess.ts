import EventPolledListener from '@/web3/EventPolledListener'
import CrashGameJson from "@/abi/CrashGame.json"
import Web3 from 'web3'
import { GET_CHAIN_RPC } from '@/web3/chains'

const onRoundProcess = async (options) => {
  const {
    chainId,
    address,
    callback,
    pollIntervalMs = 5000
  } = options
  
  const rpc = GET_CHAIN_RPC(chainId)
  const web3 = new Web3(rpc)
  
  
  const contract = new web3.eth.Contract(CrashGameJson.abi, address)
  
  //return () => {}
  return EventPolledListener({
    contract,
    web3,
    eventName: 'RoundProcessed',
    pollIntervalMs,
    callback
  })
}


export default onRoundProcess