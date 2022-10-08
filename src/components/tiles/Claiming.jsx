import { useDispatch, useSelector } from 'react-redux'
import { disconnectXWallet } from '../../connect-wallet/redux/kadenaSlice';
import { showModal } from '../../connect-wallet/redux/modalSlice';
import reduceToken from '../../connect-wallet/utils/reduceToken';
import CustomButton from '../CustomButton'

function Claiming() {
  const account = useSelector(state => state.kadenaInfo.account);
  const dispatch = useDispatch();

  return (
    <nav className="w-full flex flex-col justify-start space-y-4 p-4 h-96">
      <span className="text-5xl font-medium">
        REWARDS
      </span>
      <div className="flex flex-col grow border-white border-2 justify-between place-items-center space-y-2">
        <CustomButton
          text="CLAIM"
          onClick=""
        />
      </div>
    </nav>
  )
}

export default Claiming
