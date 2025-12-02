
import { useEffect, useState, Component } from "react"

import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import { useConfirmationModal } from '@/components/ConfirmationModal'
import { useMarkDown } from '@/contexts/MarkDownContext'

import ConnectWalletButton from '@/components/ConnectWalletButton'

import MarkDownBlock from '@/components/MarkDownBlock'
import LoadingPlaceholder from '@/components/LoadingPlaceholder'

import BankBlock from '@/components/crashgame/BankBlock'
import DepositBlock from '@/components/crashgame/DepositBlock'
import ControlGameBlock from '@/components/crashgame/ControlGameBlock'
import MultiplierDisplay from '@/components/crashgame/MultiplierDisplay'
import CrashHistory from '@/components/crashgame/CrashHistory'
import CheckProvablyFairModal from '@/components/crashgame/CheckProvablyFairModal'

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

  const {
    openModal
  } = useConfirmationModal()
  
  const handleOpenCheckProvablyFair = () => {
    openModal({
      title: `Check Provably Fair`,
      hideBottomButtons: true,
      fullWidth: true,
      id: 'PROVABLY_FAIR_MODAL',
      content: (
        <CheckProvablyFairModal />
      )
    })
  }
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
          </div>
        </section>
        <aside className="space-y-6">
          {/*<!-- Past Crashes -->*/}
          <CrashHistory />
          <button className={`
              mt-6 w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] transition
              text-white font-semibold rounded-lg py-2 flex items-center justify-center gap-2
              focus-visible:outline-2 focus-visible:outline-indigo-500
              disabled:scale-[1]
              disabled:bg-gray-800
              disabled:text-gray-300
              relative
            `}
            onClick={handleOpenCheckProvablyFair}
          >
            Check Provably Fair
          </button>
        </aside>
      </main>
    </>
  )
}
