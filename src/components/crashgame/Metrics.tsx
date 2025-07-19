import { useCrashGame } from '@/contexts/CrashGameContext'
import processRound from '@/helpers_crashgame/processRound'
import { useNotification } from "@/contexts/NotificationContext"
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import { getTransactionLink, getShortTxHash } from '@/helpers/etherscan'
import { MAINNET_CHAIN_ID, GAME_CONTRACT } from '@/config'

const Metrics = () => {
  const {
    metrics
  } = useCrashGame()

  const { injectedWeb3 } = useInjectedWeb3()
  const { addNotification } = useNotification()
  
  if (!metrics) return null
  
  const handleCloseRound = () => {
    processRound({
      activeWeb3: injectedWeb3,
      address: GAME_CONTRACT,
      onTrx: (txHash) => {
        addNotification('info', 'Process round', getTransactionLink(MAINNET_CHAIN_ID, txHash), getShortTxHash(txHash))
      },
      onSuccess: () => {
        addNotification('success', `Successfull processed`)
      },
      onError: () => {
        addNotification('error', 'Fail process round')
      }
    }).catch((err) => {})
  }
  return (
    <div className="p-2 bg-blue-200 text-black">
      <span>Delta: <strong>{metrics.delta}</strong></span>
      {` | `}
      <span>currentTimeStamp: <strong>{metrics.currentTimeStamp}</strong></span>
      {` | `}
      <span>currentRoundTimestamp: <strong>{metrics.currentRoundTimestamp}</strong></span>
      {` | `}
      <span>nextRoundTimestamp: <strong>{metrics.nextRoundTimestamp}</strong></span>
      {` | `}
      {(metrics.currentTimeStamp > metrics.nextRoundTimestamp) ? (
        <>
          <strong>Round ended... calc...</strong>
          <button onClick={handleCloseRound}>Calc</button>
        </>
      ) : (
        <strong>Time left: {metrics.nextRoundTimestamp - metrics.currentTimeStamp}</strong>
      )}
    </div>
  )
}


export default Metrics