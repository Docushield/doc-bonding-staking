
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import moment from 'moment/moment';
import TileWithAction from './TileWithAction';


function Claiming(props) {
  var timer
  const [time, setTime] = useState(Date.now());
  const [claimable, setClaimable] = useState(0.0);

  const dispatch = useDispatch();
  const userPoolData = useSelector(state => state.userInfo.poolData);

  useEffect(() => {
    timer = setInterval(() => setTime(Date.now()), 1000);
    setClaimable(getClaimableTokens());
    return () => {
      clearInterval(timer);
    }
  });

  function calculateClaimable(timeStart, apy, value, amount) {
    let totalTime = (time - timeStart) / 1000;
    return (totalTime * value * amount * apy / 31536000).toFixed(6);
  }

  function getClaimableTokens() {
    var claimable = 0.0;
    let lockedPool = import.meta.env.VITE_STAKING_POOL_LOCKED_NAME;
    let unlockedPool = import.meta.env.VITE_STAKING_POOL_UNLOCKED_NAME;
    let pools = [lockedPool, unlockedPool];
    for (var pool in pools) {
      if (pool in userPoolData) {
        let apy = userPoolData[lockedPool]['apy'];
        let value = userPoolData[lockedPool]['token-value'];
        let startTime = new moment(userPoolData[lockedPool]['stake-start-time']);
        let amount = userPoolData[lockedPool]['amount'];
        // If we are past the start time, we have stuff we can claim
        if (time > startTime) {
          claimable += calculateClaimable(startTime, apy, value, amount);
        }
        ownedBondsTotal += amount
      }
    }
    return claimable;
  }

  return (
    <TileWithAction 
      title="CLAIM"
      className={props.className} 
      actionName="CLAIM ALL"
      action=""
    >
      <div className="flex-1 flex flex-col justify-between place-items-center space-y-2">
        <span className="text-xl font-bold">PENDING REWARDS: {claimable}</span>
      </div>  
    </TileWithAction>
  );
}

export default Claiming;