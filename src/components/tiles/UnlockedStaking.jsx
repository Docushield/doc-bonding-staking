
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment/moment';
import Tile from './Tile';
import FlexRow from '../FlexRow';
import { useEffect, useState } from 'react';
import { formatCountdown } from '../../utils/utils';


function UnlockedStaking(props) {
  var timer
  const [time, setTime] = useState(Date.now());

  const dispatch = useDispatch();
  const poolData = useSelector(state => state.stakingContract.poolData);

  const [pool, setPool] = useState({});
  const [countdown, setCountdown] = useState('');

  const stakeNfts = (event) => {
    event.preventDefault();
    console.log(event);
  }

  useEffect(() => {
    let pool = poolData[import.meta.env.VITE_STAKING_POOL_LOCKED_NAME];
    setPool(pool || {});
  }, [poolData]);

  useEffect(() => {
    timer = setInterval(() => setTime(Date.now()), 1000);
    setCountdown(formatCountdown('start-time' in pool ? new Date(pool['start-time']['time']) : Date.now()));
    return () => {
      clearInterval(timer);
    }
  });

  return (
    <Tile 
      title="UNLOCKED STAKING"
      className={props.className}
    >
      <div className="grow flex flex-col justify-between space-y-2">
        <span>You can stake and unstake from the unlocked pool at any time once staking goes live and before the Bond matures, however you will receive no bonus.</span>
        <span>Time until staking goes live:</span>
        <span className="text-xl font-bold">{countdown}</span>
      </div>
    </Tile>
  );
}

export default UnlockedStaking;