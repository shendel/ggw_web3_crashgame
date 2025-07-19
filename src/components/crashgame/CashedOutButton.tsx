import { useCrashGame } from '@/contexts/CrashGameContext'
import CashIcon from '@/components/crashgame/svg/CashIcon'
import { fromWei, toWei } from '@/helpers/wei'
import BigNumber from "bignumber.js"


const CashedOutButton = (props) => {
  const {
    onClick,
    multiplier,
    joinData: {
      betAmount
    }
  } = props
  const {
    tokenInfo,
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
    <button id="cashOut" className={`
        mt-3 w-full bg-amber-600 hover:bg-amber-500 active:scale-[0.97] transition
        text-white font-semibold rounded-lg
        focus-visible:outline-2 focus-visible:outline-amber-500 py-2 
        relative
      `}
      onClick={onClick}
    >
      {isCountDown && (
        <i className={`
            absolute right-0 bottom-0 h-2 rounded-br-lg bg-amber-800 transition-all 
            duration-300 ease-linear
            ${(percentToEnd <= 0) ? 'rounded-bl-lg' : ''}
          `}
          style={{ width: `${100 - percentToEnd}%` }}
        ></i>
      )}
      <div className="text-sm font-bold">
        {`x`}{new BigNumber(multiplier).toFixed(2)}
      </div>
      <div className="font-bold text-2xl">
        {new BigNumber(fromWei(new BigNumber(betAmount).multipliedBy(multiplier), tokenInfo.decimals)).toFixed(2)}
        {` `}
        {tokenInfo.symbol}
      </div>
      <div className="flex items-center justify-center gap-2">
        <CashIcon />
        <span className="relative">{`Cashed Out`}</span>
      </div>
    </button>
  )

}

export default CashedOutButton