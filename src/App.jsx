import Navbar from './components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConnectWalletModal from './connect-wallet/components/ConnectWalletModal';
import { useSelector, useDispatch } from 'react-redux';
import Tile from './components/tiles/Tile';
import TileWithAction from './components/tiles/TileWithAction';
import CustomButton from './components/CustomButton';
import FlexRow from './components/FlexRow';
import { useEffect } from 'react';
import Bonding from './components/tiles/Bonding';
import { initBondingData } from './connect-wallet/redux/bondingSlice';
import { initPoolData } from './connect-wallet/redux/stakingSlice';
import Claiming from './components/tiles/Claiming';
import { initUserData } from './connect-wallet/redux/userSlice';
import LockedStaking from './components/tiles/LockedStaking';
import UnlockedStaking from './components/tiles/UnlockedStaking';


function App() {
  const dispatch = useDispatch();
  const account = useSelector(state => state.kadenaInfo.account);

  const unstakeNfts = (event) => {
    event.preventDefault();
  }

  async function init() {
    // Init all of our data
    await dispatch(initBondingData());
    await dispatch(initPoolData());
    await dispatch(initUserData());
  }

  useEffect(() => {
    if (account !== '') {
      init();
    }
  }, [account]);

  return (
    <div className="w-full flex flex-col items-center bg-slate-800">
      <div className="w-full max-w-5xl h-min min-h-screen flex flex-col text-white text-center bg-slate-800">
        <ToastContainer
          position="bottom-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <ConnectWalletModal/>
        <Navbar/>
        {account === '' ? (
          <div className="grow flex flex-col justify-center text-3xl">
            <p>WELCOME TO $DOC BONDING AND STAKING</p>
            <p>PLEASE CONNECT YOUR WALLET TO CONTINUE</p>
          </div>
        ) : (
          <div className="flex flex-col">
            <FlexRow>
              <Bonding className="w-64"/>
              <Claiming className="w-32"/>
            </FlexRow>
            <FlexRow>
              <LockedStaking/>
            </FlexRow>
            <FlexRow>
              <UnlockedStaking/>
            </FlexRow>
          </div>
        )}
      </div>
    </div>
    
  )
}

export default App
