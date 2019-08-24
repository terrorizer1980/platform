import React from 'react';
import {storiesOf} from '@storybook/react';
// import {action} from '@storybook/addon-actions';

import ValidatorModal from './ValidatorModal';

storiesOf('Validator Modal', module).add('Renders', () => (
  <ValidatorModal
    onSelectValidator={() => null}
    validators={[
      {
        id: 'Sesameseed',
        imgSrc: '',
        name: 'Sesameseed',
        apr: 22,
      },
    ]}
  />
));
