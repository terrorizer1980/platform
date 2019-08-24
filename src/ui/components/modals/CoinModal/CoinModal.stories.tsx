import React from 'react';
import {storiesOf} from '@storybook/react';
// import {action} from '@storybook/addon-actions';

import CoinModal from './CoinModal';

storiesOf('Coin Modal', module).add('Renders', () => (
  <CoinModal onSelectCoin={() => {}} />
));
