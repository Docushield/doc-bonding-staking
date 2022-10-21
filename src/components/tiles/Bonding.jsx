
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment/moment';
import Tile from './Tile';
import { useEffect, useState } from 'react';
import { formatCountdown } from '../../utils/utils';


function Bonding(props) {
  const dispatch = useDispatch();
  
  const bondValue = useSelector(state => state.bondingContract.bondValue); 
  const matureTime = useSelector(state => state.bondingContract.matureTime);
  
  const [countdown, setCountdown] = useState('');

  var timer
  const [time, setTime] = useState(Date.now());
  useEffect(() => {
    timer = setInterval(() => { 
      setCountdown(formatCountdown(matureTime));
    }, 1000);
    return () => {
      clearInterval(timer);
    }
  });

  return (
    <Tile 
      title="BONDING"
      className={props.className}
    >
      <div className="grow flex flex-col gap-2 items-stretch text-left">
        <div className="flex-1 flex flex-row justify-around gap-2 py-2">
          <span>VALUE: ${bondValue} DOC</span>
          <span>COLLECTION: doc-bond-nft</span>
        </div>
        <div className="flex-1 flex flex-col justify-around text-center">
          <span className="text-xl"><b>BOND MATURES: {countdown}</b></span>
        </div>
      </div>
    </Tile>
  );
}

export default Bonding;