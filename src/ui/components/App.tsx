import * as React from 'react';
import StakingDashboard from './StakingDashboard/StakingDashboard';
import BigNumber from 'bignumber.js';
import NavContainer from './NavContainer/NavContainer';
import WalletConnect from '@trustwallet/walletconnect';
import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal';


// TODO Move walletconnect functions elsewhere

let walletConnector = new WalletConnect({
  bridge: 'https://bridge.walletconnect.org', // Required
});

const createConnector= ()=> {
  walletConnector = new WalletConnect({
    bridge: 'https://bridge.walletconnect.org', // Required
  });
}

const subscribe = ()=> {
  // Subscribe to connection events
  walletConnector.on('connect', (error: string) => {
    if (error) {
      console.log('Error on connect:' + error);
    }
    // Close QR Code Modal
    WalletConnectQRCodeModal.close();
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  walletConnector.on('session_update', (error: string, payload: any) => {
    if (error) {
      console.log('Error on seccion_update:' + error);
    }
    console.log(payload);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  walletConnector.on('disconnect', (error: string, payload: any) => {
    if (error) {
      console.log('Error on disconnect:' + error);
    }
    console.log(payload);
  });
}

const connect = async (): Promise<void> => {
  // Check if connection is already established
  if (!walletConnector.connected) {
    createConnector();
    // create new session
    await walletConnector.createSession();
    // get uri for QR Code modal
    const uri = walletConnector.uri;
    // display QR Code modal
    WalletConnectQRCodeModal.open(uri, () => {
      console.log('QR Code Modal closed');
    });

    subscribe();
  } else {
    await walletConnector.killSession();
  }
};

connect();

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const App = () => (
  <div>
    <NavContainer></NavContainer>
    <StakingDashboard
      // Replace with delegations from CosmosRPCService.getDelegations(address)
      stakes={[
        {
          id: 1,
          validator: {
            imgSrc:
              'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/cosmos/validators/assets/cosmosvaloper1qwl879nx9t6kef4supyazayf7vjhennyh568ys/logo.png',
            name: 'Chorus One',
          },
          supply: new BigNumber('2.2384'),
          apr: 5,
          earnedInterest: new BigNumber('200'),
          total: new BigNumber('30'),
          denom: 'ATOM',
        },
        {
          id: 1,
          validator: {imgSrc: 
            'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/cosmos/validators/assets/cosmosvaloper14k4pzckkre6uxxyd2lnhnpp8sngys9m6hl6ml7/logo.png'
          , name: 'Polychain Labs'},
          supply: new BigNumber('123.809'),
          apr: 3.83,
          earnedInterest: new BigNumber('200'),
          total: new BigNumber('30'),
          denom: 'ATOM',
        },
        {
          id: 1,
          validator: {imgSrc: 
            'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/cosmos/validators/assets/cosmosvaloper102ruvpv2srmunfffxavttxnhezln6fnc54at8c/logo.png', 
            name: 'Ztake.org'},
          supply: new BigNumber('123.8287'),
          apr: 7.38,
          earnedInterest: new BigNumber('200'),
          total: new BigNumber('30'),
          denom: 'ATOM',
        },
      ]}
      navOnClick={(): null => null}
    />
  </div>
);

export default App;
