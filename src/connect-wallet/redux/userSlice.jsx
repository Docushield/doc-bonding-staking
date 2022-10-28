import Pact from 'pact-lang-api';
import { createSlice } from '@reduxjs/toolkit'
import { toast } from 'react-toastify';
import { createPactCommand, createSigningCommand, listen, localCommand, sendCommand, signCommand } from '../utils/utils';
import TxRenderer from '../../components/TitleMessageRender';
import TitleMessageRender from '../../components/TitleMessageRender';

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
    let pools = [
      import.meta.env.VITE_STAKING_POOL_LOCKED_NAME, 
      import.meta.env.VITE_STAKING_POOL_UNLOCKED_NAME,
      import.meta.env.VITE_STAKING_POOL_LOCKED_NAME_2,
      import.meta.env.VITE_STAKING_POOL_UNLOCKED_NAME_2
    ];
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
    var bondsInWallet = getState().userInfo.bondsInWallet;
    if (bondsInWallet < amount) {
      toast.error('You cannot stake more than you have in your wallet')
      return;
    }

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

export const unstake = (pools, amount) => {
  return async function init(dispatch, getState) {
    // Get staked amount and throw an error if they try to
    // unstake more than they have staked in these pools
    var stakedAmount = 0;
    for (var i = 0; i < pools.length; i++) {
      stakedAmount += getState().userInfo.stakedNfts[pools[i]].amount;
    }
    if (amount > stakedAmount) {
      toast.error('You cannot unstake more than you own')
      return;
    }

    // Get account information and create the signing command
    let account = getState().kadenaInfo.account;
    let contract = getState().stakingContract.contract;
    var pactCode = '[';
    var caps = [
      Pact.lang.mkCap('Gas', 
        'Pay for gas', 
        'coin.GAS', 
        [],
      )
    ]
    var a = amount;
    for (var i = 0; i < pools.length; i++) {
      // If this pool has nothing staked, skip it, save some gas
      let poolAmount = getState().userInfo.stakedNfts[pools[i]].amount;
      if (poolAmount == 0) {
        continue;
      }

      // If it does have something staked, then we unstake up to that amount
      let toUnstake = Math.min(a, poolAmount);
      a -= toUnstake;
      // Add the code and the appropriate cap
      pactCode += `(${contract}.unstake "${pools[i]}" "${account}" ${toUnstake}.0)\n`;
      caps.push(Pact.lang.mkCap('Unstake', 
        'Unstake and claim funds', 
        `${contract}.UNSTAKE`, 
        [pools[i], account, toUnstake],
      )); 

      // If we have counted up everything to unstake, we are good to go.
      if (a == 0) {
        break;
      }
    }
    pactCode += ']';
    var envData = {
      // "ks": { "keys": [pubKey], "pred": "keys-all" }
    }
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
    let pools = [
      import.meta.env.VITE_STAKING_POOL_LOCKED_NAME,
      import.meta.env.VITE_STAKING_POOL_UNLOCKED_NAME,
      import.meta.env.VITE_STAKING_POOL_LOCKED_NAME_2,
      import.meta.env.VITE_STAKING_POOL_UNLOCKED_NAME_2,
    ];
    let stakedNfts = getState().userInfo.stakedNfts;

    // Construct the to send
    var pactCode = '[';
    var caps = [
      Pact.lang.mkCap('Gas', 
        'Pay for gas', 
        'coin.GAS', 
        [],
      ),
    ]
    for (var i = 0; i < pools.length; i++) {
      if (pools[i] in stakedNfts) {
        pactCode += `(${contract}.claim "${pools[i]}" "${account}")`;
        caps.push(Pact.lang.mkCap('Claim', 
          `Claim funds from ${pools[i]}`, 
          `${contract}.CLAIM`, 
          [pools[i], account],
        ));
      }
    }
    // console.log(pactCode);
    var envData = {
      // "ks": { "keys": [pubKey], "pred": "keys-all" }
    }
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
      let now = (new Date(Date.now())).toISOString();
      for (var i = 0; i < pools.length; i++) {
        if (pools[i] in stakedNfts) {
          dispatch(userSlice.actions.updateStakedNfts({ 'pool': pools[i], prop: 'stake-start-time', value: now }));
        }
      }
      
      toast.update(id, { render: `Successfully claimed $DOC`, type: toast.TYPE.SUCCESS, isLoading: false, autoClose: 5000 });
    }
    else {
      toast.update(id, { render: <TitleMessageRender title="Error" message={`Failed to claim: ${result.result.error.message}`}/>, type: toast.TYPE.ERROR, isLoading: false, autoClose: 5000 });
    }
  }
}

export default userSlice.reducer;