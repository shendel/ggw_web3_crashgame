import { useCrashGame } from '@/contexts/CrashGameContext'
import BigNumber from "bignumber.js"

const MultiplierDisplay = () => {
  const {
    gameStatus,
    gameStatus: {
      multiplier,
      isCountDown,
      countdown,
      roundInterval,
      isPending,
      isRunning,
      isCrashed,
      roundId
    },
    generatedHash,
    generatedSalt,
  } = useCrashGame()

  //console.log('[MultiplierDisplay]', gameStatus)
  
  const percentToEnd = 100 / roundInterval * countdown
  
  
  return (
    <>
      <div className="relative h-72 overflow-hidden select-none">
        <div className="absolute inset-0 flex items-center justify-center z-10">
          {isPending ? (
            <div>Prepare</div>
          ) : (
            <div 
              className={`
                text-7xl sm:text-8xl md:text-9xl font-bold animate-pulse
                ${(isRunning) ? '' : 'tracking-tight drop-shadow '}
                ${(isCrashed) ? 'text-red-500' : 'text-lime-500'}
              `}
              style={{ marginTop : '-0.5em' }}
            >
              {roundId == '0' || roundId == undefined && !isCountDown ? (
                <div className="text-4xl sm:text-3xl md:text-4xl">{`Waiting players`}</div>
              ) : (
                <>
                  {isCountDown ? (
                    <>
                      <div className="text-4xl sm:text-3xl md:text-4xl">Count Down...</div>
                      <div className="bg-red-300 h-2 m-auto mt-2 w-200 relative rounded-sm">
                        <i className={`
                            bg-red-500 left-0 top-0 bottom-0 absolute
                            rounded-sm
                            transition-all 
                            duration-300 ease-linear
                          `}
                          style={{
                            width: `${percentToEnd}%`
                          }}
                        ></i>
                      </div>
                    </>
                  ) : (
                    <div>{new BigNumber(multiplier).toFixed(2)}{`×`}</div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        
      </div>
      {generatedHash && (
        <div>
          <div>Round Provably Fair Info</div>
          <div>
            <span>Round ID:</span>
            <strong>{roundId || `prepare`}</strong>
          </div>
          <div>
            <span>Hash:</span>
            <strong>{generatedHash}</strong>
          </div>
          <div>
            <span>Salt:</span>
            <strong>
              {
                (generatedSalt)
                  ? generatedSalt
                  : `hidden`
              }
            </strong>
          </div>
        </div>
      )}
    </>
  )
}


export default MultiplierDisplay