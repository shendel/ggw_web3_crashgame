import { useEffect, useState, Component } from "react"
import { useMarkDown } from '@/contexts/MarkDownContext'

import ConnectWalletButton from '@/components/ConnectWalletButton'

import MarkDownBlock from '@/components/MarkDownBlock'
import LoadingPlaceholder from '@/components/LoadingPlaceholder'

import fetchSummaryGameInfo from '@/helpers_crashgame/fetchSummaryGameInfo'
import fetchGames from '@/helpers_crashgame/fetchGames'
//import fetchPlayerGames from '@/helpers_flipgame/fetchPlayerGames'
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import { useConfirmationModal } from '@/components/ConfirmationModal'
import { useNotification } from "@/contexts/NotificationContext";
import { getTransactionLink, getShortTxHash } from '@/helpers/etherscan'
import BigNumber from "bignumber.js"
import { fromWei, toWei } from '@/helpers/wei'
import AdminGamesTable from '@/components/crashgame/AdminGamesTable'
import BackButton from '@/components/crashgame/BackButton'

import {
  MAINNET_CHAIN_ID,
  GAME_CONTRACT
} from '@/config'

export default function AdminGames(props) {
  const itemsPerPage = 20
  const {
    gotoPage,
    hashParts,
    params,
    params: {
      playerAddress = '',
      page = 0
    },
    on404
  } = props


  const isPlayerGames = (hashParts.join('/').toLowerCase() == 'admin/playergames') ? true : false

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
      console.log('>>> tokenInfo', answer)
      setGameInfo(answer)
      setTokenInfo(tokenInfo)
    }).catch((err) => {})
  }, [ MAINNET_CHAIN_ID, GAME_CONTRACT ])

  const [ games, setGames ] = useState([])
  const [ gamesCount, setGamesCount ] = useState(0)
  
  useEffect(() => {
    if (isPlayerGames) {
      /*
      fetchPlayerGames({
        playerAddress,
        chainId: MAINNET_CHAIN_ID,
        address: GAME_CONTRACT,
        offset: Number(page) * itemsPerPage,
        limit: itemsPerPage
      }).then((answer) => {
        const {
          games,
          gamesCount
        } = answer
        setGames(games)
        setGamesCount(gamesCount)
      }).catch((err) => {})
      */
    } else {
      fetchGames({
        chainId: MAINNET_CHAIN_ID,
        address: GAME_CONTRACT,
        offset: Number(page) * itemsPerPage,
        limit: itemsPerPage
      }).then((answer) => {
        const {
          games,
          gamesCount
        } = answer
        setGames(games)
        setGamesCount(gamesCount)
      }).catch((err) => {})
    }
  }, [ page, MAINNET_CHAIN_ID, GAME_CONTRACT, playerAddress ])

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
            <h2 className="text-xl font-bold mb-4">
              {isPlayerGames ? (
                <>Player {playerAddress} Games</>
              ) : (
                <>Games (Total {gamesCount})</>
              )}
            </h2>
            {isPlayerGames && (
              <h3 className="text-lg font-bold mb-4">
                Total Games: {gamesCount}
              </h3>
            )}
            {!gameInfo ? (
              <LoadingPlaceholder height="128px" />
            ) : (
              <AdminGamesTable
                gotoPage={gotoPage}
                isPlayerGames={isPlayerGames}
                games={games}
                gamesCount={gamesCount}
                itemsPerPage={itemsPerPage}
                currentPage={Number(page) + 1}
                tokenInfo={tokenInfo}
                onPageNext={() => {
                  gotoPage('/admin/games/' + (Number(page) + 1))
                }}
                onPagePrev={() => {
                  gotoPage('/admin/games/' + (Number(page) - 1))
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
