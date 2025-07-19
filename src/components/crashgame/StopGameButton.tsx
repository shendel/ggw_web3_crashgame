import { useCrashGame } from '@/contexts/CrashGameContext'
import CashIcon from '@/components/crashgame/svg/CashIcon'
import { fromWei, toWei } from '@/helpers/wei'
import BigNumber from "bignumber.js"


const StopGameButton = (props) => {
  const {
    onClick,
    joinData: {
      betAmount
    }
  } = props
  const {
    tokenInfo,
    gameStatus,
    gameStatus: {
      multiplier
    }
  } = useCrashGame()
  
  return (
    <button id="cashOut" className={`
        mt-3 w-full bg-green-600 hover:bg-green-500 active:scale-[0.97] transition
        text-white font-semibold rounded-lg
        focus-visible:outline-2 focus-visible:outline-green-500 py-2 
      `}
      onClick={onClick}
    >
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
        <span className="relative">{`Cash Out`}</span>
      </div>
    </button>
  )

}

export default StopGameButton