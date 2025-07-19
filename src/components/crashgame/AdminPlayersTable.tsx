import React, { useState } from 'react';
import { fromWei } from '@/helpers/wei'
import { getAddressLink, getShortAddress } from '@/helpers/etherscan'

const AdminPlayersTable: React.FC<AdminPlayersTableProps> = (props) => {
  const {
    players,
    itemsPerPage = 1,
    playersCount,
    currentPage,
    tokenInfo,
    onPageNext = () => {},
    onPagePrev = () => {},
    chainId,
    gotoPage
  } = props


  const totalPages = Math.ceil(playersCount / itemsPerPage);

  const formatTokens = (amount) => {
    return `${fromWei(amount, tokenInfo.decimals)}`
  }
  return (
    <div className="overflow-hidden rounded-lg shadow-md bg-gray-800 text-white">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                {`Address`}
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold">
                {`Deposit (${tokenInfo.symbol})`}
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold">
                {`Bets (${tokenInfo.symbol})`}
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold">
                {`Won (${tokenInfo.symbol})`}
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold">
                {`Total Games`}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {players.map((player, index) => {
              const {
                betsAmount,
                cashOutAmount,
                depositAmount,
                playerAddress,
                playerId,
                roundsCount,
              } = player
              return (
                <tr key={playerAddress} className="hover:bg-gray-700 transition-colors  text-sm font-semibold">
                  <td className="px-4 py-3 text-sm truncate max-w-xs">
                    <a
                      onClick={() => {
                        gotoPage(`/admin/playergames/${playerAddress}`)
                      }}
                      className="text-blue-300 cursor-pointer"
                    >
                      {getShortAddress(playerAddress, 8)}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {formatTokens(depositAmount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-red-400">
                    -{formatTokens(betsAmount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-green-400">
                    +{formatTokens(cashOutAmount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {roundsCount}
                  </td>
                </tr>
              )
            })}

            {players.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  {`No players`}
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

export default AdminPlayersTable;