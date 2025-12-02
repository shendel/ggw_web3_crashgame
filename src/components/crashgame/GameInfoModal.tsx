import React, { useState, useEffect } from 'react';
import { fromWei, toWei } from '@/helpers/wei'
import BigNumber from "bignumber.js"
import { useInjectedWeb3 } from '@/web3/InjectedWeb3Provider'
import { useConfirmationModal } from '@/components/ConfirmationModal'

const GameInfoModal = (props) => {
  const {
    gameInfo
  } = props

  const { closeModal } = useConfirmationModal()

  const inputClass = "w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder-gray-500"

  console.log('[gameInfo]', gameInfo)
  return (
    <>
      <div>
        <span>Round id:</span>
        <input type="text"
          value={gameInfo.roundId} readOnly={true}
          className={inputClass} />
      </div>
      <div>
        <span>Crash Multiplier:</span>
        <input type="text"
          value={fromWei(gameInfo.multiplier)} readOnly={true}
          className={inputClass} />
      </div>
      <div>
        <span>Salt:</span>
        <input type="text"
          value={gameInfo.multiplierSalt} readOnly={true}
          className={inputClass} />
      </div>
      <div>
        <span>Hash:</span>
        <input type="text"
          value={gameInfo.multiplierHash} readOnly={true}
          className={inputClass} />
      </div>
      <div className="pt-2">
        <button
          onClick={() => { closeModal('GAME_INFO') }}
          className={`w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition duration-200`}
        >
          Close
        </button>
      </div>
    </>
  );
};

export default GameInfoModal;