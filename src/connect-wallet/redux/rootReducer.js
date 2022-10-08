import { combineReducers } from "redux";
import modalSlice from "./modalSlice";
import kadenaSlice from "./kadenaSlice";
import bondingSlice from "./bondingSlice";

const rootReducer = combineReducers({
  kadenaInfo: kadenaSlice,
  connectWalletModal: modalSlice,
  bondingContract: bondingSlice,
});

export default rootReducer;