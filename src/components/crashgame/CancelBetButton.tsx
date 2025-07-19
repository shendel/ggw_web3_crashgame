import { fromWei } from '@/helpers/wei'
import { useCrashGame } from '@/contexts/CrashGameContext'

const CancelBetButton = (props) => {
  const {
    betAmount,
    tokenInfo,
    onClick
  } = props
  
  const {
    gameStatus,
  } = useCrashGame()
  
  const {
    isCountDown,
    countdown,
    roundInterval,
    isPending,
  } = gameStatus
  
  const percentToEnd = 100 / roundInterval * countdown

  return (
    <button className={`
        w-full bg-rose-600 hover:bg-rose-500 active:scale-[0.97] transition
        text-white font-semibold rounded-lg py-2 items-center
        focus-visible:outline-2 focus-visible:outline-rose-500
        disabled:scale-[1]
        disabled:bg-gray-800
        disabled:text-gray-300
        relative
        select-none
      `}
      disabled={isPending}
      onClick={onClick}
    >
      {isCountDown && (
        <i className={`
            absolute right-0 bottom-0 h-2 rounded-br-lg bg-rose-800 transition-all 
            duration-300 ease-linear
            ${(percentToEnd <= 0) ? 'rounded-bl-lg' : ''}
          `}
          style={{ width: `${100 - percentToEnd}%` }}
        ></i>
      )}
      {isPending ? (
        <div className="text-sm">{`Starting round...`}</div>
      ) : (
        <>
          <div className="text-sm">{`Your Bet`}</div>
          <div className="font-bold text-2xl">{`${fromWei(betAmount, tokenInfo.decimals)} ${tokenInfo.symbol}`}</div>
          <div className="font-bold text-2xl">{`CANCEL`}</div>
          <div className="text-sm">{`Waiting next round`}</div>
        </>
      )}
    </button>
  )
}


export default CancelBetButton
