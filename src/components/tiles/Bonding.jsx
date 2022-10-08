
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment/moment';
import Tile from './Tile';


function Bonding(props) {
  const dispatch = useDispatch();
  const tokenId = useSelector(state => state.bondingContract.tokenId);
  const bondValue = useSelector(state => state.bondingContract.bondValue);
  const matureTime = useSelector(state => state.bondingContract.matureTime);
  const ownedBonds = useSelector(state => state.userInfo.ownedBonds);

  return (
    <Tile 
      title="BONDING"
      className={props.className}
    >
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
    </Tile>
  );
}

export default Bonding;