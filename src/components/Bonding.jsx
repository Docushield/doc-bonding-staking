
import { useSelector, useDispatch } from 'react-redux';
import { initBondingData, loadUserData } from '../connect-wallet/redux/bondingSlice';
import { useEffect } from 'react';
import Expanded from './Expanded';
import moment from 'moment/moment';


function Bonding() {
  const dispatch = useDispatch();
  const account = useSelector(state => state.kadenaInfo.account);
  const tokenId = useSelector(state => state.bondingContract.tokenId);
  const bondValue = useSelector(state => state.bondingContract.bondValue);
  const matureTime = useSelector(state => state.bondingContract.matureTime);
  const ownedBonds = useSelector(state => state.bondingContract.ownedBonds);

  useEffect(() => {
    if (account !== '') {
      dispatch(initBondingData());
    }
  }, [account]);

  return (
    <div className="grow flex flex-row space-x-2 text-left">
      <div className="flex-1 flex flex-col justify-between space-y-2">
        <span>VALUE: ${bondValue} DOC</span>
        <span>COLLECTION: {tokenId}</span>
        <span>OWNED: {ownedBonds}</span>
      </div>
      <div className="flex-1 flex flex-col justify-around space-y-2">
        <span>NFT ID: {tokenId}</span>
        <span>BOND MATURES: {moment(matureTime).utc().format('yyyy-MM-DD')}</span>
        <span>TOTAL VALUE: ${ownedBonds * bondValue} DOC</span>
      </div>
    </div>
  );
}

export default Bonding;