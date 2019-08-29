import BigNumber from 'bignumber.js';

// Format number just like eth address
export function formatLikeEthAddress(value: number | Number) {
  const padding = 40;
  let s = String(Number(value).toString(16));
  while (s.length < padding) {
    s = '0' + s;
  }
  return '0x' + s;
}

// TODO: use BigInt and polyfill
export function toAtom(microatom: any): number {
  const denominator = new BigNumber(1000000) as any;
  return Number(microatom / denominator);
}
