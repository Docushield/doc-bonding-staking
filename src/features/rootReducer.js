import { combineReducers } from "redux";
import modalSlice from "../connect-wallet/redux/modalSlice";
import kadenaSlice from "../connect-wallet/redux/kadenaSlice";
import bondingSlice from "./bondingSlice";
import stakingSlice from "./stakingSlice";
import userSlice from "./userSlice";

const rootReducer = combineReducers({
  kadenaInfo: kadenaSlice,
  connectWalletModal: modalSlice,
  bondingContract: bondingSlice,
  stakingContract: stakingSlice,
  userInfo: userSlice,
});

export default rootReducer;