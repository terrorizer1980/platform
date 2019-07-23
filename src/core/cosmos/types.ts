import BigNumber from 'bignumber.js';

export const GAS_LIMIT = '200000';

export enum pubKeyType {
  secp256k1 = 'tendermint/PubKeySecp256k1',
}

export enum denom {
  uatom = 'uatom',
  stake = 'stake',
}

export enum msgType {
  send = 'cosmos-sdk/MsgSend',
  delegate = 'cosmos-sdk/MsgDelegate',
}
export enum txMode {
  sync = 'sync',
  async = 'async',
  block = 'block',
}

export interface Validator {
  status: boolean;
  name: string;
  description: string;
  website: string;
  address: Address; // TODO add validation
  pubkey: PublicKey; // TODO add validation
}

export interface Transaction {
  id: string;
  coin: number; // TODO Add Coin Type
  from: Address; // TODO add validation
  to: Address; // TODO add validation
  fee: BigNumber;
  date: Date;
  block: number;
  status: string; // TODO add enum -> "Completed"
  type: string; // TODO add enum -> "Transfer"
  memo: string;
  value: BigNumber;
}

export interface Delegation {
  delegatorAddress: string;
  validatorAddress: string;
  shares: BigNumber;
}

export interface Account {
  address: string; // TODO add address type / validation
  coinsDenom: string; // TODO add denom enum -> "uatom", "stake"
  coinsValue: BigNumber;
  pubKeyType: string; // TODO add pubKeyType enum -> "tendermint/PubKeySecp256k1"
  pubKey: string; //TODO add pubkey type / validation
  accountNumber: number;
  sequence: number;
}

export interface PublicKey {
  type: pubKeyType;
  value: string;
}

export interface Signature {
  value: string;
}

export interface Address {
  value: string;
}

export interface TxHash {
  value: string;
}
