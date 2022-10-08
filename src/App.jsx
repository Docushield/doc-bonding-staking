import Navbar from './components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConnectWalletModal from './connect-wallet/components/ConnectWalletModal';
import { useSelector, useDispatch } from 'react-redux';
import DocBonds from './components/tiles/DocBonds';
import Claiming from './components/tiles/Claiming';
import Tile from './components/tiles/Tile';
import CustomButton from './components/CustomButton';
import FlexRow from './components/FlexRow';
import Expanded from './components/Expanded';
import { useEffect } from 'react';
import Bonding from './components/Bonding';


function App() {
  const dispatch = useDispatch();
  const account = useSelector(state => state.kadenaInfo.account);

  const stakeNfts = (event) => {
    event.preventDefault();
    console.log(event);
  }

  const unstakeNfts = (event) => {
    event.preventDefault();
  }

  let claimUI = (
    <div className="flex-1 flex flex-col justify-between place-items-center space-y-2">
      <span className="text-xl font-bold">PENDING REWARDS: 12.012345 </span>
      <CustomButton
        text="CLAIM ALL"
        onClick=""
      />
    </div>
  );

  let lockedStakeUI = (
    <div className="grow flex flex-col justify-between space-y-2">
      <FlexRow className="grow justify-around space-x-2 text-left">
        <div className="flex-1 flex flex-col justify-start space-y-4">
          <span>If you stake into the locked pool, <b className="text-red-400">you cannot unstake your bond until it has matured</b>, but you will get a bonus!</span>
          <span className="text-xl font-bold">BONUS: 30,000 DOC</span>
          <span>You may stake and unstake freely before the lock time.</span>
          <span className="text-xl font-bold">TIME UNTIL LOCK: 10:11:05</span>
          <span className="text-xl font-bold">10 days, 11 hours, 5 minutes</span>
        </div>
        <div className="flex-1 flex flex-col justify-between space-y-2">
          <div className="flex-1 flex flex-col justify-between space-y-2">
            <span className="text-xl font-bold">Currently in Wallet: 2</span>
            <form onSubmit={stakeNfts}>
              <label>
                Stake Amount:
              </label>
              <FlexRow className="space-x-4">
                <input className="form-input flex-1 border-white border-2 bg-black min-w-0" 
                  type="number"
                  name="amount"
                  step="1"/>
                <input className="flex-1 border-white border-2 px-4 py-2 cursor-pointer ease-out duration-150 hover:border-red-400 active:border-red-700 focus:border-red-500" type="submit" value="STAKE"/>
              </FlexRow>
            </form>
          </div>
          <div className="flex-1 flex flex-col justify-between space-y-2">
            <span className="text-xl font-bold">Currently Staked: 2</span>
            <form onSubmit={stakeNfts}>
              <label>
                Unstake Amount:
              </label>
              <FlexRow className="space-x-4">
                <input className="form-input flex-1 border-white border-2 bg-black min-w-0" 
                  type="number"
                  name="amount"
                  step="1"/>
                <input className="flex-1 border-white border-2 px-4 py-2 cursor-pointer ease-out duration-150 hover:border-red-400 active:border-red-700 focus:border-red-500" type="submit" value="UNSTAKE"/>
              </FlexRow>
            </form>
          </div>
        </div>
      </FlexRow>
    </div>
  )

  let unlockedStakeUI = (
    <div className="grow flex flex-col justify-between space-y-2">
      <span>You can stake and unstake from the unlocked pool at any time once staking goes live and before the Bond matures, however you will receive no bonus.</span>
      <span>Time until staking goes live:</span>
      <span className="text-xl font-bold">10 days, 11 hours, 5 minutes</span>
    </div>
  )

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
              <Tile title="BONDING" className="w-64">
                <Bonding/>
              </Tile>
              <Tile title="CLAIM" className="w-32">
                {claimUI}
              </Tile>
            </FlexRow>
            <FlexRow>
              <Tile title="LOCKED STAKING">
                {lockedStakeUI}
              </Tile>
            </FlexRow>
            <FlexRow>
              <Tile title="UNLOCKED STAKING">
                {unlockedStakeUI}
              </Tile>
            </FlexRow>
          </div>
        )}
      </div>
    </div>
    
  )
}

export default App
