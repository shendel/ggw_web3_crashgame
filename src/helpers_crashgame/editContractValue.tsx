import CrashGameJson from "@/abi/CrashGame.json"
import callContractMethod from '@/helpers/callContractMethod'

const editContractValue = (options) => {
  const {
    activeWeb3,
    address,
    func,
    value,
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
    method: func,
    args: [ value ],
    calcGas,
    onTrx,
    onSuccess,
    onError,
    onFinally
  })
}


export default editContractValue