import { configure } from '@storybook/react';
import { configureActions } from '@storybook/addon-actions';

// automatically import all files ending in *.stories.tsx
const req = require.context('../src', true, /\.stories\.tsx$/);
function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configureActions({
  depth: 100,
  // Limit the number of items logged into the actions panel
  limit: 20,
})

configure(loadStories, module);
