import { useEffect, useState, Component } from "react"
import { useMarkDown } from '@/contexts/MarkDownContext'

import ConnectWalletButton from '@/components/ConnectWalletButton'

import MarkDownBlock from '@/components/MarkDownBlock'
import LoadingPlaceholder from '@/components/LoadingPlaceholder'

import fetchSummaryGameInfo from '@/helpers_crashgame/fetchSummaryGameInfo'
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import { useConfirmationModal } from '@/components/ConfirmationModal'
import { useNotification } from "@/contexts/NotificationContext";
import { getTransactionLink, getShortTxHash } from '@/helpers/etherscan'
import fetchPlayers from '@/helpers_crashgame/fetchPlayers'
import BigNumber from "bignumber.js"
import { fromWei, toWei } from '@/helpers/wei'
import BackButton from '@/components/crashgame/BackButton'
import AdminPlayersTable from '@/components/crashgame/AdminPlayersTable'

import {
  MAINNET_CHAIN_ID,
  GAME_CONTRACT
} from '@/config'

export default function AdminPlayers(props) {
  const itemsPerPage = 20
  const {
    gotoPage,
    params,
    params: {
      page = 0
    },
    on404
  } = props


  const {
    isConnected,
    injectedAccount
  } = useInjectedWeb3()

  if (isNaN(Number(page))) return on404()
  
  const [ gameInfo, setGameInfo ] = useState(false)
  const [ tokenInfo, setTokenInfo ] = useState(false)
  
  useEffect(() => {
    fetchSummaryGameInfo({
      chainId: MAINNET_CHAIN_ID,
      address: GAME_CONTRACT
    }).then((answer) => {
      const { tokenInfo } = answer
      setGameInfo(answer)
      setTokenInfo(tokenInfo)
    }).catch((err) => {})
  }, [ MAINNET_CHAIN_ID, GAME_CONTRACT ])

  const [ playersCount, setPlayersCount ] = useState(0)
  const [ players, setPlayers ] = useState([])
  const [ isPlayersFetching, setIsPlayersFetching ] = useState(false)

  useEffect(() => {
    setIsPlayersFetching(true)
    fetchPlayers({
      chainId: MAINNET_CHAIN_ID,
      address: GAME_CONTRACT,
      offset: (page * itemsPerPage),
      limit: itemsPerPage
    }).then((answer) => {
      const {
        playersCount,
        players
      } = answer
      console.log('>>>> PLAYERS', players)
      setPlayers(players)
      setPlayersCount(playersCount)
      setIsPlayersFetching(false)
    }).catch((err) => {})
  }, [ page, MAINNET_CHAIN_ID, GAME_CONTRACT ])

  return (
    <>
      {!injectedAccount ? (
        <ConnectWalletButton />
      ) : (
        <>
          <div className="p-6 min-h-screen">
            <div className="mb-4">
              <BackButton gotoPage={gotoPage} />
            </div>
            <h2 className="text-xl font-bold mb-4">Players (Total {playersCount})</h2>
            {!gameInfo ? (
              <LoadingPlaceholder height="128px" />
            ) : (
              <AdminPlayersTable
                gotoPage={gotoPage}
                players={players}
                playersCount={playersCount}
                itemsPerPage={itemsPerPage}
                currentPage={Number(page) + 1}
                tokenInfo={tokenInfo}
                onPageNext={() => {
                  gotoPage('/admin/players/' + (Number(page) + 1))
                }}
                onPagePrev={() => {
                  gotoPage('/admin/players/' + (Number(page) - 1))
                }}
                chainId={MAINNET_CHAIN_ID}
              />
            )}
          </div>
        </>
      )}
    </>
  )
}
