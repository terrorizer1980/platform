import {Address, pubKeyType, Transaction, Validator} from './types';

export class BlockAtlas {
  // TODO move to global context
  private static apiURL: string = 'https://blockatlas.trustwalletapp.com';

  static async getValidators(): Promise<Validator[]> {
    let data, resp;
    try {
      resp = await fetch(
        `${BlockAtlas.apiURL}/v2/cosmos/staking/validators`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      data = await resp.json();
    } catch (e) {
      throw new Error('Could not get validators from BlockAtlas');
    }
    if (!resp.ok || data.error) {
      // TODO Handle errors
      throw new Error('Could not get validators from BlockAtlas');
    }
    let validators: Validator[] = [];
    for (let v of data['docs']) {
      const validator: Validator = {
        status: v.status,
        name: v.info.name,
        description: v.info.description,
        website: v.info.website,
        address: {value: v.address},
        pubkey: {value: v.pubkey, type: pubKeyType.secp256k1}, // TODO switch to ed15529
      };
      validators.push(validator);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data['docs'].map((v: any) => {
      return {
        status: v.status,
        name: v.info.name,
        description: v.info.description,
        website: v.info.website,
        address: {value: v.address},
        pubkey: {value: v.pubkey, type: pubKeyType.secp256k1}, // TODO switch to ed15529
      };
    });
  }

  // TODO change address annotation to Address type
  static async getTransactions(address: string): Promise<Transaction[]> {
    let data, resp;
    try {
      resp = await fetch(`${BlockAtlas.apiURL}/v1/cosmos/${address}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      data = await resp.json();
    } catch (e) {
      throw new Error('Could not get transactions from BlockAtlas');
    }

    if (!resp.ok ||data.error) {
      throw new Error('Could not get transactions from BlockAtlas');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data['docs'].map((t: any) => {
      return {
        id: t.id,
        coin: t.coin,
        from: t.from as Address,
        to: t.to as Address,
        fee: t.fee,
        date: t.date,
        block: t.block,
        status: t.status,
        type: t.type,
        memo: t.memo,
        value: t.metadata.value,
      };
    });
  }
}
