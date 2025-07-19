import { useCrashGame } from '@/contexts/CrashGameContext'
import PlayIcon from '@/components/crashgame/svg/PlayIcon'

const StartGameButton = (props) => {
  const {
    onClick,
    title = `Bet & Play`,
    disabled = false
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
        mt-6 w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] transition
        text-white font-semibold rounded-lg py-2 flex items-center justify-center gap-2
        focus-visible:outline-2 focus-visible:outline-indigo-500
        disabled:scale-[1]
        disabled:bg-gray-800
        disabled:text-gray-300
        relative
      `}
      disabled={disabled}
      onClick={onClick}
    >
      {isCountDown && (
        <i className={`
            absolute left-0 bottom-0 h-1 rounded-bl-lg bg-indigo-900 transition-all 
            duration-300 ease-linear
            ${(percentToEnd <= 0) ? 'rounded-bl-lg' : ''}
          `}
          style={{ width: `${100 - percentToEnd}%` }}
        ></i>
      )}
      <PlayIcon />
      <span className="relative">{title}</span>
    </button>
  )
}

export default StartGameButton