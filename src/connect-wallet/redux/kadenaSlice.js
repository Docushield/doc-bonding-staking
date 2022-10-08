import { createSlice } from '@reduxjs/toolkit'
import { toast } from 'react-toastify';
import { hideModal } from './modalSlice';

const X_WALLET = 'X_WALLET';
const ZELCORE = 'ZELCORE';

export const kadenaSlice = createSlice({
  name: 'kadenaInfo',
  initialState: {
    network: import.meta.env.VITE_NETWORK, //process.env.NETWORK,
    networkId: import.meta.env.VITE_NETWORK_ID, //process.env.NETWORK_ID,
    chainId: import.meta.env.VITE_CHAIN_ID,
    gasLimit: Number(import.meta.env.VITE_GAS_LIMIT),
    gasPrice: Number(import.meta.env.VITE_GAS_PRICE),
    ttl: 600,
    wallet: '',
    account: '',
    pubKey: ''
  },
  reducers: {
    setNetwork: (state, action) => {
      state.network = action.payload;
    },
    setNetworkId: (state, action) => {
      state.networkId = action.payload;
    },
    setChainId: (state, action) => {
      state.chainId = action.payload;
    },
    setGasLimit: (state, action) => {
      state.gasLimit = action.payload;
    },
    setGasPrice: (state, action) => {
      state.gasPrice = action.payload;
    },
    setWallet: (state, action) => {
      state.wallet = action.payload;
    },
    setAccount: (state, action) => {
      state.account = action.payload;
    },
    setPubKey: (state, action) => {
      state.pubKey = action.payload;
    },
  },
})

export const connectXWallet = () => {
  return async function connectXWallet(dispatch, getState) {
    let accountResult = await kadena.request({
      method: "kda_connect",
      networkId: getState().kadenaInfo.networkId,
    });

    if (accountResult.status === 'fail') {
      console.log('Failing toast');
      toast.error(`Error: ${accountResult.message}. Make sure you are on ${getState().kadenaInfo.networkId}`);
    }
    else {
      dispatch(kadenaSlice.actions.setWallet(X_WALLET));
      dispatch(kadenaSlice.actions.setAccount(accountResult.account.account));
      dispatch(kadenaSlice.actions.setPubKey(accountResult.account.publicKey));
      dispatch(hideModal());
    }
  }
}

export const disconnectXWallet = () => {
  return async function disconnectXWallet(dispatch, getState) {
    let networkId = getState().kadenaInfo.networkId;
    let accountResult = await kadena.request({
      method: "kda_disconnect",
      networkId: networkId,
    });

    if (accountResult.status === 'fail') {
      console.log('Failing toast');
      toast.error(`Error: ${accountResult.message}\nMake sure you are on: ${networkId}`);
    }
    else {
      dispatch(kadenaSlice.actions.setAccount(""));
      dispatch(kadenaSlice.actions.setPubKey(""));
    }
  }
}

export const { setNetwork, setNetworkId, setWallet, setAccount, setPubKey } = kadenaSlice.actions

export default kadenaSlice.reducer