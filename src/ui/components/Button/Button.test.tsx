import {shallow} from 'enzyme';
import React from 'react';
import Button from './Button';

describe('Button', () => {
  it('should render one Button', () => {
    let wrapper = shallow(<Button text={'hello'} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('handles the click', () => {
    const onClick = jest.fn();
    const button = shallow(<Button onClick={onClick}>Click me?</Button>);
    expect(onClick).toHaveBeenCalledTimes(0);
    button.simulate('click');
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
