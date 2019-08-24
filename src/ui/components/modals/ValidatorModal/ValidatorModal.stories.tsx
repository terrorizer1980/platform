import React from 'react';
import {storiesOf} from '@storybook/react';
// import {action} from '@storybook/addon-actions';

import ValidatorModal from './ValidatorModal';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sesameseed = require('../../../assets/mocks/sesameseed.svg');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tezos = require('../../../assets/mocks/tezos.svg');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fish = require('../../../assets/mocks/fish.svg');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ztake = require('../../../assets/mocks/ztake.svg');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const zbeos = require('../../../assets/mocks/zbeos.svg');

storiesOf('Validator Modal', module).add('Renders', () => (
  <ValidatorModal
    onSelectValidator={() => null}
    validators={[
      {
        id: 'Sesameseed',
        imgSrc: sesameseed,
        name: 'Sesameseed',
        apr: 22,
      },
      {
        id: 'Tezos Capital',
        imgSrc: tezos,
        name: 'Tezos Capital',
        apr: 17.8,
      },
      {
        id: 'StakeFish',
        imgSrc: fish,
        name: 'stake.fish | bitfish',
        apr: 21,
      },
      {
        id: 'Ztake',
        imgSrc: ztake,
        name: 'Ztake.org',
        apr: 16,
      },
      {
        id: 'zbeos',
        imgSrc: zbeos,
        name: 'zbeosbp11111',
        apr: 7.3,
      },
    ]}
  />
));
