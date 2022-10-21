
import { useSelector, useDispatch } from 'react-redux';
import Tile from './Tile';
import { useEffect, useState } from 'react';


function MyBonds(props) {
  const LOCKED_POOL_NAME = import.meta.env.VITE_STAKING_POOL_LOCKED_NAME;
  const UNLOCKED_POOL_NAME = import.meta.env.VITE_STAKING_POOL_UNLOCKED_NAME;

  const dispatch = useDispatch();
  const account = useSelector(state => state.kadenaInfo.account);
  const bondValue = useSelector(state => state.bondingContract.bondValue);
  const ownedBonds = useSelector(state => state.userInfo.ownedBonds);

  const poolData = useSelector(state => state.stakingContract.poolData);
  const bondsInWallet = useSelector(state => state.userInfo.bondsInWallet);
  const userStakedNfts = useSelector(state => state.userInfo.stakedNfts);

  const [lockedPoolAmount, setLockedPoolAmount] = useState(0);
  const [unlockedPoolAmount, setUnlockedPoolAmount] = useState(0);

  useEffect(() => {
    if (LOCKED_POOL_NAME in userStakedNfts) {
      // console.log(userStakedNfts[LOCKED_POOL_NAME]['amount']);
      setLockedPoolAmount(userStakedNfts[LOCKED_POOL_NAME]['amount']);
    }
    if (UNLOCKED_POOL_NAME in userStakedNfts) {
      // console.log(userStakedNfts[UNLOCKED_POOL_NAME]['amount']);
      setUnlockedPoolAmount(userStakedNfts[UNLOCKED_POOL_NAME]['amount']);
    }
  }, [userStakedNfts]);

  return (
    <Tile 
      title="MY BONDS"
      className={props.className}
    >
      {account === '' ? <span className="text-xl"><b>PLEASE CONNECT YOUR WALLET TO SEE YOUR INFO</b></span> 
      :
      <div className="grow flex flex-row gap-2 justify-around text-left text-xl">
        <span><b>OWNED: {ownedBonds}</b></span>
        <span><b>TOTAL VALUE: ${ownedBonds * bondValue} DOC</b></span>
        <span><b>UNSTAKED: {bondsInWallet}</b></span>
        <span><b>LOCKED POOL: {lockedPoolAmount}</b></span>
        <span><b>UNLOCKED POOL: {unlockedPoolAmount}</b></span>
      </div>}
    </Tile>
  );
}

export default MyBonds;