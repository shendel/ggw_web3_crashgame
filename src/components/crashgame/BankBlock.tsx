import { useEffect, useState } from 'react'
import { useCrashGame } from '@/contexts/CrashGameContext'
import { fromWei } from '@/helpers/wei'
import BigNumber from "bignumber.js"
import Counter from '@/components/Counter'

const BankBlock = (props) => {
  const {
    tokenInfo,
    bankAmount
  } = useCrashGame()
  
  if (!tokenInfo || !tokenInfo.tokenAddress) return null

  return (
    <section className="bg-gray-900/60 border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col items-center justify-center max-w-xs mx-auto">
        <h3 className="text-lg font-semibold tracking-tight">
          {`Game Bank`}
        </h3>
        <p className="text-3xl font-bold text-indigo-400">
          <Counter
            value={new BigNumber(fromWei(bankAmount || 0, tokenInfo.decimals)).toFixed(2)}
          />
          {` `}
          <span className="text-sm font-normal text-gray-400">
            {tokenInfo.symbol}
          </span>
        </p>
      </div>
    </section>
  )
}


export default BankBlock