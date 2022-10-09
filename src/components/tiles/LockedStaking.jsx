
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment/moment';
import Tile from './Tile';
import FlexRow from '../FlexRow';
import { useEffect, useState } from 'react';
import { formatCountdown } from '../../utils/utils';
import { stake, unstake } from '../../connect-wallet/redux/userSlice';
import { toast } from 'react-toastify';


function LockedStaking(props) {
  const LOCKED_POOL_NAME = import.meta.env.VITE_STAKING_POOL_LOCKED_NAME;

  var timer
  const [time, setTime] = useState(Date.now());

  const dispatch = useDispatch();
  const poolData = useSelector(state => state.stakingContract.poolData);
  const bondsInWallet = useSelector(state => state.userInfo.bondsInWallet);
  const userStakedNfts = useSelector(state => state.userInfo.stakedNfts);

  const [pool, setPool] = useState({});
  const [stakedNftInfo, setStakedNftInfo] = useState({});
  const [countdown, setCountdown] = useState('');

  const stakeNfts = (event) => {
    event.preventDefault();
    let amount = Number(event.target[0].value);
    // console.log(amount);
    if (amount <= 0) {
      toast.error("Can't stake 0 or a negative number")
    }
    else {
      dispatch(stake(LOCKED_POOL_NAME, amount));
    }
  }

  const unstakeNfts = (event) => {
    event.preventDefault();
    let amount = Number(event.target[0].value);
    // console.log(amount);
    if (amount <= 0) {
      toast.error("Can't unstake 0 or a negative number")
    }
    else {
      dispatch(unstake(LOCKED_POOL_NAME, amount));
    }
  }

  useEffect(() => {
    let pool = poolData[LOCKED_POOL_NAME];
    setPool(pool || {});
  }, [poolData]);

  useEffect(() => {
    let stakedNftInfo = userStakedNfts[LOCKED_POOL_NAME];
    setStakedNftInfo(stakedNftInfo || {});
  }, [userStakedNfts]);

  useEffect(() => {
    timer = setInterval(() => setTime(Date.now()), 1000);
    setCountdown(formatCountdown('start-time' in pool ? new Date(pool['start-time']['time']) : Date.now()));
    return () => {
      clearInterval(timer);
    }
  });

  return (
    <Tile 
      title="LOCKED STAKING"
      className={props.className}
    >
      <div className="grow flex flex-col justify-between space-y-2">
        <FlexRow className="grow justify-around space-x-2 text-left">
          <div className="flex-1 flex flex-col justify-start space-y-4">
            <span>You may stake and unstake freely before the lock time. Time until lock:</span>
            <span className="text-xl font-bold">{countdown}</span>
            <span>After the pool locks, <b className="text-red-400">you cannot unstake your bond until it has matured</b>, but you will get a bonus!</span>
            <span className="text-xl font-bold">BONUS: ${'lock-bonus' in pool ? pool['lock-bonus'] : 0} DOC</span>
          </div>
          <div className="flex-1 flex flex-col justify-between space-y-2">
            <div className="flex-1 flex flex-col justify-between space-y-2">
              <span className="text-xl font-bold">Currently in Wallet: {bondsInWallet}</span>
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
              <span className="text-xl font-bold">Currently Staked: {'amount' in stakedNftInfo ? stakedNftInfo['amount'] : 0}</span>
              <form onSubmit={unstakeNfts}>
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
    </Tile>
  );
}

export default LockedStaking;