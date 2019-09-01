import BigNumber from 'bignumber.js';
import {BlockatlasValidator} from '@trustwallet/rpc/lib/blockatlas/models/BlockatlasValidator';

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

export function selectValidatorWithBestInterestRate(validators: BlockatlasValidator[]) {
  return validators.reduce((maxRate: number, validator: BlockatlasValidator) => {
    return maxRate < validator.reward.annual
      ? validator.reward.annual
      : maxRate;
  }, 0);
}
