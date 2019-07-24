import {
  Delegation,
  Account,
  denom,
  msgType,
  GAS_LIMIT,
  PublicKey,
  Signature,
  Address,
  txMode,
  TxHash,
} from './types';
import BigNumber from 'bignumber.js';

export class CosmosRPCService {
  // TODO move to env
  private static rpcURL: string = `https://cosmos-rpc.trustwalletapp.com`;

  // ICS21
  static async getDelegations(address: string): Promise<Delegation[]> {
    let data, resp;
    try {
      resp = await fetch(
        `${CosmosRPCService.rpcURL}/staking/delegators/${address}/delegations`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      data = await resp.json();
    } catch (e) {
      throw new Error('Could not get delegations from Cosmos RPC node');
    }

    if (!resp.ok || data.error) {
      // TODO Handle errors
      throw new Error('Could not get delegations from Cosmos RPC node');
    }

    let delegations: Delegation[] = [];
    for (let d of data) {
      const delegation: Delegation = {
        delegatorAddress: d.delegator_address,
        validatorAddress: d.validator_address,
        shares: d.shares,
      };
      delegations.push(delegation);
    }
    return delegations;
  }

  // ICS 1
  static async getAccount(address: string): Promise<Account> {
    let data, resp;
    try {
      resp = await fetch(
        `${CosmosRPCService.rpcURL}/auth/accounts/${address}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      data = await resp.json();
    } catch (e) {
      throw new Error('Could not get account from Cosmos RPC node');
    }

    if (!resp.ok || data.error) {
      // TODO Handle errors
      throw new Error('Could not get account from Cosmos RPC node');
    }

    const e = data.value;
    const account: Account = {
      address: e.address,
      coinsDenom: e.coins[0].denom,
      coinsValue: e.coins[0].amount,
      pubKeyType: e.public_key ? e.public_key.type : null,
      pubKey: e.public_key ? e.public_key.value : null,
      accountNumber: e.account_number,
      sequence: e.sequence,
    };
    return account;
  }

  // ICS0
  // TODO handle { error: 'unsupported return type ; supported types: sync, async, block' }
  // TODO handle { error: broadcast_tx_sync: Response error: RPC error -32603 - Internal error: Tx already exists in cache' }
  static async broadcastTX(
    signature: Signature,
    fromAddress: Address,
    toAddress: Address,
    feeAmount: BigNumber,
    txAmount: BigNumber,
    pubKey: PublicKey
  ): Promise<TxHash> {
    let data, resp;
    const payload: string = JSON.stringify({
      tx: {
        fee: {
          amount: [{amount: feeAmount, denom: denom.uatom}],
          gas: GAS_LIMIT,
        },
        memo: 'From TW',
        msg: [
          {
            type: msgType.send,
            value: {
              amount: [{amount: txAmount, denom: denom.uatom}],
              from_address: fromAddress.value,
              to_address: toAddress.value,
            },
          },
        ],
        signatures: [
          {
            pub_key: {
              type: pubKey.type,
              value: pubKey.value,
            },
            signature: signature.value,
          },
        ],
        type: msgType.send,
      },
      mode: txMode.sync,
    });
    try {
      resp = await fetch(`${CosmosRPCService.rpcURL}/txs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
      });
      data = await resp.json();
    } catch (e) {
      throw new Error(
        'Could not broadcast send transaction from Cosmos RPC node'
      );
    }
    if (!resp.ok || data.error) {
      // TODO handle explicit errors
      throw new Error(
        'Could not broadcast send transaction from Cosmos RPC node'
      );
    }
    const txHash: TxHash = {
      value: data.txhash,
    };
    return txHash;
  }

  static async broadcastDelegation(
    signature: Signature,
    delegatorAddress: Address,
    validatorAddress: Address,
    feeAmount: BigNumber,
    shareAmount: BigNumber,
    pubKey: PublicKey
  ): Promise<TxHash> {
    let data, resp;
    const payload: string = JSON.stringify({
      tx: {
        fee: {
          amount: [{amount: feeAmount, denom: denom.uatom}],
          gas: GAS_LIMIT,
        },
        memo: 'From TW',
        msg: [
          {
            type: msgType.delegate,
            value: {
              amount: {amount: shareAmount, denom: denom.uatom},
              delegator_address: delegatorAddress.value,
              validator_address: validatorAddress.value,
            },
          },
        ],
        signatures: [
          {
            pub_key: {
              type: pubKey.type,
              value: pubKey.value,
            },
            signature: signature.value,
          },
        ],
        type: msgType.send,
      },
      mode: txMode.sync,
    });
    try {
      resp = await fetch(`${CosmosRPCService.rpcURL}/txs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
      });
      data = await resp.json();
    } catch (e) {
      throw new Error(
        'Could not broadcast delegate transaction from Cosmos RPC node'
      );
    }
    if (!resp.ok || data.error) {
      // TODO handle explicit errors
      throw new Error(
        'Could not broadcast delegate transaction from Cosmos RPC node'
      );
    }
    const txHash: TxHash = {
      value: data.txhash,
    };
    return txHash;
  }
}
