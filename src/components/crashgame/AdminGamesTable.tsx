import React, { useState } from 'react';
import { fromWei } from '@/helpers/wei'
import { getAddressLink, getShortAddress } from '@/helpers/etherscan'


const AdminGamesTable = (props) => {
  const {
    isPlayerGames,
    games,
    itemsPerPage = 1,
    gamesCount,
    currentPage,
    tokenInfo,
    onPageNext = () => {},
    onPagePrev = () => {},
    chainId,
    gotoPage
  } = props


  const totalPages = Math.ceil(gamesCount / itemsPerPage);

  const formatTokens = (amount) => {
    return `${fromWei(amount, tokenInfo.decimals)}`
  }
  return (
    <div className="overflow-hidden rounded-lg shadow-md bg-gray-800 text-white">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-700">
            <tr className="text-sm font-semibold">
              <th className="px-4 py-3">
                {`ID`}
              </th>
              <th className="px-4 py-3 text-right">
                {`Multplier`}
              </th>
              <th className="px-4 py-3">
                {`Bets Count`}
              </th>
              <th className="px-4 py-3">
                {`CashOut Count`}
              </th>
              <th className="px-4 py-3">
                {`Bets Amount ${tokenInfo.symbol}`}
              </th>
              <th className="px-4 py-3">
                {`CashOut Amount ${tokenInfo.symbol}`}
              </th>
              <th className="px-4 py-3">
                {`Status`}
              </th>
              <th className="px-4 py-3">
                {`Date`}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            
            {games.map((game, index) => {
              const {
                betsAmount,
                cashOutAmount,
                cashOutCount,
                multiplier,
                playersCount,
                roundId,
                startsIn,
                state,
              } = game
              
              return (
                <tr key={roundId} className="hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3 text-sm truncate max-w-xs font-semibold">
                    {roundId}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold">
                    {fromWei(multiplier)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold">
                    {playersCount}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold">
                    {cashOutCount}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold">
                    {formatTokens(betsAmount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold">
                    {formatTokens(cashOutAmount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold">
                  </td>
                  <td className="px-4 py-3 text-center font-semibold">
                    {new Date(startsIn * 1000).toLocaleString() || '-'}
                  </td>
                </tr>
              )
            })}

            {games.length === 0 && (
              <tr>
                <td colSpan={(isPlayerGames) ? 7 : 8} className="px-4 py-6 text-center text-gray-400">
                  {`No games`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center px-4 py-3 bg-gray-900 border-t border-gray-700">
          <button
            onClick={onPagePrev}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded ${
              currentPage === 1
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            {`Back`}
          </button>
          <span className="text-sm text-gray-300">
            {`Page `} {currentPage} {`of`} {totalPages}
          </span>
          <button
            onClick={onPageNext}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded ${
              currentPage === totalPages
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            {`Forward`}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminGamesTable;