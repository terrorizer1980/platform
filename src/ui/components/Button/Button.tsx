import styled from '../../theme';
import React from 'react';

const StyledButton = styled.div`
  display: flex;
  width: 345px;
  height: 50px;
  justify-content: center;
  align-items: center;
  background: #3375bb;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  color: white;
  font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Ubuntu, sans-serif;
  :hover {
    background: #2566ab;
  }
`;

export interface ButtonProps {
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  children?: React.ReactNode;
  className?: string;
  text?: string;
}

function Button(props: ButtonProps): JSX.Element {
  return (
    <StyledButton className={props.className} onClick={props.onClick}>
      {props.text}
      {props.children}{' '}
    </StyledButton>
  );
}

export default Button;
