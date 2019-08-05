import {CosmosRPCService} from './CosmosRPCService';
import {Address, pubKeyType, PublicKey, Signature, TxHash} from './types';
import BigNumber from 'bignumber.js';
import {FetchMock} from 'jest-fetch-mock';

const fetchMock = fetch as FetchMock;
describe('getDelegations', () => {
  beforeEach(() => {
    jest.resetModules();
    fetchMock.resetMocks();
  });

  const mockDelegations = [
    {
      delegatorAddress: 'cosmos1u753tf5t6hq9l8fq7wtsfsxc89955mvgsj5krk',
      validatorAddress: 'cosmosvaloper1rwh0cxa72d3yle3r4l8gd7vyphrmjy2kpe4x72',
      shares: '53559046882.000000000000000000',
    },
    {
      delegatorAddress: 'cosmos1u753tf5t6hq9l8fq7wtsfsxc89955mvgsj5krk',
      validatorAddress: 'cosmosvaloper1te8nxpc2myjfrhaty0dnzdhs5ahdh5agzuym9v',
      shares: '23014817688.000000000000000000',
    },
    {
      delegatorAddress: 'cosmos1u753tf5t6hq9l8fq7wtsfsxc89955mvgsj5krk',
      validatorAddress: 'cosmosvaloper1sjllsnramtg3ewxqwwrwjxfgc4n4ef9u2lcnj0',
      shares: '34415017503.000000000000000000',
    },
    {
      delegatorAddress: 'cosmos1u753tf5t6hq9l8fq7wtsfsxc89955mvgsj5krk',
      validatorAddress: 'cosmosvaloper15urq2dtp9qce4fyc85m6upwm9xul3049e02707',
      shares: '38204308088.000000000000000000',
    },
    {
      delegatorAddress: 'cosmos1u753tf5t6hq9l8fq7wtsfsxc89955mvgsj5krk',
      validatorAddress: 'cosmosvaloper14k4pzckkre6uxxyd2lnhnpp8sngys9m6hl6ml7',
      shares: '25202244540.000000000000000000',
    },
    {
      delegatorAddress: 'cosmos1u753tf5t6hq9l8fq7wtsfsxc89955mvgsj5krk',
      validatorAddress: 'cosmosvaloper14lultfckehtszvzw4ehu0apvsr77afvyju5zzy',
      shares: '20243447423.000000000000000000',
    },
    {
      delegatorAddress: 'cosmos1u753tf5t6hq9l8fq7wtsfsxc89955mvgsj5krk',
      validatorAddress: 'cosmosvaloper1clpqr4nrk4khgkxj78fcwwh6dl3uw4epsluffn',
      shares: '20252035021.000000000000000000',
    },
    {
      delegatorAddress: 'cosmos1u753tf5t6hq9l8fq7wtsfsxc89955mvgsj5krk',
      validatorAddress: 'cosmosvaloper1ey69r37gfxvxg62sh4r0ktpuc46pzjrm873ae8',
      shares: '20286445919.781918963675617186',
    },
  ];

  const mockResponse = [
    {
      delegator_address: 'cosmos1u753tf5t6hq9l8fq7wtsfsxc89955mvgsj5krk',
      validator_address: 'cosmosvaloper1rwh0cxa72d3yle3r4l8gd7vyphrmjy2kpe4x72',
      shares: '53559046882.000000000000000000',
    },
    {
      delegator_address: 'cosmos1u753tf5t6hq9l8fq7wtsfsxc89955mvgsj5krk',
      validator_address: 'cosmosvaloper1te8nxpc2myjfrhaty0dnzdhs5ahdh5agzuym9v',
      shares: '23014817688.000000000000000000',
    },
    {
      delegator_address: 'cosmos1u753tf5t6hq9l8fq7wtsfsxc89955mvgsj5krk',
      validator_address: 'cosmosvaloper1sjllsnramtg3ewxqwwrwjxfgc4n4ef9u2lcnj0',
      shares: '34415017503.000000000000000000',
    },
    {
      delegator_address: 'cosmos1u753tf5t6hq9l8fq7wtsfsxc89955mvgsj5krk',
      validator_address: 'cosmosvaloper15urq2dtp9qce4fyc85m6upwm9xul3049e02707',
      shares: '38204308088.000000000000000000',
    },
    {
      delegator_address: 'cosmos1u753tf5t6hq9l8fq7wtsfsxc89955mvgsj5krk',
      validator_address: 'cosmosvaloper14k4pzckkre6uxxyd2lnhnpp8sngys9m6hl6ml7',
      shares: '25202244540.000000000000000000',
    },
    {
      delegator_address: 'cosmos1u753tf5t6hq9l8fq7wtsfsxc89955mvgsj5krk',
      validator_address: 'cosmosvaloper14lultfckehtszvzw4ehu0apvsr77afvyju5zzy',
      shares: '20243447423.000000000000000000',
    },
    {
      delegator_address: 'cosmos1u753tf5t6hq9l8fq7wtsfsxc89955mvgsj5krk',
      validator_address: 'cosmosvaloper1clpqr4nrk4khgkxj78fcwwh6dl3uw4epsluffn',
      shares: '20252035021.000000000000000000',
    },
    {
      delegator_address: 'cosmos1u753tf5t6hq9l8fq7wtsfsxc89955mvgsj5krk',
      validator_address: 'cosmosvaloper1ey69r37gfxvxg62sh4r0ktpuc46pzjrm873ae8',
      shares: '20286445919.781918963675617186',
    },
  ];

  const mockFailResponse = {
    error:
      'decoding bech32 failed: checksum failed. Expected 8kze44, got y572lf.',
  };

  const address = 'cosmos1u753tf5t6hq9l8fq7wtsfsxc89955mvgsj5krk';
  it('works', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse));
    const delegations = await CosmosRPCService.getDelegations(address);
    expect(delegations).toEqual(mockDelegations);
  });
  it('fails to contact RPC Node', async () => {
    fetchMock.mockRejectOnce(new Error('3rr0r'));
    try {
      await CosmosRPCService.getDelegations(address);
    } catch (e) {
      expect(e).toEqual(
        Error('Could not get delegations from Cosmos RPC node')
      );
    }
  });
  it('fails with invalid parameters', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockFailResponse));
    try {
      await CosmosRPCService.getDelegations(address);
    } catch (e) {
      expect(e).toEqual(
        Error('Could not get delegations from Cosmos RPC node')
      );
    }
  });
});

