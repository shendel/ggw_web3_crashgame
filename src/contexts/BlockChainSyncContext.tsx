import { createContext, useContext, useState, useEffect } from "react"



const BlockChainSyncContext = createContext({
  timestamp: 0,
  syncTimestamp: () => {}
})

//BlockChainSyncContext.tsx