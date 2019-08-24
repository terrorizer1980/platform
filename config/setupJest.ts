import { GlobalWithFetchMock } from 'jest-fetch-mock';

import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

const customGlobal: GlobalWithFetchMock = global as GlobalWithFetchMock;
customGlobal.fetch = require('jest-fetch-mock');
customGlobal.fetchMock = customGlobal.fetch;

// React 16 Enzyme adapter
Enzyme.configure({ adapter: new Adapter() });
// Make Enzyme functions available in all test files without importing
// global.React = React;
// global.shallow = shallow;
// global.render = render;
// global.mount = mount;
