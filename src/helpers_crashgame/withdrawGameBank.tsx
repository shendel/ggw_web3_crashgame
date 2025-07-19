import CrashGameJson from "@/abi/CrashGame.json"
import callContractMethod from '@/helpers/callContractMethod'

const withdrawGameBank = (options) => {
  const {
    activeWeb3,
    address,
    amount,
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
    method: 'withdrawBank',
    args: [
      amount,
    ],
    calcGas,
    onTrx,
    onSuccess,
    onError,
    onFinally
  })
}


export default withdrawGameBank