import React from 'react';
import {storiesOf} from '@storybook/react';
// import {action} from '@storybook/addons-actions';

import StakingDashboard from './StakingDashboard';
import BigNumber from 'bignumber.js';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sesameseed = require('../../assets/mocks/sesameseed.svg');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tezos = require('../../assets/mocks/tezos.svg');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fish = require('../../assets/mocks/fish.svg');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ztake = require('../../assets/mocks/ztake.svg');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const zbeos = require('../../assets/mocks/zbeos.svg');

storiesOf('StakingDashboard', module).add('exists', () => (
  <StakingDashboard
    stakes={[
      {
        id: 1,
        validator: {imgSrc: sesameseed, name: 'Sesameseed'},
        supply: new BigNumber('1000'),
        apr: 8,
        earnedInterest: new BigNumber('200'),
        total: new BigNumber('30'),
        denom: 'TRX',
      },
      {
        id: 2,
        validator: {imgSrc: tezos, name: 'Tezos Capital'},
        supply: new BigNumber('1000'),
        apr: 12,
        earnedInterest: new BigNumber('200'),
        total: new BigNumber('30'),
        denom: 'TRZ',
      },
      {
        id: 1,
        validator: {imgSrc: fish, name: 'stake.fish | bitfish'},
        supply: new BigNumber('1000'),
        apr: 5,
        earnedInterest: new BigNumber('200'),
        total: new BigNumber('30'),
        denom: 'ATOM',
      },
      {
        id: 3,
        validator: {imgSrc: ztake, name: 'Ztake.org'},
        supply: new BigNumber('1000'),
        apr: 4,
        earnedInterest: new BigNumber('200'),
        total: new BigNumber('30'),
        denom: 'ATOM',
      },
      {
        id: 4,
        validator: {imgSrc: zbeos, name: 'zbeosbp11111'},
        supply: new BigNumber('1000'),
        apr: 7.2,
        earnedInterest: new BigNumber('200'),
        total: new BigNumber('30'),
        denom: 'EOS',
      },
    ]}
    navOnClick={(): null => null}
  />
));
