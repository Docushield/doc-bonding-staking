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
import backgroundVideo from './assets/redswirl.mp4';
import StakingPool from './components/tiles/StakingPool';
import MyBonds from './components/tiles/MyBonds';


function App() {
  
  const dispatch = useDispatch();
  const account = useSelector(state => state.kadenaInfo.account);

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
    <div className="w-full flex flex-col items-center">
      
      <div className="w-full max-w-5xl h-min min-h-screen flex flex-col text-white text-center">
        <div className="fixed left-0 top-0 min-h-screen min-w-full -z-10">
          <video autoPlay muted playsInline loop className="object-fill h-screen w-screen">
            <source src={backgroundVideo} type="video/mp4"/>
          </video>
        </div>
        <ToastContainer
          position="bottom-right"
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
          <div className="flex flex-col">
            <FlexRow>
              <MyBonds/>
            </FlexRow>
            <FlexRow>
              <Bonding className="w-64"/>
              <Claiming className="w-32"/>
            </FlexRow>
            <FlexRow>
              <StakingPool 
                title="LOCKED STAKING"
                poolName={import.meta.env.VITE_STAKING_POOL_LOCKED_NAME}/>
            </FlexRow>
            <FlexRow>
            <StakingPool 
                title="UNLOCKED STAKING"
                poolName={import.meta.env.VITE_STAKING_POOL_UNLOCKED_NAME}/>
            </FlexRow>
          </div>
      </div>
    </div>
    
  )
}

export default App
