import styled from '../../theme';
import React from 'react';

const Nav = styled.div`
  position: absolute;
  height: 100%;
  background: #3375bb;
  width: 15%;
  top: 0px;
  left: 0px;
  border-radius: 0px 8px 8px 0px;
`;

export interface NavContainerProps {}

export interface NavContainerState {}

class NavContainer extends React.Component<
  NavContainerProps,
  NavContainerState
> {
  constructor(props: NavContainerProps) {
    super(props);
    this.state = {};
  }

  render(): JSX.Element {
    return (
      <>
        <Nav></Nav>
      </>
    );
  }
}

export default NavContainer;
