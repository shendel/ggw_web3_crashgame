
import { useEffect, useState, Component } from "react"

import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import { useMarkDown } from '@/contexts/MarkDownContext'

import ConnectWalletButton from '@/components/ConnectWalletButton'

import MarkDownBlock from '@/components/MarkDownBlock'
import LoadingPlaceholder from '@/components/LoadingPlaceholder'

import BankBlock from '@/components/crashgame/BankBlock'
import DepositBlock from '@/components/crashgame/DepositBlock'
import ControlGameBlock from '@/components/crashgame/ControlGameBlock'
import MultiplierDisplay from '@/components/crashgame/MultiplierDisplay'
import CrashHistory from '@/components/crashgame/CrashHistory'

export default function Home(props) {
  const {
    gotoPage,
    params,
    on404
  } = props
  

  const {
    isConnected,
    injectedAccount
  } = useInjectedWeb3()

  /* --- */

  return (
    <>
      <main className="grid grid-cols-1 lg:grid-cols-4 gap-2 transition translate-y-2 pl-2 pr-2">
        
        {/*<!-- Aside -->*/}
        <aside className="space-y-2">
          <BankBlock />
          {/*<!-- Manage Funds -->*/}
          <DepositBlock />

          {/*<!-- Place Bet -->*/}
          <ControlGameBlock />
        </aside>
        
        {/*<!-- Live Graph -->*/}
        <section className="lg:col-span-2 bg-gray-900/60 border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="trending-up" class="lucide lucide-trending-up w-5 h-5 text-indigo-400"><path d="M16 7h6v6"></path><path d="m22 7-8.5 8.5-5-5L2 17"></path></svg>
            {`Live Crash`}
          </h2>
          <div className="mt-6 relative">
            <MultiplierDisplay />
            {/*
            <div className="h-72 sm:h-96">
              <div className="w-full h-full overflow-hidden rounded-xl bg-gray-800">
                <canvas id="crashChart" className="w-full h-full"></canvas>
              </div>
            </div>
            */}
            {/*
            <div id="currentMultiplierBadge" aria-live="polite" className={`
                absolute top-4 left-4 bg-gray-950/80 border border-white/10 backdrop-blur
                px-3 py-1.5 rounded-lg text-sm font-semibold tracking-wider select-none
              `}
            >{`🏆 1.43×`}</div>
            <div id="currentMultiplierBadge" aria-live="polite" className={`
                absolute top-4 left-4 bg-gray-950/80 border border-white/10 backdrop-blur
                px-3 py-1.5 rounded-lg text-sm font-semibold tracking-wider select-none
              `}
            >{`💥 1.33×`}</div>
            */}
          </div>
        </section>
        <aside className="space-y-6">
          {/*<!-- Past Crashes -->*/}
          <CrashHistory />
          {/*
          <section className="bg-gray-900/60 border border-white/5 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold tracking-tight">Past Crashes</h3>
            <ul id="historyList" class="mt-4 space-y-2 text-sm max-h-72 overflow-y-auto pr-1">
              <li class="flex items-center justify-between">
              <span class="font-medium text-green-400">1.43×</span>
              <span class="text-gray-500">01:35:45</span></li><li class="flex items-center justify-between">
              <span class="font-medium text-green-400">1.43×</span>
              <span class="text-gray-500">01:35:42</span></li><li class="flex items-center justify-between">
              <span class="font-medium text-green-400">1.27×</span>
              <span class="text-gray-500">01:35:24</span></li><li class="flex items-center justify-between">
              <span class="font-medium text-green-400">1.27×</span>
              <span class="text-gray-500">01:35:19</span></li><li class="flex items-center justify-between">
              <span class="font-medium text-green-400">1.31×</span>
              <span class="text-gray-500">01:35:15</span></li><li class="flex items-center justify-between">
              <span class="font-medium text-green-400">1.87×</span>
              <span class="text-gray-500">01:35:11</span></li><li class="flex items-center justify-between">
              <span class="font-medium text-red-400">1.91×</span>
              <span class="text-gray-500">01:35:07</span></li><li class="flex items-center justify-between">
              <span class="font-medium text-red-400">1.91×</span>
              <span class="text-gray-500">01:35:03</span></li>
            </ul>
          </section>
          */}
        </aside>
      </main>
    </>
  )
}
