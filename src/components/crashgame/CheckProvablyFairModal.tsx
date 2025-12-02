import React, { useState, useEffect } from 'react';
import { fromWei, toWei } from '@/helpers/wei'
import BigNumber from "bignumber.js"
import { useConfirmationModal } from '@/components/ConfirmationModal'
import Web3 from 'web3'
const web3 = new Web3()

const CheckProvablyFairModal = (props) => {

  const { closeModal } = useConfirmationModal()

  const inputClass = "w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white placeholder-gray-500"
  const buttonClass = "w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center space-x-2"
  const [ random, setRandom ] = useState(``)

  const [ multiplier, setMultiplier ] = useState(``)
  const [ randomSalt, setRandomSalt ] = useState(``)
  const [ randomHash, setRandomHash ] = useState(false)
  const calcRandomHash = () => {
    try {
      const multiplierWei = web3.utils.toWei(new BigNumber(multiplier).toFixed(2))

      const encoded = web3.eth.abi.encodeParameters(
        ['uint256', 'bytes32'],
        [multiplierWei, randomSalt]
      );

      const hash = web3.utils.keccak256(encoded);

      setRandomHash(hash)
    } catch (err) {
      setRandomHash(false)
    }
  }
  return (
    <>
      <div className="pb-4">
        <code className="text-sm">
          <div>{`multiplier = multiplier * 18 ^ 10`}</div>
          <div>{`const encoded = web3.eth.abi.encodeParameters(`}</div>
          <div className="pl-8">{`['uint256', 'bytes32'],`}</div>
          <div className="pl-8">{`[multiplier, salt]`}</div>
          <div>{`);`}</div>
          <div>{`hash = web3.utils.keccak256(encoded);`}</div>
        </code>
      </div>
      <div>
        <span>Multiplier:</span>
        <input type="number"
          value={multiplier} onChange={(e) => { setMultiplier(e.target.value) }}
          className={inputClass} />
      </div>
      <div>
        <span>Salt (0x...)</span>
        <input type="text"
          value={randomSalt} onChange={(e) => { setRandomSalt(e.target.value) }}
          className={inputClass} />
      </div>
      <div className="pt-2">
        <button onClick={calcRandomHash} className={buttonClass}>Generete hash</button>
      </div>
      {randomHash && (
        <div>
          <span>Random Hash:</span>
          <input type="text"
            value={randomHash} readOnly={true}
            className={inputClass} />
        </div>
      )}
      <div className="pt-2">
        <button
          onClick={() => { closeModal('PROVABLY_FAIR_MODAL') }}
          className={`w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition duration-200`}
        >
          Close
        </button>
      </div>
    </>
  );
};

export default CheckProvablyFairModal;