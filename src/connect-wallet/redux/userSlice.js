import { createSlice } from '@reduxjs/toolkit'
import { toast } from 'react-toastify';
import { createPactCommand, createSigningCommand, localCommand, signCommand } from '../utils/utils';

export const userSlice = createSlice({
  name: 'userInfo',
  initialState: {
    bondsInWallet: 0,
    ownedBonds: 0,
    poolData: {},
  },
  reducers: {
    setBondsInWallet: (state, action) => {
      state.bondsInWallet = action.payload;
    },
    setOwnedBonds: (state, action) => {
      state.ownedBonds = action.payload;
    },
    setPoolData: (state, action) => {
      state.poolData = action.payload;
    },
    updatePoolData: (state, action) => {
      state.poolData[action.pool][action.prop] = action.value;
    },
  },
})

export const { setBondsInWallet, setOwnedBonds, setPoolData } = userSlice.actions

export const initUserData = () => {
  return async function init(dispatch, getState) {
    // Get tokens in wallet
    let account = getState().kadenaInfo.account;
    let tokenId = getState().bondingContract.tokenId;
    var pactCode = `(marmalade.ledger.details "${tokenId}" "${account}")`;
    var result = await localCommand(getState, pactCode, {}); 
    var bondsInWallet = 0;
    // console.log("Got user mamarlade data");
    // console.log(result);
    
    if (result.result.status === 'success') {
      let data = result.result.data;
      bondsInWallet = data.balance;
      // console.log(data);
      dispatch(userSlice.actions.setBondsInWallet(bondsInWallet));
    }
    else {
      toast.error('User has no bonds.');
    }
    
    // Get staked tokens
    let stakingContract = getState().stakingContract.contract;
    pactCode = `(${stakingContract}.get-staked-nfts-for-account "${account}")`;
    result = await localCommand(getState, pactCode, {}); 
    // console.log("Got user mamarlade data");
    // console.log(result);
    var poolData = {};
    
    if (result.result.status === 'success') {
      let data = result.result.data;
      for (var [_, stakedNft] of Object.entries(data)) {
        poolData[stakedNft['pool-name']] = stakedNft;
      }
      // console.log('User Staked NFTS');
      // console.log(data);
      dispatch(userSlice.actions.setPoolData(poolData));
      // console.log('setting user data:');
      // console.log(poolData);
    }
    else {
      toast.error('User has nothing staked...?');
    }

    // Sum up total owned
    let lockedPool = import.meta.env.VITE_STAKING_POOL_LOCKED_NAME;
    let unlockedPool = import.meta.env.VITE_STAKING_POOL_UNLOCKED_NAME;
    let pools = [lockedPool, unlockedPool];
    var totalBonds = bondsInWallet;
    for (var poolName of pools) {
      if (poolName in poolData) {
        let amount = poolData[poolName]['amount'];
        totalBonds += amount
      }
    }
    // console.log('Total bonds:', totalBonds);
    dispatch(userSlice.actions.setOwnedBonds(totalBonds));

  }
}

export default userSlice.reducer;