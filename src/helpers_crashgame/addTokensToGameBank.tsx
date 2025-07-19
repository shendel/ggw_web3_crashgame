import CrashGameJson from "@/abi/CrashGame.json"
import callContractMethod from '@/helpers/callContractMethod'

const addTokensToGameBank = (options) => {
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
    method: 'depositToBank',
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


export default addTokensToGameBank