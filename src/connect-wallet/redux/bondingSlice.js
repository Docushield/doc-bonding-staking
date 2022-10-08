import { createSlice } from '@reduxjs/toolkit'
import { toast } from 'react-toastify';
import { createPactCommand, createSigningCommand, localCommand, signCommand } from '../utils/utils';

const X_WALLET = 'X_WALLET';
const ZELCORE = 'ZELCORE';

export const bondingSlice = createSlice({
  name: 'bondingContract',
  initialState: {
    contract: import.meta.env.VITE_CONTRACT_BONDING,
    poolName: import.meta.env.VITE_BONDING_POOL_NAME,
    tokenId: '',
    bondValue: 0,
    matureTime: Date.now(),
    status: '',
  },
  reducers: {
    setTokenId: (state, action) => {
      state.tokenId = action.payload;
    },
    setBondValue: (state, action) => {
      state.bondValue = action.payload;
    },
    setMatureTime: (state, action) => {
      state.matureTime = action.payload;
    },
    localSetStatus: (state, action) => {
      state.status = action.payload;
    },
  },
})

export const initData = () => {
  return async function init(dispatch, getState) {
    let contractName = getState().bondingContract.contract;
    let bondingPoolName = getState().bondingContract.poolName;
    let pactCode = `(${contractName}.get-pool-details "${bondingPoolName}")`;

    // let signingCmd = createSigningCommand(getState, pactCode, {});
    // console.log(signingCmd);
    // let signedCmd = await signCommand(getState, signingCmd);
    // console.log(signedCmd);
    // let pactCmd = createPactCommand(getState, pactCode, {});
    let result = await localCommand(getState, pactCode, {}); 
    console.log(result.result);
    
    if (result.result.status === 'success') {
      let data = result.result.data;
      console.log(data);
      dispatch(bondingSlice.actions.setTokenId(data['token-id']));
      dispatch(bondingSlice.actions.setBondValue(Number(data['token-value'])));
      dispatch(bondingSlice.actions.setMatureTime(Date(data['mature-time'])));
      dispatch(bondingSlice.actions.localSetStatus(data['status']));
    }        
    else {
      toast.error(`Failed to load contract data, error: ${result.message}.`);
    }
  }
}

export const { setNetwork, setNetworkId, setWallet, setAccount, setPubKey } = bondingSlice.actions

export default bondingSlice.reducer