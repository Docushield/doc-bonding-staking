import Pact from 'pact-lang-api';
import { createSlice } from '@reduxjs/toolkit'
import { toast } from 'react-toastify';
import { createPactCommand, createSigningCommand, listen, localCommand, sendCommand, signCommand } from '../connect-wallet/utils/utils';
import TxRenderer from '../components/TitleMessageRender';
import TitleMessageRender from '../components/TitleMessageRender';

export const userSlice = createSlice({
  name: 'userInfo',
  initialState: {
    bondsInWallet: 0,
    ownedBonds: 0,
    stakedNfts: {},
  },
  reducers: {
    setBondsInWallet: (state, action) => {
      state.bondsInWallet = action.payload;
    },
    setOwnedBonds: (state, action) => {
      state.ownedBonds = action.payload;
    },
    setStakedNfts: (state, action) => {
      state.stakedNfts = action.payload;
    },
    updateStakedNfts: (state, action) => {
      state.stakedNfts[action.payload.pool][action.payload.prop] = action.payload.value;
    },
  },
})

export const { setBondsInWallet, setOwnedBonds, setPoolData, updateStakedNfts } = userSlice.actions

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
      dispatch(userSlice.actions.setBondsInWallet(0));
    }
    
    // Get staked tokens
    let stakingContract = getState().stakingContract.contract;
    pactCode = `(${stakingContract}.get-staked-nfts-for-account "${account}")`;
    result = await localCommand(getState, pactCode, {}); 
    // console.log("Got user mamarlade data");
    // console.log(result);
    var stakedNfts = {};
    
    if (result.result.status === 'success') {
      let data = result.result.data;
      for (var [_, stakedNft] of Object.entries(data)) {
        stakedNfts[stakedNft['pool-name']] = stakedNft;
      }
      // console.log('User Staked NFTS');
      // console.log(data);
      dispatch(userSlice.actions.setStakedNfts(stakedNfts));
      // console.log('setting user data:');
      // console.log(poolData);
    }
    else {
      dispatch(userSlice.actions.setStakedNfts({}));
    }

    // Sum up total owned
    let lockedPool = import.meta.env.VITE_STAKING_POOL_LOCKED_NAME;
    let unlockedPool = import.meta.env.VITE_STAKING_POOL_UNLOCKED_NAME;
    let pools = [lockedPool, unlockedPool];
    var totalBonds = bondsInWallet;
    for (var poolName of pools) {
      if (poolName in stakedNfts) {
        let amount = stakedNfts[poolName]['amount'];
        totalBonds += amount
      }
    }
    // console.log('Total bonds:', totalBonds);
    dispatch(userSlice.actions.setOwnedBonds(totalBonds));
  }
}

export const stake = (pool, amount) => {
  return async function init(dispatch, getState) {
    // Get account information and create the signing command
    let account = getState().kadenaInfo.account;
    let pubKey = getState().kadenaInfo.pubKey;
    let contract = getState().stakingContract.contract;
    let poolEscrow = getState().stakingContract.poolData[pool]['escrow-account'];
    let tokenId = getState().stakingContract.poolData[pool]['token-id'];
    var pactCode = `(${contract}.stake "${pool}" "${account}" ${amount}.0 (read-keyset "ks"))`;
    var envData = {
      "ks": { "keys": [pubKey], "pred": "keys-all" }
    }
    var caps = [
      Pact.lang.mkCap('Gas', 
        'Pay for gas', 
        'coin.GAS', 
        [],
      ),
      Pact.lang.mkCap('Transfer', 
        'Transfer DOC Bonds to an escrow account', 
        'marmalade.ledger.TRANSFER', 
        [tokenId, account, poolEscrow, amount],
      ),
      Pact.lang.mkCap('Stake', 
        'Stake and claim funds', 
        `${contract}.STAKE`, 
        [pool, account, amount],
      ),
    ]
    // console.log(caps);
    
    let signingCommand = createSigningCommand(getState, pactCode, envData, caps);
    // console.log(signingCommand);
    let signedCmd = await signCommand(getState, signingCommand);
    // console.log(signedCmd);
    var result = await sendCommand(getState, signedCmd);
    console.log(result);
    
    let plurality = amount === 1 ? 'bond' : 'bonds'
    const id = toast.loading(<TitleMessageRender title={`Staking ${amount} ${plurality}.`} message={`TX ID: ${result.requestKeys[0]}`}/>, { type: toast.TYPE.INFO });
    result = await listen(getState, result.requestKeys[0]);
    // console.log(result);

    if (result.result.status === "success") {
      let currBondsInWallet = getState().userInfo.bondsInWallet;
      let stakedNfts = getState().userInfo.stakedNfts;
      var currStaked = 0;
      if (pool in stakedNfts) {
        currStaked = stakedNfts[pool]['amount'];
      }
      
      dispatch(userSlice.actions.updateStakedNfts({ 'pool': pool, prop: 'amount', value: currStaked + amount }));
      dispatch(userSlice.actions.setBondsInWallet(currBondsInWallet - amount));
      toast.update(id, { render: `Successfully staked ${amount} ${plurality}`, type: toast.TYPE.SUCCESS, isLoading: false, autoClose: 5000 });
    }
    else {
      toast.update(id, { render: <TitleMessageRender title="Error" message={`Failed to stake: ${result.result.error.message}`}/>, type: toast.TYPE.ERROR, isLoading: false, autoClose: 5000 });
    }
  }
}

