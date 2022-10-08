
import { useSelector, useDispatch } from 'react-redux';
import { initData } from '../connect-wallet/redux/bondingSlice';
import { useEffect } from 'react';
import Expanded from './Expanded';


function Bonding() {
  const dispatch = useDispatch();
  const account = useSelector(state => state.kadenaInfo.account);
  const tokenId = useSelector(state => state.bondingContract.tokenId);
  const bondValue = useSelector(state => state.bondingContract.bondValue);
  const matureTime = useSelector(state => state.bondingContract.matureTime);
  const status = useSelector(state => state.bondingContract.status);

  useEffect(() => {
    if (account) {
      dispatch(initData());
    }
  }, [account]);

  return (
    <div className="grow flex flex-row space-x-2 text-left">
      <div className="flex-1 flex flex-col justify-between space-y-2">
        <Expanded>VALUE: ${bondValue} DOC</Expanded>
        <Expanded>COLLECTION: {tokenId}</Expanded>
        <Expanded>NFT ID: {tokenId}</Expanded>
      </div>
      <div className="flex-1 flex flex-col justify-around space-y-2">
        <span>OWNED: 3</span>
        <span>TOTAL VALUE: $300,000 DOC</span>
        <span>BOND MATURES: 2023-10-01</span>
      </div>
    </div>
  );
}

export default Bonding;