import React, { useState, useEffect } from 'react';
import { fromWei, toWei } from '@/helpers/wei'
import BigNumber from "bignumber.js"
import { useConfirmationModal } from '@/components/ConfirmationModal'


const RoundInfoModal = (props) => {
  const {
    roundInfo
  } = props
  
  const {
    closeModal
  } = useConfirmationModal()
  
  return (
    <>
        <button
          onClick={() => { closeModal('ROUND_INFO_MODAL') }}
          disabled={isProcessing}
          className={`w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition duration-200 ${
            isProcessing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Close
        </button>
      </div>
    </>
  );
};

export default RoundInfoModal;