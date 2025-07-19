import { useEffect, useState, Component } from "react"
import { useMarkDown } from '@/contexts/MarkDownContext'

import ConnectWalletButton from '@/components/ConnectWalletButton'

import MarkDownBlock from '@/components/MarkDownBlock'
import LoadingPlaceholder from '@/components/LoadingPlaceholder'

import ContractEditor from '@/components/crashgame/adminforms/ContractEditor'
import GameBank from '@/components/crashgame/adminforms/GameBank'
import AdminGameStats from '@/components/crashgame/AdminGameStats'
import fetchSummaryGameInfo from '@/helpers_crashgame/fetchSummaryGameInfo'
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import { useConfirmationModal } from '@/components/ConfirmationModal'
import { useNotification } from "@/contexts/NotificationContext";
import { getTransactionLink, getShortTxHash, isValidEvmAddress } from '@/helpers/etherscan'
import BigNumber from "bignumber.js"
import { fromWei, toWei } from '@/helpers/wei'

import {
  MAINNET_CHAIN_ID,
  GAME_CONTRACT
} from '@/config'

export default function Admin(props) {
  const {
    gotoPage,
    params,
    on404
  } = props


  const {
    isConnected,
    injectedAccount
  } = useInjectedWeb3()

  const { openModal, closeModal } = useConfirmationModal()
  const [ gameStats, setGameStats ] = useState(false)
  const [ gameStatsNeedUpdate, setGameStatsNeedUpdate ] = useState(true)
  
  useEffect(() => {
    if (gameStatsNeedUpdate) {
      setGameStatsNeedUpdate(false)
      fetchSummaryGameInfo({
        chainId: MAINNET_CHAIN_ID,
        address: GAME_CONTRACT
      }).then((answer) => {
        console.log('>>> GAME STATS', answer)
        setGameStats(answer)
      }).catch((err) => {})
    }
  }, [ MAINNET_CHAIN_ID, GAME_CONTRACT, gameStatsNeedUpdate ] )
  
  
  const handleClickStats = (statKey) => {
    console.log('>>>> click game stats', statKey)
    let editContractTitle = ''
    let editContractValue = ''
    let editContractLabel = ''
    let editContractDescription = ''
    let editContractFunction = ''
    let editContractIsAddress = false
    let editContractBeforeSave = (value) => { return value }
    let editContractCheckError = (value) => { return false }
    switch (statKey) {
      case 'burnAndStakeAddress':
      case 'burnAndStakePercent':
      case 'minMultiplier':
      case 'maxMultiplier':
      case 'minBet':
      case 'maxBet':
        if (statKey == 'burnAndStakeAddress') {
          editContractTitle = 'Address for burn+stake'
          editContractValue = gameStats.burnAndStakeAddress
          editContractLabel = 'Address for Burn+stake on lose bet'
          editContractDescription = 'Enter the address where the tokens will be sent for further processing.'
          editContractFunction = 'setBurnAndStakeAddress'
          editContractIsAddress = true
          editContractBeforeSave = (value) => {
            return value
          }
          editContractCheckError = (value) => {
            if (!isValidEvmAddress(value)) return 'Enter valid EVM address'
            return false
          }
        }
        if (statKey == 'burnAndStakePercent') {
          editContractTitle = 'Edit burn+stake percent'
          editContractValue = gameStats.burnAndStakePercent / 100
          editContractLabel = 'Burn+stake percent on lose bet'
          editContractDescription = 'Enter the percentage that will be sent to staking and burning'
          editContractFunction = 'setBurnAndStakePercent'
          editContractBeforeSave = (value) => {
            return value * 100
          }
          editContractCheckError = (value) => {
            if (Number(value) < 0) return 'Value must be greater than zero'
            if (Number(value) > 100) return 'Value must be less than 100'
            return false
          }
        }
        if (statKey == 'minBet') {
          editContractTitle = 'Edit Mit Bet Amount'
          editContractValue = fromWei(gameStats.minBet, gameStats.tokenInfo.decimals)
          editContractDescription = 'Enter new amount'
          editContractFunction = 'setMinBet'
          editContractBeforeSave = (value) => {
            return `0x` + new BigNumber(toWei(value, gameStats.tokenInfo.decimals)).toString(16)
          }
          editContractCheckError = (value) => {
            if (Number(value) < 0) return 'Value must be greater than zero'
            if (new BigNumber(toWei(value, gameStats.tokenInfo.decimals)).isGreaterThan(gameStats.maxBet)) {
              return 'Min bet amount cant be greater than Max Bet Amount'
            }
            return false
          }
        }
        if (statKey == 'minMultiplier') {
          editContractTitle = 'Edit Min Bet Multiplier'
          editContractValue = fromWei(gameStats.minMultiplier)
          editContractDescription = 'Enter new min multiplier'
          editContractFunction = 'setMinMultiplier'
          editContractBeforeSave = (value) => {
            return toWei(value)
          }
          editContractCheckError = (value) => {
            if (Number(value) < 0) return 'Value must be greater than zero'
            return false
          }
        }
        if (statKey == 'maxMultiplier') {
          editContractTitle = 'Edit Max Bet Multiplier'
          editContractValue = fromWei(gameStats.maxMultiplier)
          editContractDescription = 'Enter new max multiplier'
          editContractFunction = 'setMaxMultiplier'
          editContractBeforeSave = (value) => {
            return toWei(value)
          }
          editContractCheckError = (value) => {
            if (Number(value) < 0) return 'Value must be greater than zero'
            return false
          }
        }
        if (statKey == 'maxBet') {
          editContractTitle = 'Edit Max Bet Amount'
          editContractValue = fromWei(gameStats.maxBet, gameStats.tokenInfo.decimals)
          editContractDescription = 'Enter new amount'
          editContractFunction = 'setMaxBet'
          editContractBeforeSave = (value) => {
            return `0x` + new BigNumber(toWei(value, gameStats.tokenInfo.decimals)).toString(16)
          }
          editContractCheckError = (value) => {
            if (Number(value) < 0) return 'Value must be greater than zero'
            if (new BigNumber(toWei(value, gameStats.tokenInfo.decimals)).isLessThan(gameStats.minBet)) {
              return 'Max bet amount cant be less than Min Bet Amount'
            }
            return false
          }
        }
        openModal({
          title: editContractTitle,
          hideBottomButtons: true,
          fullWidth: true,
          id: 'EDIT_CONTRACT_VALUE',
          content: (
            <ContractEditor
              currentValue={editContractValue}
              description={editContractDescription}
              contractFunction={editContractFunction}
              beforeSave={editContractBeforeSave}
              checkError={editContractCheckError}
              isAddress={editContractIsAddress}
              afterSave={() => { setGameStatsNeedUpdate(true) }}
            />
          )
        })
        break;
      case 'gameBank':
        openModal({
          title: 'Game Bank',
          hideBottomButtons: true,
          fullWidth: true,
          id: 'GAME_BANK_INFO',
          content: (
            <GameBank
              gameBank={gameStats.gameBank}
              tokenInfo={gameStats.tokenInfo}
              onBankUpdated={() => {
                setGameStatsNeedUpdate(true)
              }}
            />
          )
        })
        break;
      case 'totalPlayers':
        gotoPage('/admin/players')
        break;
      case 'totalGames':
        gotoPage('/admin/games')
        break;
      default:
    }
  }
  return (
    <>
      {!injectedAccount ? (
        <ConnectWalletButton />
      ) : (
        <>
          <div>
            <div className="items-center justify-center p-4 -min-w-screen">
              {gameStats && (
                <AdminGameStats stats={gameStats} onClick={handleClickStats} chainId={MAINNET_CHAIN_ID} />
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
