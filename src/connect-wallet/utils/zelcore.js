import { mkReq, parseRes } from './utils';
import { WALLET } from './wallet';

const fetch = require('node-fetch');

const cmd = {
  asset: 'kadena',
};

const getAccounts = async () => {
  try {
    let res = await fetch(WALLET.ZELCORE.getAccountsUrl, mkReq(cmd));
    let pRes = await parseRes(res);
    return pRes;
  } catch (e) {
    return -1;
  }
};

const openZelcore = () => window.open('zel:', '_self');

export { getAccounts, openZelcore };
