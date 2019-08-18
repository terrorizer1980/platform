import React from 'react';
import {storiesOf} from '@storybook/react';
// import {action} from '@storybook/addon-actions';

import StakeConfirmModal from './StakeConfirmModal';

storiesOf('Stake Confirm Modal', module).add('Renders', () => (
  <StakeConfirmModal
    onStakeConfirm={() => {
      null;
    }}
    stakeAmount={100}
  />
));
