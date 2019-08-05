import styled from '../../theme';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const stakeSvg = require('../../assets/stake.svg');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const withdrawSvg = require('../../assets/withdraw.svg');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const separator = require('../../assets/seperate.svg');

const ContainerDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  //border: 1px black solid;
`;

const StakedAmount = styled.div`
  display: flex;
  //border: 1px red solid;
  margin-left: 14.0em;
`;

const StakedAmountText = styled.text`
  //width: 200px;
  //height: 32px;
  //left: 270px;
  //top: 52px;

  font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Ubuntu, sans-serif;
  font-size: 80px;
  line-height: 60px;
  display: flex;
  align-items: center;
  letter-spacing: 0em;

  color: #313848;
`;

const StakeWithdrawDiv = styled.div`
  //align-items: end;
  display: flex;
  //border: 1px black solid;
 margin-right: 10em;
`;

const SDButton = styled.div<{isSelected: boolean; isBottom?: boolean}>`
  display: flex;
  flex-direction: row;
  width: 10em;
  margin-top: 1em;
  padding: 0.5em 0em 0.4em 0.5em;
  border-radius: 4px;
  cursor: pointer;
  background: ${(props) =>
    props.isSelected ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  margin-top: ${(props) =>
    props.isBottom !== undefined && props.isBottom ? 'auto' : '1em'};
`;

const SDBtnImg = styled.img`
  display: flex;
  height: 7em;
`;

const SDBtnText = styled.div`
  margin-left: 0.7em;
  line-height: 1.6em;
  font-size: 0.9em;
  text-align: center;
  color: white;
`;

const SDHeader = styled.div`
  display: flex;
  justify-content: space-between;  
  flex-direction: row;
  align-items: center;
  width: 100%;
  margin-top: 0.5em;
  margin-bottom: 0.7em;
  //border: 1px solid green;
`;

const SDMain = styled.div`
  display:flex;
  //border: blue 1px solid;
`;

const SDSeparator = styled.img`
  margin-top: 1em;
  margin-bottom: 1em;
  width: 80%;
  display:flex;
`;

// const IconImg = styled.img`
//     width: 8em;
//     margin: 1.5em 2em 0.5em 1em;
//     align-self: flex-start;
// `;

interface ButtonProps {
  name: string;
  onClick: (btnName: string) => any;
  imgSrc: any;
  selected: string;
  isBottom?: boolean;
}

export interface StakingDashboardProps {
  navOnClick: (buttonName: string) => void;
  list: string[];
}

export interface StakingDashboardState {
  isWalletCreated: boolean;
}

class StakingDashboard extends React.Component<
StakingDashboardProps,
StakingDashboardState
> {
  constructor(props: StakingDashboardProps) {
    super(props);
    this.state = {isWalletCreated: false};
  }

  Button({
    name,
    onClick,
    imgSrc,
    selected,
    isBottom,
  }: ButtonProps): JSX.Element {
    return (
      <SDButton
        onClick={(): void => onClick(name)}
        isSelected={name === selected}
        isBottom={isBottom}
      >
        <SDBtnImg src={imgSrc} />
        <SDBtnText>{name}</SDBtnText>
      </SDButton>
    );
  }

  render(): JSX.Element {
    return <>
      <ContainerDiv>
        <SDHeader>
          <StakedAmount>
            <StakedAmountText>1798 USD</StakedAmountText>
          </StakedAmount>
          <StakeWithdrawDiv>
            <this.Button onClick={this.props.navOnClick} imgSrc={stakeSvg} name={""} selected={""} isBottom={false}/>
            <this.Button onClick={this.props.navOnClick} imgSrc={withdrawSvg} name={""} selected={""} isBottom={false}/>
          </StakeWithdrawDiv>
        </SDHeader>
        <SDSeparator src={separator}></SDSeparator>
        <SDMain>
hello
        </SDMain>
      </ContainerDiv>
    </>;
  }
}

export default StakingDashboard;
