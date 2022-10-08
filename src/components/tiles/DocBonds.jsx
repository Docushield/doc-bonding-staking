import { useDispatch, useSelector } from 'react-redux'
import { disconnectXWallet } from '../../connect-wallet/redux/kadenaSlice';
import { showModal } from '../../connect-wallet/redux/modalSlice';
import reduceToken from '../../connect-wallet/utils/reduceToken';
import CustomButton from '../CustomButton'

function DocBonds() {
  const account = useSelector(state => state.kadenaInfo.account);
  const dispatch = useDispatch();

  return (
    <div className="w-full flex flex-col justify-start space-y-4 p-4 h-96">
      <span className="text-5xl font-medium">
        $DOC BONDS
      </span>
      <div className="flex flex-col grow border-white border-2 justify-between place-items-center space-y-2">
        <span>VALUE: </span>
        <span>COLLECTION: </span>
        <span>NFT ID: </span>
        <span>BONDING ENDS: </span>
      </div>
    </div>
  )
}

export default DocBonds
