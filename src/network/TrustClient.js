import axios from 'axios';

const url = 'https://blockatlas.trustwallet.com';

export class TrustClient {
  stakingNetworks() {
    return axios.get(`${url}/staking/networks`);
  }

  stakingProviders(network) {
    return axios.get(`${url}/staking/${network}`);
  }

  stakingProviders(network) {
    return axios.get(`${url}/staking/${network}`);
  }
}
