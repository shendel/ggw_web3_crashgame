import { fromWei } from '@/helpers/wei'
import { useCrashGame } from '@/contexts/CrashGameContext'

const CrashedButton = (props) => {
  const {
    onClick
  } = props
  
  const {
    gameStatus
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
        relative
        select-none
      `}
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
      <>
        <div className="text-sm">{`Your Bet`}</div>
        <div className="font-bold text-2xl">{`CRASHED`}</div>
        <div className="text-sm">{`Try Again`}</div>
      </>
    </button>
  )
}


export default CrashedButton
