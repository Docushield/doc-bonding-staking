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
    ownedBonds: 0
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
    localSetOwnedBonds: (state, action) => {
      state.ownedBonds = action.payload;
    }
  },
})

export const initBondingData = () => {
  return async function init(dispatch, getState) {
    let contractName = getState().bondingContract.contract;
    let bondingPoolName = getState().bondingContract.poolName;
    let pactCode = `(${contractName}.get-pool-details "${bondingPoolName}")`;
    let result = await localCommand(getState, pactCode, {}); 
    
    if (result.result.status === 'success') {
      let data = result.result.data;
      // console.log(data);
      dispatch(bondingSlice.actions.setTokenId(data['token-id']));
      dispatch(bondingSlice.actions.setBondValue(Number(data['token-value'])));
      dispatch(bondingSlice.actions.setMatureTime(new Date(data['mature-time'].time)));
      dispatch(bondingSlice.actions.localSetStatus(data['status']));
      dispatch(loadUserData());
    }
    else {
      toast.error(`Failed to load contract data, error: ${result.message}.`);
    }
  }
}

export const loadUserData = () => {
  return async function init(dispatch, getState) {
    let account = getState().kadenaInfo.account;
    let tokenId = getState().bondingContract.tokenId;
    let pactCode = `(marmalade.ledger.details "${tokenId}" "${account}")`;

    let result = await localCommand(getState, pactCode, {}); 
    console.log(result.result);
    
    if (result.result.status === 'success') {
      let data = result.result.data;
      console.log(data);
      dispatch(bondingSlice.actions.localSetOwnedBonds(data.balance));
    }        
    else {
      toast.error('User has no bonds.');
    }
  }
}

export const { setNetwork, setNetworkId, setWallet, setAccount, setPubKey } = bondingSlice.actions

export default bondingSlice.reducer;