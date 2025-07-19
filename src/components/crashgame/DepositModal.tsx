import React, { useState, useEffect } from 'react';
import { fromWei, toWei } from '@/helpers/wei'
import BigNumber from "bignumber.js"
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import { useConfirmationModal } from '@/components/ConfirmationModal'
import approveToken from '@/helpers/approveToken'
import depositTokens from '@/helpers_crashgame/depositTokens'
import { useNotification } from "@/contexts/NotificationContext";
import { getTransactionLink, getShortTxHash } from '@/helpers/etherscan'
import SwitchChainButton from '@/components/common/SwitchChainButton'

import {
  MAINNET_CHAIN_ID,
  GAME_CONTRACT
} from '@/config'

const DepositModal= (props) => {
  const {
    tokenInfo,
    tokenInfo: {
      allowance
    },
    playerInfo,
    onDeposit = () => {},
    onApprove = () => {}
  } = props
  
  const {
    closeModal
  } = useConfirmationModal()
  const { addNotification } = useNotification()
  
  const {
    injectedChainId,
    injectedAccount,
    injectedWeb3
  } = useInjectedWeb3()
  
  
  const isWrongChain = (MAINNET_CHAIN_ID !== injectedChainId) ? true : false

  const hasAllowance = true
  const [ amount, setAmount ] = useState<number | string>('')
  const [ isProcessing, setIsProcessing ] = useState(false)
  const [ needApprove, setNeedApprove ] = useState(false)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
      setAmount(value);
    }
  }

  const [ userAllowance, setUserAllowance ] = useState(allowance)
  

  useEffect(() => {
    if (new BigNumber(userAllowance).isGreaterThanOrEqualTo(toWei(amount, tokenInfo.decimals))) {
      setNeedApprove(true)
    } else {
      setNeedApprove(false)
    }
  }, [ amount, userAllowance ])
  
  const handleApprove = () => {
    const value = Number(amount);
    if (value > 0 && new BigNumber(toWei(value, tokenInfo.decimals)).isLessThanOrEqualTo(tokenInfo.balance)) {
      setIsProcessing(true)
      addNotification('info', `Approving ${tokenInfo.symbol}. Confirm transaction`)
      approveToken({
        activeWallet: injectedAccount,
        activeWeb3: injectedWeb3,
        tokenAddress: tokenInfo.tokenAddress,
        approveFor: GAME_CONTRACT,
        weiAmount: toWei(amount, tokenInfo.decimals),
        onTrx: (txHash) => {
          addNotification('info', 'Approving transaction', getTransactionLink(MAINNET_CHAIN_ID, txHash), getShortTxHash(txHash))
        },
        onSuccess: () => {
          addNotification('success', `Token ${tokenInfo.symbol} successfull approved`)
          setIsProcessing(false)
          onApprove()
          setUserAllowance(toWei(amount, tokenInfo.decimals))
        },
        onError: () => {
          addNotification('error', 'Fail approving')
          setIsProcessing(false)
        }
      }).catch((err) => {})
    }
  }


  const handleDeposit = () => {
    const value = Number(amount);
    if (value > 0 && new BigNumber(toWei(value, tokenInfo.decimals)).isLessThanOrEqualTo(tokenInfo.balance)) {
      setIsProcessing(true);
      addNotification('info', 'Depositing. Confirm transaction')
      depositTokens({
        activeWeb3: injectedWeb3,
        address: GAME_CONTRACT,
        amount: `0x` + new BigNumber(toWei(amount, tokenInfo.decimals)).toString(16),
        onTrx: (txHash) => {
          addNotification('info', 'Deposit transaction', getTransactionLink(MAINNET_CHAIN_ID, txHash), getShortTxHash(txHash))
        },
        onSuccess: () => {
          addNotification('success', `Successfull deposited`)
          onDeposit()
          closeModal('DEPOSIT_MODAL')
        },
        onError: () => {
          addNotification('error', 'Fail depositing')
          setIsProcessing(false)
        }
      }).catch((err) => {})
    }
  };

  return (
    <>
      {/* Баланс пользователя */}
      <div className="mb-2 text-right">
        <span className="text-sm text-gray-400">Your balance: {fromWei(tokenInfo.balance, tokenInfo.decimals)} {tokenInfo.symbol}</span>
      </div>

      {/* Поле ввода количества токенов */}
      <div className="mb-6">
        <input
          type="number"
          min="0"
          value={amount}
          onChange={handleChange}
          disabled={isProcessing}
          placeholder="Enter the number of tokens"
          className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-800 disabled:text-gray-500"
        />
      </div>

      {/* Кнопки Approve / Deposit */}
      <div className="space-y-3">
        {isWrongChain ? (
          <SwitchChainButton />
        ) : (
          <>
            {!needApprove ? (
              <button
                onClick={handleApprove}
                disabled={isProcessing || !amount}
                className={`w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center ${
                  isProcessing || !amount ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  'Approve'
                )}
              </button>
            ) : (
              <button
                onClick={handleDeposit}
                disabled={isProcessing || Number(amount) <= 0 || new BigNumber(tokenInfo.balance).isLessThan(toWei(amount, tokenInfo.decimals))}
                className={`w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center ${
                  isProcessing ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Depositing...</span>
                  </>
                ) : (
                  'Deposit'
                )}
              </button>
            )}
          </>
        )}

        <button
          onClick={() => { closeModal('DEPOSIT_MODAL') }}
          disabled={isProcessing}
          className={`w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition duration-200 ${
            isProcessing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Cancel
        </button>
      </div>
    </>
  );
};

export default DepositModal;