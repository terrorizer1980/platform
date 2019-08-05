import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';

import Button from './Button';

export const events = {
  onClick: action('button-clicked'),
};

storiesOf('Button', module)
  .add('Confirm', () => <Button text={'Confirm'} {...events} />)
  .add('Continue', () => <Button text={'Continue'} {...events} />);
