import FlipGameJson from "@/abi/GGWDeposit.json"
import callContractMethod from '@/helpers/callContractMethod'

const withdrawTokens = (options) => {
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
  
  const contract = new activeWeb3.eth.Contract(FlipGameJson.abi, address)
  
  return callContractMethod({
    activeWeb3,
    contract,
    method: 'withdraw',
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


export default withdrawTokens