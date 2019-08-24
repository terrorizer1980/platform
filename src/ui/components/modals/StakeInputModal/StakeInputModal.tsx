import styled from '../../../theme/index';
import {css} from '../../../theme/index';
import React from 'react';
import BigNumber from 'bignumber.js';


import Button from '../../Button/Button';
// import BigNumber from 'bignumber.js';

const text = css`
  font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Ubuntu, sans-serif;
`;

const ContainerDiv = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 500px;
  height: 600px;
  overflow: auto;
  background: #ffffff;
  box-shadow: 0px 6px 16px rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  z-index: 1;
  // border: 1px black dotted;
`;

const Table = styled.table`
  width: 100%;
  margin: 0;
  border-spacing: 0;
  border-collapse: collapse;
`;

// const TableHead = styled.thead`
//   ${text}
//   text-align: center;
//   font-size: 4vh;
// `;

const TableRow = styled.tr`
  margin-top: 9%;
`;

const TableData = styled.td`
  // height: 150%;
  position: relative;
  text-align: left;
  vertical-align: middle;
  padding: 1.3em 3em;
  // border: 1px black solid;
`;

const TextBlack = styled.text`
  ${text}
  color: black;
  position: absolute;
  top: 43%;
  right: 8%;
  font-size: 19px;
`;

const TextBlue = styled.text`
  ${text}
  color: #3375BB;
  display: block;
  margin: auto;
  text-align: center;
`;

const TextGrey = styled.text`
  ${text}
  color: Grey;
  text-align: center;
  vertical-align: middle;
  font-size: 3vh;
  position: relative;
  display: block;
  margin: auto;
  letter-spacing: -0.006em;
  line-height: 22px;
  padding-bottom: 10%;
  // top: -0.5em;
`;

const Input = styled.input`
  ${text}
  // display: block;
    text-align: center;
  vertical-align: middle;

  color: #323747;
  font-size: 30px;
  height: 2.9em;
  // width:50%;
  flex-grow: 1;
  border: 0;
  padding: 0em 1em 0em 2em;
  // margin: auto;
  :focus {
    outline: none;
  }
`;

const StakeInputDiv = styled.div`
  margin: auto;
  display: block;
`;

const StakeButton = styled(Button)`
  margin: auto;
`;

const ExitButton = styled.div<{isSelected: boolean; isBottom?: boolean}>`
  // display: flex;
  // flex-direction: column;

  position: absolute;
  width: 38px;
  height: 38px;
  left: 93%;
  top: 1%;

  // margin-top: 1em;
  // padding: 0.5em 0em 0.4em 0.5em;
  // border-radius: 4px;
  cursor: pointer;
  // border: 1px black solid;/
`;

const SDBtnImg = styled.img`
  //display: flex;
  height: 100%;
  width: 100%;
`;

interface ButtonProps {
  name: string;
  onClick: (btnName: string) => any;
  imgSrc: any;
  selected: string;
  isBottom?: boolean;
}

interface Validator {
  id: string;
  imgSrc: string;
  name: string;
  apr: number;
  detail: string;
}

// interface Asset {
//     id: number;
//     imgSrc: string;
//     name: string;
//     symbol: string;
// }

export interface StakeInputModalProps {
  validator: Validator;
  onStakeInput: (stakeAmount: any) => void;
  balance: number;
}

export interface StakeInputModalState {
  showCoinModal: boolean;
  showValidatorModal: boolean;
  showStakeModal: boolean;

  stakeAmount: number;
  stakeAmountInput: string;
  balance:number;

  assetPrice: number;
}

class StakeInputModal extends React.Component<
  StakeInputModalProps,
  StakeInputModalState
> {
  constructor(props: StakeInputModalProps) {
    super(props);
    this.state = {
      showCoinModal: false,
      showValidatorModal: false,
      showStakeModal: false,
      stakeAmountInput: '0.0',
      stakeAmount: 0.0,
      balance: this.props.balance,
      assetPrice: 2.73 // TODO replace with fetchTicker(asset) for TrustApi
    };
  }

  ExitButton({
    name,
    onClick,
    imgSrc,
    selected,
    isBottom,
  }: ButtonProps): JSX.Element {
    return (
      <ExitButton
        onClick={(): void => onClick(name)}
        isSelected={name === selected}
        isBottom={isBottom}
      >
        <SDBtnImg src={imgSrc} />
      </ExitButton>
    );
  }

  tryParseStringToFloat(val: string): BigNumber | null {
    let numString = val.trim();
    if (numString.length === 0) {
        return new BigNumber(0);
    }
    if (numString.split('.').length <= 1 && numString.charAt(numString.length - 1) === '.') {
        numString = numString.slice(0, -1);
    }
    const bigNum  = new BigNumber(numString);
    return bigNum.isNaN() ? null : bigNum;
}

coinAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
  const coinAmount = this.tryParseStringToFloat(e.target.value);
  if (coinAmount !== null) {
      this.setState(
        { stakeAmount: parseFloat(coinAmount.toString())}
        );
  }
}

  onStakeInput = (stakeAmount: any) => {
    this.props.onStakeInput(stakeAmount);
    console.log(stakeAmount);
  };

  render(): JSX.Element {
    console.log(this.state.stakeAmount);
    let inputClick = this.onStakeInput.bind(this, this.state.stakeAmount);
    return (
      <>
        <ContainerDiv>
          <Table>
            <tbody>
              <TableRow>
                <TableData>
                  <TextBlue>Balance: {this.state.balance} ATOM</TextBlue>
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  <StakeInputDiv>
                    <Input
                      // value={this.state.stakeAmountInput}
                      placeholder={'0.0'}
                      onChange={(e) => this.coinAmountChange(e) }
                    />
                    <TextBlack>{'ATOM'}</TextBlack>
                  </StakeInputDiv>
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  <TextGrey>{this.state.stakeAmount*this.state.assetPrice} USD</TextGrey>
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  <StakeButton
                    onClick={inputClick}
                    text={'Continue'}
                  ></StakeButton>
                </TableData>
              </TableRow>
            </tbody>
          </Table>
        </ContainerDiv>
      </>
    );
  }
}

export default StakeInputModal;
