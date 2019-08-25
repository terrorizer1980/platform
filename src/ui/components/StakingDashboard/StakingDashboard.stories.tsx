import React from 'react';
import {storiesOf} from '@storybook/react';
// import {action} from '@storybook/addons-actions';

import StakingDashboard from './StakingDashboard';
import BigNumber from 'bignumber.js';

storiesOf('StakingDashboard', module).add('exists', () => (
  <StakingDashboard
    stakes={[
      {
        id: 1,
        validator: {imgSrc: '', name: 'Sesameseed'},
        supply: new BigNumber('1000'),
        apr: 8,
        earnedInterest: new BigNumber('200'),
        total: new BigNumber('30'),
        denom: 'TRX',
      },
    ]}
    navOnClick={(): null => null}
  />
));
