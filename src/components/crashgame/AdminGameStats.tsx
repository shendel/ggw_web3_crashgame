import React, { useState, useEffect } from 'react';
import { useConfirmationModal } from '@/components/ConfirmationModal'
import { getTransactionLink, getShortTxHash, getShortAddress, getAddressLink } from '@/helpers/etherscan'
import BigNumber from "bignumber.js"
import { fromWei, toWei } from '@/helpers/wei'

interface GameStat {
  title: string;
  value: string | number;
  subValue?: string;
}

interface AdminGameStatsProps {
  stats: Record<string, any>; // данные с контракта
}

const AdminGameStats: React.FC<AdminGameStatsProps> = (props) => {
  const {
    stats,
    stats: {
      tokenInfo,
      tokenInfo: {
        symbol: tokenSymbol
      }
    },
    onClick = () => {}
  } = props
  
  const formatTokenAmount = (amount) => {
    return fromWei(amount, tokenInfo.decimals) + ` ` + tokenSymbol
  };

  const formatPercent = (percent: number) => {
    return `${(Number(percent) / 100).toFixed(2)}%`;
  };

  const statItems: GameStat[] = [
    {
      title: 'Total Games',
      value: stats?.gamesCount || 0,
      key: 'totalGames',
      clickable: true
    },
    {
      title: 'Total Won Amount',
      value: stats?.totalWonAmount ? formatTokenAmount(stats.totalWonAmount) : '—',
    },
    {
      title: 'Total Lost Amount',
      value: stats?.totalLostAmount ? formatTokenAmount(stats.totalLostAmount) : '—',
    },
    {
      title: 'Game Bank',
      value: stats?.gameBank ? formatTokenAmount(stats.gameBank) : '—',
      key: 'gameBank',
      clickable: true
    },
    {
      title: 'Total Players',
      value: stats?.playersCount || 0,
      key: 'totalPlayers',
      clickable: true
    },
    {
      title: 'Total Player Deposit',
      value: stats?.totalPlayersDeposit ? formatTokenAmount(stats.totalPlayersDeposit) : '—',
    },
    {
      title: 'Token',
      value: stats?.tokenInfo?.symbol || '—',
      subValue: stats?.tokenInfo?.name,
    },
    {
      title: 'Owner',
      value: stats?.owner ? getShortAddress(stats?.owner, 6) : '—',
    },
    {
      title: 'Burn/Stake Percent',
      value: stats?.burnAndStakePercent ? formatPercent(stats.burnAndStakePercent) : '—',
      key: 'burnAndStakePercent',
      clickable: true
    },
    {
      title: 'Burn/Stake Address',
      value: stats?.burnAndStakeAddress ? getShortAddress(stats?.burnAndStakeAddress, 6) : '—',
      key: 'burnAndStakeAddress',
      clickable: true
    },
    {
      title: 'Token Address',
      value: stats?.tokenAddress ? getShortAddress(stats?.tokenAddress, 6) : '—',
    },
    {
      title: 'Pending Payouts',
      value: stats?.pendingBank ? formatTokenAmount(stats.pendingBank) : '—',
    },
    {
      title: 'Min Multiplier',
      value: stats?.minMultiplier ? fromWei(stats.minMultiplier) : '-',
      key: 'minMultiplier',
      clickable: true
    },
    {
      title: 'Max Multiplier',
      value: stats?.minMultiplier ? fromWei(stats.maxMultiplier) : '-',
      key: 'maxMultiplier',
      clickable: true
    },
    {
      title: 'Min Bet',
      value: stats?.minBet ? formatTokenAmount(stats.minBet) : '—',
      key: 'minBet',
      clickable: true,
    },
    {
      title: 'Max Bet',
      value: stats?.maxBet ? formatTokenAmount(stats.maxBet) : '—',
      key: 'maxBet',
      clickable: true
    },
  ];

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Game Statistics</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {statItems.map((item, index) => {
          return (
            <div
              key={index}
              className={`
                bg-gray-800 p-2 rounded-lg shadow border border-gray-700 hover:border-indigo-500 transition 
                ${item.clickable ? 'cursor-pointer' : ''}
              `}
              onClick={() => {
                if (item.clickable && item.key) {
                  onClick(item.key)
                }
              }}
            >
              <dt className="text-sm font-medium text-gray-400">{item.title}</dt>
              <dd className="mt-1 text-lg font-bold text-white">{item.value}</dd>
              {item.value2 && (
                <dd className="mt-1 text-lg font-bold text-white">{item.value2}</dd>
              )}
              {item.subValue && (
                <dd className="mt-1 text-xs text-gray-500">{item.subValue}</dd>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default AdminGameStats;