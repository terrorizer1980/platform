import {BlockAtlas} from './BlockAtlasAPI';
import {pubKeyType, Validator} from './types';
import {FetchMock} from 'jest-fetch-mock';

const fetchMock = fetch as FetchMock;

describe('getValidators', () => {
  beforeEach(() => {
    jest.resetModules();
    fetchMock.resetMocks();
  });

  const mockValidators: Validator[] = [
    {
      status: true,
      name: 'Certus One',
      description:
        'Stake and earn rewards with the most secure and stable validator. Winner of the Game of Stakes. Operated by Certus One Inc. By delegating, you confirm that you are aware of the risk of slashing and that Certus One Inc is not liable for any potential damages to your investment.',
      website: 'https://certus.one',
      address: {value: 'cosmosvaloper1qwl879nx9t6kef4supyazayf7vjhennyh568ys'},
      pubkey: {
        value:
          'cosmosvalconspub1zcjduepqwrjpn0slu86e32zfu5xxg8l42uk40guuw6er44vw2yl6s7wc38est6l0ux',
        type: pubKeyType.secp256k1,
      },
    },
    {
      status: true,
      name: 'Chorus One',
      description:
        'Secure Cosmos and shape its future by delegating to Chorus One, a highly secure and stable validator. By delegating, you agree to the terms of service at: https://chorus.one/cosmos/tos',
      website: 'https://chorus.one/',
      address: {value: 'cosmosvaloper15urq2dtp9qce4fyc85m6upwm9xul3049e02707'},
      pubkey: {
        value:
          'cosmosvalconspub1zcjduepqjc07nu2ya8tyzl8m385rnc382pkulwt2gh8yary73f3a96jak7pqsf63xf',
        type: pubKeyType.secp256k1,
      },
    },
    {
      status: true,
      name: 'Polychain Labs',
      description:
        'Secure staking with Polychain Labs, the most experienced institutional grade staking team.',
      website: 'https://cosmos.polychainlabs.com',
      address: {value: 'cosmosvaloper14k4pzckkre6uxxyd2lnhnpp8sngys9m6hl6ml7'},
      pubkey: {
        value:
          'cosmosvalconspub1zcjduepquhlqdhjw4qp2c2t6qh5z7tfk52qc72623f0etc8f3n7hy8uuh25ql34fvu',
        type: pubKeyType.secp256k1,
      },
    },
    {
      status: true,
      name: 'Cryptium Labs',
      description: 'Secure and available validation from the Swiss Alps',
      website: 'https://cryptium.ch',
      address: {value: 'cosmosvaloper1kj0h4kn4z5xvedu2nd9c4a9a559wvpuvu0h6qn'},
      pubkey: {
        value:
          'cosmosvalconspub1zcjduepqvc5xdrpvduse3fc084s56n4a6dhzudyzjmywjx25fkgw2fhsj70searwgy',
        type: pubKeyType.secp256k1,
      },
    },
    {
      status: true,
      name: 'Sikka',
      description: 'Sunny Aggarwal (@sunnya97) and Dev Ojha (@ValarDragon)',
      website: 'sikka.tech',
      address: {value: 'cosmosvaloper1ey69r37gfxvxg62sh4r0ktpuc46pzjrm873ae8'},
      pubkey: {
        value:
          'cosmosvalconspub1zcjduepqg6y8magedjwr9p6s2c28zp28jdjtecxhn97ew6tnuzqklg63zgfspp9y3n',
        type: pubKeyType.secp256k1,
      },
    },
  ];

  const mockResponse = {
    docs: [
      {
        status: true,
        info: {
          name: 'Certus One',
          description:
            'Stake and earn rewards with the most secure and stable validator. Winner of the Game of Stakes. Operated by Certus One Inc. By delegating, you confirm that you are aware of the risk of slashing and that Certus One Inc is not liable for any potential damages to your investment.',
          image: '',
          website: 'https://certus.one',
        },
        address: 'cosmosvaloper1qwl879nx9t6kef4supyazayf7vjhennyh568ys',
        pubkey:
          'cosmosvalconspub1zcjduepqwrjpn0slu86e32zfu5xxg8l42uk40guuw6er44vw2yl6s7wc38est6l0ux',
      },
      {
        status: true,
        info: {
          name: 'Chorus One',
          description:
            'Secure Cosmos and shape its future by delegating to Chorus One, a highly secure and stable validator. By delegating, you agree to the terms of service at: https://chorus.one/cosmos/tos',
          image: '',
          website: 'https://chorus.one/',
        },
        address: 'cosmosvaloper15urq2dtp9qce4fyc85m6upwm9xul3049e02707',
        pubkey:
          'cosmosvalconspub1zcjduepqjc07nu2ya8tyzl8m385rnc382pkulwt2gh8yary73f3a96jak7pqsf63xf',
      },
      {
        status: true,
        info: {
          name: 'Polychain Labs',
          description:
            'Secure staking with Polychain Labs, the most experienced institutional grade staking team.',
          image: '',
          website: 'https://cosmos.polychainlabs.com',
        },
        address: 'cosmosvaloper14k4pzckkre6uxxyd2lnhnpp8sngys9m6hl6ml7',
        pubkey:
          'cosmosvalconspub1zcjduepquhlqdhjw4qp2c2t6qh5z7tfk52qc72623f0etc8f3n7hy8uuh25ql34fvu',
      },
      {
        status: true,
        info: {
          name: 'Cryptium Labs',
          description: 'Secure and available validation from the Swiss Alps',
          image: '',
          website: 'https://cryptium.ch',
        },
        address: 'cosmosvaloper1kj0h4kn4z5xvedu2nd9c4a9a559wvpuvu0h6qn',
        pubkey:
          'cosmosvalconspub1zcjduepqvc5xdrpvduse3fc084s56n4a6dhzudyzjmywjx25fkgw2fhsj70searwgy',
      },
      {
        status: true,
        info: {
          name: 'Sikka',
          description: 'Sunny Aggarwal (@sunnya97) and Dev Ojha (@ValarDragon)',
          image: '',
          website: 'sikka.tech',
        },
        address: 'cosmosvaloper1ey69r37gfxvxg62sh4r0ktpuc46pzjrm873ae8',
        pubkey:
          'cosmosvalconspub1zcjduepqg6y8magedjwr9p6s2c28zp28jdjtecxhn97ew6tnuzqklg63zgfspp9y3n',
      },
    ],
  };

  const mockFailResponse = {
    error: '404 page not found',
  };

  it('works', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse));
    const validators = await BlockAtlas.getValidators();
    expect(validators).toEqual(mockValidators);
  });
  it('fails to reach BlockAtlas API', async () => {
    fetchMock.mockRejectOnce(new Error('3rr0r'));
    try {
      await BlockAtlas.getValidators();
    } catch (e) {
      expect(e).toEqual(Error('Could not get validators from BlockAtlas'));
    }
  });
  it('fails on invalid param', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockFailResponse));
    try {
      await BlockAtlas.getValidators();
    } catch (e) {
      expect(e).toEqual(Error('Could not get validators from BlockAtlas'));
    }
  });
});

