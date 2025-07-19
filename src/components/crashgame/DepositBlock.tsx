import { useEffect, useState } from 'react'
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import { useCrashGame } from '@/contexts/CrashGameContext'
import { useConfirmationModal } from '@/components/ConfirmationModal'
import { fromWei } from '@/helpers/wei'
import BigNumber from "bignumber.js"
import DepositIcon from '@/components/crashgame/svg/DepositIcon'
import WithdrawIcon from '@/components/crashgame/svg/WithdrawIcon'

import DepositModal from '@/components/crashgame/DepositModal'
import WithdrawModal from '@/components/crashgame/WithdrawModal'

import Counter from '@/components/Counter'

const DepositBlock = (props) => {
  const {
    isConnected,
    injectedAccount
  } = useInjectedWeb3()

  const {
    tokenInfo,
    playerInfo,
    updatePlayerInfo,
    updateTokenInfo,
    activePlayerBet,
    activePlayerCashOut,
  } = useCrashGame()
  
  const {
    openModal
  } = useConfirmationModal()

  const handleWithdraw = () => {
    openModal({
      title: `Withdraw Deposit`,
      hideBottomButtons: true,
      fullWidth: true,
      id: 'WITHDRAW_MODAL',
      content: (
        <WithdrawModal
          tokenInfo={tokenInfo}
          playerInfo={playerInfo}
          onWithdraw={() => {
            updatePlayerInfo()
            updateTokenInfo()
          }}
        />
      )
    })
  }
  
  const handleDeposit = () => {
    openModal({
      title: `Deposit replenishment`,
      hideBottomButtons: true,
      fullWidth: true,
      id: 'DEPOSIT_MODAL',
      content: (
        <DepositModal
          tokenInfo={tokenInfo}
          playerInfo={playerInfo}
          onDeposit={() => {
            updatePlayerInfo()
            updateTokenInfo()
          }}
          onApprove={() => {
            updateTokenInfo()
          }}
        />
      )
    })
  }
  if (!isConnected) return null

  return (
    <section className="bg-gray-900/60 border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col items-center justify-center max-w-xs mx-auto">
        <h3 className="text-lg font-semibold tracking-tight">
          {`Your Deposit Balance`}
        </h3>
        <p className="text-3xl font-bold text-indigo-400">
          <Counter
            value={new BigNumber(fromWei(playerInfo.depositAmount || 0, tokenInfo.decimals)).toFixed(2)}
          />
          {` `}
          <span className="text-sm font-normal text-gray-400">
            {tokenInfo.symbol}
          </span>
        </p>
        {/*
        <p className={`
          text-sm font-bold
          ${activePlayerBet && !activePlayerCashOut ? 'text-red-400' : ''}
          ${activePlayerCashOut ? 'text-green-400' : ''}
          `}
        >
          <Counter
            value={
              (activePlayerCashOut)
                ? fromWei(activePlayerCashOut, tokenInfo.decimals)
                : (activePlayerBet)
                  ? new BigNumber(fromWei(activePlayerBet, tokenInfo.decimals)).multipliedBy(-1).toFixed(2)
                  : 0
            }
            showPlus={true}
            hideOnZero={true}
            prefix={` ${tokenInfo.symbol}`}
          />
        </p>
        */}
        {/*
        {activePlayerBet ||activePlayerCashOut && (
          <p className="text-sm font-bold text-red-400">
            {`-`}{fromWei(activePlayerBet, tokenInfo.decimals)}
            {` `}{tokenInfo.symbol}
          </p>
        )}
        {activePlayerCashOut && (
          <p className="text-sm font-bold text-green-400">
            {`+`}{fromWei(activePlayerCashOut, tokenInfo.decimals)}
            {` `}{tokenInfo.symbol}
          </p>
        )}
        */}
      </div>
      {/*<!-- Deposit / Withdraw Buttons -->*/}
      <div className="grid grid-cols-2 gap-3">
        <button id="depositBtn" className={`
            w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] transition
            text-white font-semibold rounded-lg py-2 flex items-center justify-center gap-2 
           focus-visible:outline-2 focus-visible:outline-indigo-500
           `}
          onClick={handleDeposit}
        >
          <DepositIcon />
          <span>Deposit</span>
        </button>
        <button id="withdrawBtn" className={`
            w-full bg-rose-600 hover:bg-rose-500 active:scale-[0.97] transition
            text-white font-semibold rounded-lg py-2 flex items-center justify-center gap-2 
            focus-visible:outline-2 focus-visible:outline-rose-500
          `}
          onClick={handleWithdraw}
        >
          <WithdrawIcon />
          <span>Withdraw</span>
        </button>
      </div>
    </section>
  )
}


export default DepositBlock