import Pact from 'pact-lang-api';

export const creationTime = () => String(Math.round(new Date().getTime() / 1000) - 10);

export const createPactCommand = (getState, pactCode, envData) => {
  let kadenaSliceState = getState().kadenaInfo;
  return {
    networkId: kadenaSliceState.networkId,
    payload: {
      exec: {
        data: envData,
        code: pactCode,
      }
    },
    signers: [
      {
        pubKey: kadenaSliceState.pubKey
      }
    ],
    meta: {
      chainId: kadenaSliceState.chainId,
      gasLimit: kadenaSliceState.gasLimit,
      gasPrice: kadenaSliceState.gasPrice,
      sender: kadenaSliceState.account,
      ttl: kadenaSliceState.ttl,
      creationTime: creationTime(),
    }
  }
}

export const createSigningCommand = (getState, pactCode, envData) => {
  let kadenaSliceState = getState().kadenaInfo;
  return {
    pactCode: pactCode,
    envData: envData,
    sender: kadenaSliceState.account,
    networkId: kadenaSliceState.networkId,
    chainId: kadenaSliceState.chainId,
    gasLimit: kadenaSliceState.gasLimit,
    gasPrice: kadenaSliceState.gasPrice,
    signingPubKey: kadenaSliceState.pubKey,
    ttl: kadenaSliceState.ttl,
  }
}

export const signCommand = async function (getState, signingCmd) {
  let networkId = getState().kadenaInfo.networkId;
  let req = {
    method: "kda_requestSign",
    networkId: networkId,
    data: {
        networkId: networkId,
        signingCmd: signingCmd
    }
  }
  var cmd = await kadena.request(req);

  if (cmd.status === "success") {
    return cmd.signedCmd;
  }
  else {
    toast.error(`Failed to sign: ${cmd}`);
  }
}

export const localCommand = async function (getState, pactCode, envData) {
  let kadenaInfo = getState().kadenaInfo;
  let cmd = {
    keyPairs: [
      // No key pairs for no sigs
    ],
    pactCode: pactCode,
    envData: envData,
    nonce: creationTime(),
    meta: {
      chainId: kadenaInfo.chainId,
      gasLimit: kadenaInfo.gasLimit,
      gasPrice: kadenaInfo.gasPrice,
      sender: kadenaInfo.account,
      ttl: kadenaInfo.ttl,
      creationTime: creationTime(),
    }
  }
  let res = await Pact.fetch.local(cmd, kadenaInfo.network);
  return res;
}

export const mkReq = function (cmd) {
  return {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(cmd),
  };
};

export const parseRes = async function (raw) {
  const rawRes = await raw;
  const res = await rawRes;
  if (res.ok) {
    const resJSON = await rawRes.json();
    return resJSON;
  } else {
    const resTEXT = await rawRes.text();
    return resTEXT;
  }
};

export const wait = async (timeout) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};

export const handleError = (error) => {
  console.log(`ERROR: ${JSON.stringify(error)}`);
  return { errorMessage: 'Unhandled Exception' };
};

Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('');
};

Date.prototype.yyyy_mm_dd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('-');
};

// export const listen = async (reqKey) => {
//   let time = 500;
//   let pollRes;
//   while (time > 0) {
//     await wait(5000);
//     pollRes = await Pact.fetch.poll({ requestKeys: [reqKey] }, NETWORK);
//     if (Object.keys(pollRes).length === 0) {
//       time = time - 5;
//     } else {
//       time = 0;
//     }
//   }
//   if (pollRes && pollRes[reqKey]) {
//     return pollRes[reqKey];
//   }
//   return null;
// };
