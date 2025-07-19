import { useState, useEffect } from 'react'
import {
  MAINNET_CHAIN_ID,
  GAME_CONTRACT,
  BACKEND_WS
} from '@/config'

import CrashGameProvider from '@/contexts/CrashGameContext'

const RootWrapper = (props) => {
  const { children } = props
  
  return (
    <CrashGameProvider chainId={MAINNET_CHAIN_ID} contractAddress={GAME_CONTRACT} backendWS={BACKEND_WS}>
      {children}
    </CrashGameProvider>
  )
}


export default RootWrapper