describe('getAccount', () => {
  const mockAccount = {
    address: 'cosmos16gdxm24ht2mxtpz9cma6tr6a6d47x63hlq4pxt',
    coinsDenom: 'uatom',
    coinsValue: '3909240',
    pubKeyType: 'tendermint/PubKeySecp256k1',
    pubKey: 'AzaSKwy1GgbQmJlWIbFBR8l4Q9YSvWDwyakmccdgoqOs',
    accountNumber: '160',
    sequence: '25',
  };

  const mockAccount2 = {
    address: 'cosmos16gdxm24ht2mxtpz9cma6tr6a6d47x63hlq4pxt',
    coinsDenom: 'uatom',
    coinsValue: '3909240',
    pubKeyType: null,
    pubKey: null,
    accountNumber: '160',
    sequence: '25',
  };

  const mockFailResponse = {
    error:
      'decoding bech32 failed: checksum failed. Expected xnquvj, got lq4pxt.',
  };

  const mockResponse1 = {
    type: 'auth/Account',
    value: {
      address: 'cosmos16gdxm24ht2mxtpz9cma6tr6a6d47x63hlq4pxt',
      coins: [
        {
          denom: 'uatom',
          amount: '3909240',
        },
      ],
      public_key: {
        type: 'tendermint/PubKeySecp256k1',
        value: 'AzaSKwy1GgbQmJlWIbFBR8l4Q9YSvWDwyakmccdgoqOs',
      },
      account_number: '160',
      sequence: '25',
    },
  };
  const mockResponseNullPubkey = {
    type: 'auth/Account',
    value: {
      address: 'cosmos16gdxm24ht2mxtpz9cma6tr6a6d47x63hlq4pxt',
      coins: [
        {
          denom: 'uatom',
          amount: '3909240',
        },
      ],
      account_number: '160',
      sequence: '25',
    },
  };
  const address1 = 'cosmos16gdxm24ht2mxtpz9cma6tr6a6d47x63hlq4pxt';
  const address2 = 'cosmos135qla4294zxarqhhgxsx0sw56yssa3z0f78pm0';
  it('works', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse1));
    const account = await CosmosRPCService.getAccount(address1);
    expect(account).toEqual(mockAccount);
  });
  it('works with null pubKey', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockResponseNullPubkey));
    const account = await CosmosRPCService.getAccount(address2);
    expect(account).toEqual(mockAccount2);
  });
  it('fails', async () => {
    fetchMock.mockRejectOnce(new Error('3rr0r'));
    try {
      await CosmosRPCService.getAccount(address1);
    } catch (e) {
      expect(e).toEqual(Error('Could not get account from Cosmos RPC node'));
    }
  });
  it('fails with invalid parameters', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockFailResponse));
    try {
      await CosmosRPCService.getAccount(address1);
    } catch (e) {
      expect(e).toEqual(Error('Could not get account from Cosmos RPC node'));
    }
  });
});

