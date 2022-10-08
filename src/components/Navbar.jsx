import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ConnectWalletModal from '../connect-wallet/components/ConnectWalletModal';
import { disconnectXWallet } from '../connect-wallet/redux/kadenaSlice';
import { showModal } from '../connect-wallet/redux/modalSlice';
import reduceToken from '../connect-wallet/utils/reduceToken';
import CustomButton from './CustomButton'

function Navbar() {
  const account = useSelector(state => state.kadenaInfo.account);
  const dispatch = useDispatch();

  const openModal = () => {
    dispatch(showModal());
  }

  const disconnect = () => {
    dispatch(disconnectXWallet())
  }

  return (
    <nav className="w-full flex flex-row justify-between place-items-center p-4 h-40">
      <span className="text-7xl font-medium">
        $DOC
      </span>
      <div className="flex flex-col justify-between place-items-center space-y-2">
        <CustomButton 
          text={account === '' ? "Connect Wallet" : "Disconnect"}
          onClick={account === '' ? openModal : disconnect}/>
        {account !== '' && <span>{reduceToken(account)}</span>}
      </div>
      
      
      
    </nav>
  )
}

export default Navbar
