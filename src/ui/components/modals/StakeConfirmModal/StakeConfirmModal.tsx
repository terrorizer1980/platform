import styled from '../../../theme/index';
import {css} from '../../../theme/index';
import React from 'react';

import Button from '../../Button/Button';
import BigNumber from 'bignumber.js';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const separator = require('../../../assets/seperate.svg');

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
//   font-size: 3.5vh;

//   text-align: center;
//   letter-spacing: -0.024em;
//   line-height: 80px;
//   margin-top: 70%;
//   margin: auto;
//   display: block;
//   position: relative;
// `;

const TableRow = styled.tr`
  padding-top: 9%;
`;

const TableRowGrey = styled(TableRow)`
  margin-top: 10%;
  background: #fafafa;
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
  text-align: center;
  vertical-align: middle;
  font-size: 20px;
  position: relative;
  // top: -0.55em;
  padding-left: 1em;
  padding-top: 13%;
`;

const TextGrey = styled.text`
  ${text}
  color: Grey;
  text-align: center;
  vertical-align: middle;
  font-size: 30px;
  font-weight: lighter;
  position: relative;
  display: block;
  margin: auto;
  letter-spacing: -0.006em;
  line-height: 50px;
  padding-bottom: 10%;
  // top: -0.5em;
`;

const Amount = styled(TextBlack)`
  font-size: 30px;
  display: block;
  margin: auto;
  padding-left: 0;
`;

const NetworkAmount = styled(TextBlack)`
  position: absolute;
  right: 20%;
  // top: 1%;
  top: -65%;
`;

const MaxTotal = styled(TextBlack)`
  position: absolute;
  right: 20%;
  // top: 1%;
  top: -65%;
`;

const ContinueButton = styled(Button)`
  margin: auto;
  box-shadow: 0px 6px 16px rgba(0, 0, 0, 0.03);
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

const SDSeparator = styled.img`
  // margin-top: 1em;
  // margin-bottom: 1em;
  // padding-top:2%;
  // padding-bottom:2%;
  position: absolute;

  left: 10%;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 80%;
  align-self: center;
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

// interface Validator {
//   id: string;
//   imgSrc: string;
//   name: string;
//   apr: number;
//   detail: string;
// }

// interface Asset {
//     id: number;
//     imgSrc: string;
//     name: string;
//     symbol: string;
// }

export interface StakeConfirmProps {
  stakeAmount: any;
  onStakeConfirm: () => void;
}

export interface StakeConfirmState {
  showCoinModal: boolean;
  showValidatorModal: boolean;
  showStakeInputModal: boolean;
  showStakeConfirmModal: boolean;
  fee: any;
}

class StakeConfirmModal extends React.Component<
  StakeConfirmProps,
  StakeConfirmState
> {
  constructor(props: StakeConfirmProps) {
    super(props);
    this.state = {
      showCoinModal: false,
      showValidatorModal: false,
      showStakeInputModal: false,
      showStakeConfirmModal: false,
      fee: 0.000001, // TODO Change
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

  onStakeConfirm = () => {
    // TODO
    this.props.onStakeConfirm();
  };

  render(): JSX.Element {
    let confirmClick = this.onStakeConfirm.bind(this);
    return (
      <>
        <ContainerDiv>
          <Table>
            <tbody>
              <TableRowGrey>
                <TableData>
                  <Amount>-{this.props.stakeAmount} ATOM</Amount>
                </TableData>
              </TableRowGrey>
              <TableRowGrey>
                <TableData>
                  <TextGrey>0 USD</TextGrey>
                </TableData>
              </TableRowGrey>

              {/* <TableRow><TableData><SDSeparator src={separator} /></TableData></TableRow> */}

              <TableRow>
                <TableData>
                  <TextBlack>Network Fee</TextBlack>
                  <NetworkAmount>{this.state.fee} ATOM</NetworkAmount>
                </TableData>
              </TableRow>

              <TableRow>
                <TableData>
                  <SDSeparator src={separator} />
                </TableData>
              </TableRow>

              <TableRow>
                <TableData>
                  <TextBlack>Max Total</TextBlack>
                  <MaxTotal>
                    {new BigNumber(this.state.fee)
                      .plus(new BigNumber(this.props.stakeAmount))
                      .toString()}{' '}
                    ATOM
                  </MaxTotal>
                </TableData>
              </TableRow>

              <TableRow>
                <TableData>
                  <SDSeparator src={separator} />
                </TableData>
              </TableRow>

              <TableRow>
                <TableData>
                  <ContinueButton
                    onClick={confirmClick}
                    text={'Continue'}
                  ></ContinueButton>
                </TableData>
              </TableRow>
            </tbody>
          </Table>
        </ContainerDiv>
      </>
    );
  }
}

export default StakeConfirmModal;
