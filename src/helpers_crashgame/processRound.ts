import CrashGameJson from "@/abi/CrashGame.json"
import callContractMethod from '@/helpers/callContractMethod'
import crypto from 'crypto'


const processRound = (options) => {
  const {
    activeWeb3,
    address,
    calcGas,
    onTrx = (txHash) => {},
    onSuccess = () => {},
    onError = () => {},
    onFinally = () => {}
  } = options
  
  const contract = new activeWeb3.eth.Contract(CrashGameJson.abi, address)
  
  return callContractMethod({
    activeWeb3,
    contract,
    method: 'precessRound',
    args: [
      '0x' + crypto.randomBytes(32).toString('hex'),
    ],
    calcGas,
    onTrx,
    onSuccess,
    onError,
    onFinally
  })
}


export default processRound