
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment/moment';
import Tile from './Tile';
import FlexRow from '../FlexRow';
import { useEffect, useState } from 'react';
import { formatCountdown } from '../../utils/utils';
import { stake, unstake } from '../../connect-wallet/redux/userSlice';


function StakingPool(props) {
  const POOL_NAMES = props.poolName;

  var timer
  const [time, setTime] = useState(Date.now());

  const dispatch = useDispatch();
  const poolData = useSelector(state => state.stakingContract.poolData);
  const bondsInWallet = useSelector(state => state.userInfo.bondsInWallet);
  const userStakedNfts = useSelector(state => state.userInfo.stakedNfts);

  const [pool, setPool] = useState({});
  const [isLockedPool, setIsLockedPool] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [hasStarted, setHasStarted] = useState(false);
  const [stakedNftInfo, setStakedNftInfo] = useState({});
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    // console.log(poolData);
    let pd = poolData[POOL_NAMES[1]];
    console.log(pd);
    if (!pd) {
      return;
    }
    setPool(pd || {});
  }, [poolData]);

  useEffect(() => {
    if (Object.keys(pool).length === 0) {
      return;
    }
    setIsLockedPool(pool['is-locked-pool']);
    let t = new Date(pool['start-time']['time']);
    setStartTime(t);
    setHasStarted(t < time);
  }, [pool]);

  useEffect(() => {
    var stakedNftInfo = {};
    for (var i = 0; i < POOL_NAMES.length; i++) {
      // If the pool exists in the user's staked nfts
      if (userStakedNfts[POOL_NAMES[i]] 
        && Object.entries(userStakedNfts[POOL_NAMES[i]]).length > 0) {
        // If the we have no staked info, copy the first pool we find that does
        // have info
        if (stakedNftInfo
          && Object.entries(stakedNftInfo).length === 0) {
          stakedNftInfo = JSON.parse(JSON.stringify(userStakedNfts[POOL_NAMES[i]]));
        }
        else { // Otherwise add the amount and the bonus
          stakedNftInfo.amount += userStakedNfts[POOL_NAMES[i]].amount;
          stakedNftInfo.bonus += userStakedNfts[POOL_NAMES[i]].bonus;
        }
      }
    }

    setStakedNftInfo(stakedNftInfo || {});
  }, [userStakedNfts]);

  useEffect(() => {
    timer = setInterval(() => { 
      setTime(Date.now());
      setHasStarted(startTime < time);
    }, 1000);
    setCountdown(formatCountdown(startTime));
    return () => {
      clearInterval(timer);
    }
  });
  
  const stakeNfts = (event) => {
    event.preventDefault();
    let amount = Number(event.target[0].value);
    // console.log(amount);
    if (amount <= 0) {
      toast.error("Can't stake 0 or a negative number")
    }
    else {
      dispatch(stake(POOL_NAMES[0], amount));
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
      dispatch(unstake(POOL_NAMES, amount));
    }
  }

  return (
    <Tile 
      title={props.title}
      className={props.className}
    >
      <div className="grow flex flex-col justify-between space-y-2">
        <FlexRow className="grow justify-around space-x-2 text-left">
          {isLockedPool ? 
            <div className="flex-1 flex flex-col justify-start space-y-4">
              <span>You may stake and unstake freely before the lock time. Time until lock:</span>
              <span className="text-xl font-bold">{hasStarted ? 'POOL LOCKED' : countdown}</span>
              <span>After the pool locks, <b className="text-red-400">you cannot unstake your bond until it has matured</b>, but you will get a bonus!</span>
              <span className="text-xl font-bold">BONUS: {'lock-bonus' in pool ? pool['lock-bonus'] : 0} $DOC</span>
            </div>
            :
            <div className="flex-1 flex flex-col justify-start space-y-4">
              <span>In the unlocked pool, you may stake and unstake at any time. Time until activation:</span>
              <span className="text-xl font-bold">{hasStarted ? 'PAYING INTEREST' : countdown}</span>
              <span>This pool provides no bonus.</span>
              <span className="text-xl font-bold">BONUS: NONE</span>
            </div>
          } 
          {!isLockedPool || !hasStarted ? 
            <div className="flex-1 flex flex-col justify-between space-y-2">
              <div className="flex-1 flex flex-col justify-between space-y-2">
                <div className="flex flex-row justify-between gap-2">
                  <span className="text-xl font-bold">Currently in Wallet: {bondsInWallet}</span>
                  <span className="text-xl font-bold">{pool['apy'] * 100}% APY</span>
                </div>
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
            : 
            <div className="flex-1 flex flex-col justify-center items-center">
              <span className='text-6xl'>POOL LOCKED</span>
            </div> 
          }
        </FlexRow>
      </div>
    </Tile>
  );
}

export default StakingPool;