describe('broadcastTX', () => {
  const mockResponse = {
    height: '0',
    txhash: 'D6493A9B061BCBEA3148FBF50CEBCFA20A03206C8DDBD0F594C0FED4E5D913E6',
  };

  const mockTxhash: TxHash = {
    value: 'D6493A9B061BCBEA3148FBF50CEBCFA20A03206C8DDBD0F594C0FED4E5D913E6',
  };

  const mockError = {
    error: 'unsupported return type ; supported types: sync, async, block',
  };

  const signature: Signature = {
    value:
      'qw3Wechfc04rPpmEOQ81WTuPVtP/dAEtIkhFnz197iEJZ/kKigIx7qULAjIhzVtmvJ2rkF0TKsETYT/gbZaWhA==',
  };
  const fromAddress: Address = {
    value: 'cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02',
  };
  const toAddress: Address = {
    value: 'cosmos135qla4294zxarqhhgxsx0sw56yssa3z0f78pm0',
  };
  const feeAmount = new BigNumber('1');
  const txAmount = new BigNumber('1');
  const pubKey: PublicKey = {
    type: pubKeyType.secp256k1,
    value: 'AlcobsPzfTNVe7uqAAsndErJAjqplnyudaGB0f+R+p3F',
  };
  it('works', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse));
    const tx = await CosmosRPCService.broadcastTX(
      signature,
      fromAddress,
      toAddress,
      feeAmount,
      txAmount,
      pubKey
    );
    expect(tx).toEqual(mockTxhash);
  });
  it('fails rpc request', async () => {
    fetchMock.mockRejectOnce(new Error('3rr0r'));
    try {
      await CosmosRPCService.broadcastTX(
        signature,
        fromAddress,
        toAddress,
        feeAmount,
        txAmount,
        pubKey
      );
    } catch (e) {
      expect(e).toEqual(
        Error('Could not broadcast send transaction from Cosmos RPC node')
      );
    }
  });
  it('returns error', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockError));
    try {
      await CosmosRPCService.broadcastTX(
        signature,
        fromAddress,
        toAddress,
        feeAmount,
        txAmount,
        pubKey
      );
    } catch (e) {
      expect(e).toEqual(
        Error('Could not broadcast send transaction from Cosmos RPC node')
      );
    }
  });
});

describe('delegate', () => {
  const mockResponse = {
    height: '0',
    txhash: 'B501D905C6FAA8CBD792E6152045CA6D5FB55E2F3F2E8E56CC613BE4AE572B95',
  };

  const mockTxhash: TxHash = {
    value: 'B501D905C6FAA8CBD792E6152045CA6D5FB55E2F3F2E8E56CC613BE4AE572B95',
  };

  const mockError = {
    error: 'unsupported return type ; supported types: sync, async, block',
  };

  const delegatorAddress = {
    value: 'cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0eph6dd02',
  };
  const validatorAddress = {
    value: 'cosmosvaloper14k4pzckkre6uxxyd2lnhnpp8sngys9m6hl6ml7',
  };
  const feeAmount = new BigNumber('1');
  const shareAmount = new BigNumber('1');
  const pubKey: PublicKey = {
    type: pubKeyType.secp256k1,
    value: 'AlcobsPzfTNVe7uqAAsndErJAjqplnyudaGB0f+R+p3F',
  };
  const signature: Signature = {
    value:
      'e0ZtNa4LuMrh+rkWrQTYRS5qfonE9R3aWn5HZdt9WKNfIYWrmVq/Y7HiSNQSWRfVSc2IpZsR236ENxs/jf8w9g==',
  };

  it('works', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse));
    const tx = await CosmosRPCService.broadcastDelegation(
      signature,
      delegatorAddress,
      validatorAddress,
      feeAmount,
      shareAmount,
      pubKey
    );
    expect(tx).toEqual(mockTxhash);
  });
  it('fails', async () => {
    fetchMock.mockRejectOnce(new Error('3rr0r'));
    try {
      await CosmosRPCService.broadcastDelegation(
        signature,
        delegatorAddress,
        validatorAddress,
        feeAmount,
        shareAmount,
        pubKey
      );
    } catch (e) {
      expect(e).toEqual(
        Error('Could not broadcast delegate transaction from Cosmos RPC node')
      );
    }
  });
  it('returns error', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockError));
    try {
      await CosmosRPCService.broadcastDelegation(
        signature,
        delegatorAddress,
        validatorAddress,
        feeAmount,
        shareAmount,
        pubKey
      );
    } catch (e) {
      expect(e).toEqual(
        Error('Could not broadcast delegate transaction from Cosmos RPC node')
      );
    }
  });
});