describe('getTransactions', () => {
  beforeEach(() => {
    jest.resetModules();
    fetchMock.resetMocks();
  });

  const address = 'cosmos1cdk2av44w7ehz4r2046xhvemsguuvrjp7fw503';
  const mockResponse = {
    total: 3,
    docs: [
      {
        id: 'CF4451AEE79CAC072FC1052328C468512DE1308D11269C66394F9AB952DB0267',
        coin: 118,
        from: 'cosmos14gz5e8ccjwjt4jhw80u26mvxzywrfxyupznud2',
        to: 'cosmos1cdk2av44w7ehz4r2046xhvemsguuvrjp7fw503',
        fee: '750',
        date: 1563293948,
        block: 1065155,
        status: 'completed',
        type: 'transfer',
        memo: '',
        metadata: {
          value: '1000000',
        },
      },
      {
        id: 'DFA0D82E2B5CF2FA81D46374888497AA484BE5D390DDFE174A9E095C1D259B84',
        coin: 118,
        from: 'cosmos1nynns8ex9fq6sjjfj8k79ymkdz4sqth06xexae',
        to: 'cosmos1cdk2av44w7ehz4r2046xhvemsguuvrjp7fw503',
        fee: '1',
        date: 1557597375,
        block: 240060,
        status: 'completed',
        type: 'transfer',
        memo: 'myim',
        metadata: {
          value: '179043000',
        },
      },
      {
        id: 'E4FF1D548E2E8D4819D5B8D2D0C4FBC10573E1F70B641B3F5FDCB61867225CB4',
        coin: 118,
        from: 'cosmos1nynns8ex9fq6sjjfj8k79ymkdz4sqth06xexae',
        to: 'cosmos1cdk2av44w7ehz4r2046xhvemsguuvrjp7fw503',
        fee: '1',
        date: 1557586407,
        block: 238460,
        status: 'completed',
        type: 'transfer',
        memo: 'myim',
        metadata: {
          value: '595000',
        },
      },
    ],
    status: true,
  };
  const mockTransactions = [
    {
      id: 'CF4451AEE79CAC072FC1052328C468512DE1308D11269C66394F9AB952DB0267',
      coin: 118,
      from: 'cosmos14gz5e8ccjwjt4jhw80u26mvxzywrfxyupznud2',
      to: 'cosmos1cdk2av44w7ehz4r2046xhvemsguuvrjp7fw503',
      fee: '750',
      date: 1563293948,
      block: 1065155,
      status: 'completed',
      type: 'transfer',
      memo: '',
      value: '1000000',
    },
    {
      id: 'DFA0D82E2B5CF2FA81D46374888497AA484BE5D390DDFE174A9E095C1D259B84',
      coin: 118,
      from: 'cosmos1nynns8ex9fq6sjjfj8k79ymkdz4sqth06xexae',
      to: 'cosmos1cdk2av44w7ehz4r2046xhvemsguuvrjp7fw503',
      fee: '1',
      date: 1557597375,
      block: 240060,
      status: 'completed',
      type: 'transfer',
      memo: 'myim',
      value: '179043000',
    },
    {
      id: 'E4FF1D548E2E8D4819D5B8D2D0C4FBC10573E1F70B641B3F5FDCB61867225CB4',
      coin: 118,
      from: 'cosmos1nynns8ex9fq6sjjfj8k79ymkdz4sqth06xexae',
      to: 'cosmos1cdk2av44w7ehz4r2046xhvemsguuvrjp7fw503',
      fee: '1',
      date: 1557586407,
      block: 238460,
      status: 'completed',
      type: 'transfer',
      memo: 'myim',
      value: '595000',
    },
  ];

  const mockFailResponse = {
    error: '404 page not found',
  };
  it('works', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse));
    const transactions = await BlockAtlas.getTransactions(address);
    expect(transactions).toEqual(mockTransactions);
  });
  it('fails to reach BlockAtlas API', async () => {
    fetchMock.mockRejectOnce(new Error('3rr0r'));
    try {
      await BlockAtlas.getTransactions(address);
    } catch (e) {
      expect(e).toEqual(Error('Could not get transactions from BlockAtlas'));
    }
  });
  it('fails on invalid param', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockFailResponse), {status: 404});
    try {
      await BlockAtlas.getTransactions(address);
    } catch (e) {
      expect(e).toEqual(Error('Could not get transactions from BlockAtlas'));
    }
  });
});
