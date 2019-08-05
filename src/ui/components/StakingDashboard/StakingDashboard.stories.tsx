import React from 'react';
import {storiesOf} from '@storybook/react';
// import {action} from '@storybook/addons-actions';

import StakingDashboard from './StakingDashboard';

storiesOf('StakingDashboard', module).add('exists', () => (
  <StakingDashboard   list={['']} navOnClick={(): null=> null}/>
));
