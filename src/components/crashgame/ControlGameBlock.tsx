import { useState, useEffect, useRef } from 'react'

import StopGameButton from '@/components/crashgame/StopGameButton'
import StartGameButton from '@/components/crashgame/StartGameButton'
import CancelBetButton from '@/components/crashgame/CancelBetButton'
import CrashedButton from '@/components/crashgame/CrashedButton'
import CashedOutButton from '@/components/crashgame/CashedOutButton'

import { useCrashGame } from '@/contexts/CrashGameContext'
import { useNotification } from "@/contexts/NotificationContext"
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import { getTransactionLink, getShortTxHash } from '@/helpers/etherscan'
import { fromWei, toWei } from '@/helpers/wei'
import BigNumber from "bignumber.js"
import SignMessage from '@/web3/SignMessage'
import getNextRoundId from '@/helpers_crashgame/getNextRoundId'

import {
  GAME_STATUS
} from '@/helpers_crashgame/constants'

const ControlGameBlock = (props) => {
  const {
    gameChainId,
    gameContractAddress,
    gameBackendSocket: {
      isConnected
    },
    tokenInfo,
    playerInfo,
    /* ------------- */
    addMessageListener,
    removeMessageListener,
    /* ------------- */
    joinGame,
    checkConnectedToQuery,
    leaveGame,
    cashOutBet,
    /* ------------- */
    gameStatus,
  } = useCrashGame()

  const {
    injectedWeb3,
    injectedAccount
  } = useInjectedWeb3()
  
  const { addNotification } = useNotification()
  
  
  const [ betAmount, setBetAmount ] = useState<number | string>('')
  const handleChangeBet = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
      setBetAmount(value);
    }
  }

  const handleStopGame = () => {

  }
  
  const [ isConnectingGame , setIsConnectingGame ] = useState(true)
  const [ isJoining, setIsJoing ] = useState(false)
  const [ isJoined, setIsJoined ] = useState(false)
  const [ joinData, setJoinData ] = useState(false)
  const [ isCashOut, setIsCashOut ] = useState(false)
  const [ isCrashed, setIsCrashed ] = useState(false)
  const [ crashMultiplier, setCrashMultiplier ] = useState(1)
  const [ userRoundId, setUserRoundId ] = useState(false)
  const [ cashOutMultiplier, setCashOutMultiplier ] = useState(1)
  
  const joinDataRef = useRef(joinData);
  const userRoundIdRef = useRef(userRoundId);
  const isCashOutRef = useRef(isCashOut);

  useEffect(() => {
    joinDataRef.current = joinData;
  }, [joinData]);

  useEffect(() => {
    userRoundIdRef.current = userRoundId;
  }, [userRoundId]);

  useEffect(() => {
    isCashOutRef.current = isCashOut;
  }, [isCashOut]);
  
  useEffect(() => {
    if (isConnected && playerInfo && playerInfo.playerId) {
      checkConnectedToQuery({ playerId: playerInfo.playerId })
      const callbackJoinGame = (data) => {
        const {
          playerId,
          userAddress,
          roundId,
          isCashedOut,
          cashOutMultiplier,
        } = data
        if (playerId == playerInfo.playerId) {
          console.log('[Reconnect]', data)
          setIsJoing(false)
          setIsJoined(true)
          setUserRoundId(roundId)
          setJoinData(data)
          if (isCashedOut) {
            setIsCashOut(true)
            setCashOutMultiplier(cashOutMultiplier)
          }
          setIsConnectingGame(false)
          console.log('>> Joined', data)
        }
      }
      addMessageListener('player-join-game', callbackJoinGame)
      const callbackNotInQuery = (data) => {
        setIsConnectingGame(false)
      }
      addMessageListener('not-in-query', callbackNotInQuery)
      const callbackOnCashOut = (data) => {
        const {
          multiplier
        } = data
        setIsCashOut(true)
        setCashOutMultiplier(multiplier)
      }
      addMessageListener('cashed-out', callbackOnCashOut)
      
      const callbackOnCrash = (data) => {
        const {
          roundId,
          multiplier
        } = data
        const currentJoinData = joinDataRef.current;
        const currentUserRoundId = userRoundIdRef.current;
        const currentIsCashOut = isCashOutRef.current;

        console.log('>>>> On Crash', roundId, currentUserRoundId, currentJoinData);

        if (currentJoinData && (roundId == currentUserRoundId) && !currentIsCashOut) {
          setIsCrashed(true)
          setCrashMultiplier(multiplier)
        }
      }
      addMessageListener('multiplier-crash', callbackOnCrash)
      
      return () => {
        removeMessageListener('player-join-game', callbackJoinGame)
        removeMessageListener('cashed-out', callbackOnCashOut)
        removeMessageListener('multiplier-crash', callbackOnCrash)
        removeMessageListener('not-in-query', callbackNotInQuery)
      }
    }
  }, [ isConnected, playerInfo ])

  const handleStartGame = () => {
    const value = Number(betAmount);
    console.log('>> playerInfo', playerInfo)
    if (value > 0 && new BigNumber(toWei(value, tokenInfo.decimals)).isLessThanOrEqualTo(playerInfo.depositAmount)) {
      setIsJoing(true)
      getNextRoundId({
        chainId: gameChainId,
        address: gameContractAddress
      }).then(({ nextRoundId }) => {
        console.log('>>> next round id', nextRoundId)
        addNotification('info', 'Registering in game round. Sign message')
        
        SignMessage({
          activeWeb3: injectedWeb3,
          userAddress: injectedAccount,
          signedData: [
            { t: 'uint256', v: playerInfo.playerId },
            { t: 'address', v: injectedAccount },
            { t: 'uint256', v: nextRoundId },
            { t: 'uint256', v: toWei(value, tokenInfo.decimals) }
          ]
        }).then((data) => {
          const { signature, messageHash } = data
          try {
            setIsJoing(false)
            joinGame({
              playerId: playerInfo.playerId,
              roundId: nextRoundId,
              userAddress: injectedAccount,
              betAmount: toWei(value, tokenInfo.decimals),
              messageHash,
              signature
            })
          } catch(err) {
            setIsJoing(false)
          }
        }).catch((err) => {
          setIsJoing(false)
          console.log('Fail sign', err)
        })
      }).catch((err) => {
        setIsJoing(false)
      })
    }
  }

  const handleCancelBet = () => {
    leaveGame(joinData)
    setIsJoined(false)
    setJoinData(false)
    setUserRoundId(false)
  }
  const handleCashOutBet = () => {
    cashOutBet(joinData)
  }
  
  const handleTryAgain = () => {
    setIsJoined(false)
    setJoinData(false)
    setIsCashOut(false)
    setIsCrashed(false)
    setUserRoundId(false)
  }

  const renderMakeBet = () => {
    return (
      <>
        <div>
          <label htmlFor="betAmount" className="block text-sm mb-2">Bet Amount</label>
          <div className="relative">
            <input id="betAmount" type="number" min="0.0001" step="0.0001"
              value={betAmount}
              onChange={handleChangeBet}
              className={`
                w-full peer bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-600 transition
                [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none
                [&::-webkit-outer-spin-button]:appearance-none
              `}
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="dice-5" class="lucide lucide-dice-5 w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><path d="M16 8h.01"></path><path d="M8 8h.01"></path><path d="M8 16h.01"></path><path d="M16 16h.01"></path><path d="M12 12h.01"></path></svg>
          </div>
        </div>
      
        <StartGameButton onClick={handleStartGame} disabled={isJoining} />
      </>
    )
  }
  return (
    <>
      {/*<!-- Place Bet -->*/}
      <section className="bg-gray-900/60 border border-white/5 rounded-2xl p-6 shadow-xl">
        {/*<!-- Amount Input -->*/}
        {isConnectingGame ? (
          <div>CONNECTING</div>
        ) : (
          <>
            {isJoined && joinData ? (
              <>
                {isCashOut ? (
                  <CashedOutButton
                    joinData={joinData}
                    multiplier={cashOutMultiplier}
                    onClick={handleTryAgain}
                  />
                ) : (
                  <>
                    {gameStatus.roundId !== userRoundId && !isCrashed ? (
                      <>
                        <CancelBetButton
                          betAmount={joinData.betAmount}
                          tokenInfo={tokenInfo}
                          onClick={handleCancelBet}
                        />
                      </>
                    ) : (
                      <>
                        {gameStatus.isRunning && gameStatus.roundId == userRoundId && (
                          <StopGameButton onClick={handleCashOutBet} joinData={joinData} />
                        )}
                        {isCrashed && (
                          <CrashedButton multiplier={crashMultiplier} onClick={handleTryAgain}/>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            ) : (
              <>{renderMakeBet()}</>
            )}
          </>
        )}
      </section>
    </>
  )
}


export default ControlGameBlock