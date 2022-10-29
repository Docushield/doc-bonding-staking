export const formatCountdown = (end) => {
  var diff = end - Date.now();

  var msec = diff;
  var dd = Math.floor(msec / 1000 / 60 / 60 / 24);
  msec -= dd * 1000 * 60 * 60 * 24;
  var hh = Math.floor(msec / 1000 / 60 / 60);
  msec -= hh * 1000 * 60 * 60;
  var mm = Math.floor(msec / 1000 / 60);
  msec -= mm * 1000 * 60;
  var ss = Math.floor(msec / 1000);
  msec -= ss * 1000;

  return `${dd} days, ${hh} hours, ${mm} minutes`;
}

export const stakingPools = [
  import.meta.env.VITE_STAKING_POOL_LOCKED_NAME, 
  import.meta.env.VITE_STAKING_POOL_UNLOCKED_NAME,
  import.meta.env.VITE_STAKING_POOL_LOCKED_NAME_2,
  import.meta.env.VITE_STAKING_POOL_UNLOCKED_NAME_2
];