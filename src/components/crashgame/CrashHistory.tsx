import React, { useState, useEffect } from 'react';
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import { useCrashGame } from '@/contexts/CrashGameContext'
import fetchGames from '@/helpers_crashgame/fetchGames'
import fetchPlayerGames from '@/helpers_crashgame/fetchPlayerGames'
import { fromWei } from '@/helpers/wei'
import BigNumber from "bignumber.js"

const CrashHistory = () => {
  const {
    gameChainId,
    gameContractAddress,
    lastRoundId,
    tokenInfo
  } = useCrashGame()
  const {
    isConnected,
    injectedAccount
  } = useInjectedWeb3()

  const [viewMode, setViewMode] = useState('all'); // 'all' или 'my'

  const [ rounds, setRounds ] = useState([])
  const [ playerRounds, setPlayerRounds ] = useState([])
  
  useEffect(() => {
    if (isConnected && injectedAccount) {
      fetchPlayerGames({
        chainId: gameChainId,
        address: gameContractAddress,
        playerAddress: injectedAccount,
        offset: 0,
        limit: 20
      }).then(({ games }) => {
        setPlayerRounds(games)
      }).catch((err) => {
        console.log('>> fail fetch playerRounds')
      })
    } else {
      setPlayerRounds([])
    }
  }, [ isConnected, injectedAccount, gameChainId, gameContractAddress, lastRoundId ])
  
  useEffect(() => {
    fetchGames({
      chainId: gameChainId,
      address: gameContractAddress,
      offset: 0,
      limit: 20
    }).then((answer) => {
      console.log('>>> Rounds', answer)
      const {
        games
      } = answer
      setRounds(games)
    }).catch((err) => {
      console.log('>>> Fail fetch rounds', err)
    })
  }, [ gameChainId, gameContractAddress, lastRoundId ])

  return (
    <section className="bg-gray-900/60 border border-white/5 rounded-2xl p-6 shadow-xl">
      {/* Заголовок */}
      <h2 className="text-xl font-bold mb-4">{`Rounds History`}</h2>

      {/* Переключатель */}
      {isConnected && (
        <div className="flex justify-between mb-4">
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 mr-2 rounded-md w-1/2 ${
                viewMode === 'all' ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            {`All`}
          </button>
          <button
            onClick={() => setViewMode('my')}
            className={`px-4 py-2 rounded-md w-1/2 ${
                viewMode === 'my' ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            {`My Rounds`}
          </button>
        </div>
      )}


      {/* Таблица */}
      <div className="overflow-x-auto">
        {viewMode === 'my' && isConnected && (
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                <th className="pb-2">#</th>
                <th className="pb-2">Bet</th>
                <th className="pb-2 text-center">x</th>
                <th className="pb-2 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {playerRounds.length == 0 && (
                <tr>
                  <td colspan="4" className="text-center font-mono">{`No Games History`}</td>
                </tr>
              )}
              {playerRounds.map((round, index) => {
                const {
                  roundId,
                  betAmount,
                  cashOutAmount,
                  cashOutMultiplier,
                  multiplier
                } = round
                
                const isWon = new BigNumber(cashOutAmount).isGreaterThan(0)
                return (
                  <tr key={roundId} className="border-b border-gray-800 font-mono">
                    <td>{roundId}</td>
                    <td>
                      {new BigNumber(fromWei(betAmount, tokenInfo.decimals)).toFixed(2)}
                    </td>
                    <td className={`${(isWon) ? 'text-green-400' : 'text-red-400'} text-center`}>
                      {new BigNumber(fromWei(isWon ? cashOutMultiplier : multiplier)).toFixed(2)}
                      {`x`}
                    </td>
                    <td className={`${(isWon) ? 'text-green-400' : 'text-red-400'} text-right`}>
                      {isWon ? (
                        <>{`+`}{new BigNumber(fromWei(cashOutAmount, tokenInfo.decimals)).toFixed(2)}</>
                      ) : (
                        <>{`-`}{new BigNumber(fromWei(betAmount, tokenInfo.decimals)).toFixed(2)}</>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        {(viewMode === 'all' || !isConnected) && (
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                <th className="pb-2">#</th>
                <th className="pb-2">Players</th>
                <th className="pb-2">Bets</th>
                <th className="pb-2 text-center">x</th>
                <th className="pb-2 text-right">Win</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {rounds.length == 0 && (
                <tr>
                  <td colspan="5" className="text-center font-mono">{`No Games History`}</td>
                </tr>
              )}
              {rounds.map((round, index) => {
                const {
                  roundId,
                  multiplier,
                  betsAmount,
                  playersCount,
                  cashOutAmount
                } = round
                return (
                  <tr key={roundId} className="border-b border-gray-800 font-mono ">
                    <td>{roundId}</td>
                    <td>{playersCount}</td>
                    <td>
                      {new BigNumber(fromWei(betsAmount, tokenInfo.decimals)).toFixed(2)}
                    </td>
                    <td className="text-green-400 text-center">
                      {new BigNumber(fromWei(multiplier)).toFixed(2)}
                      {`x`}
                    </td>
                    <td className="text-right">
                      {(new BigNumber(cashOutAmount).isGreaterThan(0)) ? (
                        <>{new BigNumber(fromWei(cashOutAmount, tokenInfo.decimals)).toFixed(2)}</>
                      ) : (
                        <>{`-`}</>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default CrashHistory;