export const unstake = (pool, amount) => {
  return async function init(dispatch, getState) {
    // Get account information and create the signing command
    let account = getState().kadenaInfo.account;
    let contract = getState().stakingContract.contract;
    var pactCode = `(${contract}.unstake "${pool}" "${account}" ${amount}.0)`;
    var envData = {
      // "ks": { "keys": [pubKey], "pred": "keys-all" }
    }
    var caps = [
      Pact.lang.mkCap('Gas', 
        'Pay for gas', 
        'coin.GAS', 
        [],
      ),
      Pact.lang.mkCap('Unstake', 
        'Unstake and claim funds', 
        `${contract}.UNSTAKE`, 
        [pool, account, amount],
      ),
    ]
    // console.log(caps);
    
    let signingCommand = createSigningCommand(getState, pactCode, envData, caps);
    // console.log(signingCommand);
    let signedCmd = await signCommand(getState, signingCommand);
    // console.log(signedCmd);
    var result = await sendCommand(getState, signedCmd);
    // console.log(result);

    let plurality = amount === 1 ? 'bond' : 'bonds'
    const id = toast.loading(<TitleMessageRender title={`Unstaking ${amount} ${plurality}.`} message={`TX ID: ${result.requestKeys[0]}`}/>, { type: toast.TYPE.INFO});
    result = await listen(getState, result.requestKeys[0]);
    // console.log(result);

    if (result.result.status === "success") {
      let stakedNfts = getState().userInfo.stakedNfts;
      var currStaked = 0;
      if (pool in stakedNfts) {
        currStaked = stakedNfts[pool]['amount'];
      }
      dispatch(userSlice.actions.updateStakedNfts({ 'pool': pool, prop: 'amount', value: currStaked - amount }))
      toast.update(id, { render: `Successfully unstaked ${amount} ${plurality}`, type: toast.TYPE.SUCCESS, isLoading: false, autoClose: 5000 });
    }
    else {
      toast.update(id, { render: <TitleMessageRender title="Error" message={`Failed to stake: ${result.result.error.message}`}/>, type: toast.TYPE.ERROR, isLoading: false, autoClose: 5000 });
    }
  }
}

export const claimAll = () => {
  return async function claimAll(dispatch, getState) {
    // Get account information and create the signing command
    let account = getState().kadenaInfo.account;
    let contract = getState().stakingContract.contract;
    let lockedPool = import.meta.env.VITE_STAKING_POOL_LOCKED_NAME;
    let unlockedPool = import.meta.env.VITE_STAKING_POOL_UNLOCKED_NAME;
    let stakedNfts = getState().userInfo.stakedNfts;
    var claimLocked = lockedPool in stakedNfts ? `(${contract}.claim "${lockedPool}" "${account}")` : "";
    var claimUnlocked = unlockedPool in stakedNfts ? `(${contract}.claim "${unlockedPool}" "${account}")` : "";
    var pactCode = `
    [
      ${claimLocked}
      ${claimUnlocked}
    ]
    `;
    // console.log(pactCode);
    var envData = {
      // "ks": { "keys": [pubKey], "pred": "keys-all" }
    }
    
    var caps = [
      Pact.lang.mkCap('Gas', 
        'Pay for gas', 
        'coin.GAS', 
        [],
      ),
      Pact.lang.mkCap('Claim', 
        `Claim funds from ${lockedPool}`, 
        `${contract}.CLAIM`, 
        [lockedPool, account],
      ),
      Pact.lang.mkCap('Claim', 
        `Claim funds from ${unlockedPool}`, 
        `${contract}.CLAIM`, 
        [unlockedPool, account],
      ),
    ]
    // console.log(caps);
    
    let signingCommand = createSigningCommand(getState, pactCode, envData, caps);
    // console.log(signingCommand);
    let signedCmd = await signCommand(getState, signingCommand);
    // console.log(signedCmd);
    var result = await sendCommand(getState, signedCmd);
    // console.log(result);

    const id = toast.loading(<TitleMessageRender title="Claiming tokens." message={`TX ID: ${result.requestKeys[0]}`}/>, { type: toast.TYPE.INFO});
    result = await listen(getState, result.requestKeys[0]);
    // console.log(result);

    if (result.result.status === "success") {
      // let currStaked = getState().userInfo.stakedNfts[pool]['amount'];
      // dispatch(userSlice.actions.updateStakedNfts({ 'pool': pool, prop: 'amount', value: currStaked - amount }))
      toast.update(id, { render: `Successfully claimed $DOC`, type: toast.TYPE.SUCCESS, isLoading: false, autoClose: 5000 });
    }
    else {
      toast.update(id, { render: <TitleMessageRender title="Error" message={`Failed to claim: ${result.result.error.message}`}/>, type: toast.TYPE.ERROR, isLoading: false, autoClose: 5000 });
    }
  }
}

export default userSlice.reducer;