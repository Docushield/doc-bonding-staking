import { createSlice } from '@reduxjs/toolkit'
import { toast } from 'react-toastify';
import { localCommand } from '../utils/utils';


export const stakingSlice = createSlice({
  name: 'stakingContract',
  initialState: {
    contract: import.meta.env.VITE_CONTRACT_STAKING,
    poolData: {}
  },
  reducers: {
    setPoolData: (state, action) => {
      state.poolData = action.payload;
    }
  }
});

export const { 
  setPoolData, 
  setUserData, 
} = stakingSlice.actions

export const initPoolData = () => {
  return async function init(dispatch, getState) {
    let contractName = getState().stakingContract.contract;
    let pactCode = `(${contractName}.get-active-pools)`;
    let result = await localCommand(getState, pactCode, {}); 
    // console.log(result);
    
    if (result.result.status === 'success') {
      let data = result.result.data;
      // console.log(data);
      var poolInfo = {}
      let lockedPool = import.meta.env.VITE_STAKING_POOL_LOCKED_NAME;
      let unlockedPool = import.meta.env.VITE_STAKING_POOL_UNLOCKED_NAME;
      let poolNames = [lockedPool, unlockedPool];
      for (var poolName of poolNames) {
        for (var [_, value] of Object.entries(data)) {
          if (value['pool-name'] === poolName) {
            poolInfo[poolName] = value;
          }
        }
      }
      // console.log("Pool info");
      // console.log(poolInfo);
      dispatch(setPoolData(poolInfo));
    }
    else {
      toast.error(`Failed to load staking contract data, error: ${result.message}.`);
    }
  }
}

export default stakingSlice.reducer;