import CrashGameJson from "@/abi/CrashGame.json"
import callContractMethod from '@/helpers/callContractMethod'

const stopGame = (options) => {
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
    method: 'stopGame',
    args: [],
    calcGas,
    onTrx,
    onSuccess,
    onError,
    onFinally
  })
}


export default stopGame