import styled from '../../../theme/index';
import {css} from '../../../theme/index';
import React from 'react';

import Button from '../../Button/Button';

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
  // margin-top: 60px;
  border-spacing: 0;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  ${text}
  text-align: center;
  font-size: 27px;
  line-height: 25px;
`;

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

const ValidatorImg = styled.img`
  //display: flex;
  //float:left;
  //display:inline;
  display: block;
  margin: auto;

  height: 2.6em;
  padding-right: 1em;
  //padding-bottom:2em;
`;

const TextBlack = styled.text`
  ${text}
  color: black;
  // text-align: left;
  vertical-align: middle;
  font-size: 25px;
  position: relative;
  // top: -0.55em;
  padding-right: 0.1em;
`;

const TextGrey = styled.text`
  ${text}
  color: Grey;
  // text-align: left;
  vertical-align: middle;
  font-size: 20px;
  position: relative;
  // top: -0.5em;
  font-weight: lighter;
`;

const APR = styled(TextGrey)`
  position: absolute;
  left: 80%;
  top: 28%;
`;

const Detail = styled(TextGrey)`
  text-align: center;
  display: block;
  margin: auto;
  font-size: 15px;
`;

const APRRow = styled.div`
  padding-left: 10%;
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

export interface ValidatorDetailProps {
  validator: Validator;
  onValidatorDetail: () => void;
}

export interface ValidatorDetailState {
  showCoinModal: boolean;
  showValidatorModal: boolean;
  showStakeModal: boolean;
}

class ValidatorDetailModal extends React.Component<
  ValidatorDetailProps,
  ValidatorDetailState
> {
  constructor(props: ValidatorDetailProps) {
    super(props);
    this.state = {
      showCoinModal: false,
      showValidatorModal: false,
      showStakeModal: false,
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

  onValidatorDetail = () => {
    // TODO
    this.props.onValidatorDetail();
  };

  render(): JSX.Element {
    let stakeClick = this.onValidatorDetail.bind(this);
    return (
      <>
        <ContainerDiv>
          <Table>
            <TableHead>{this.props.validator.name}</TableHead>
            <tbody>
              <TableRow>
                <TableData>
                  <ValidatorImg src={this.props.validator.imgSrc} />
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  <Detail>{this.props.validator.detail}</Detail>
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  <SDSeparator src={separator} />
                </TableData>
              </TableRow>

              <TableData>
                <APRRow>
                  <TextBlack>{'APR'}</TextBlack>
                  <APR>{this.props.validator.apr}%</APR>
                </APRRow>
              </TableData>

              <TableRow>
                <TableData>
                  <SDSeparator src={separator} />
                </TableData>
              </TableRow>

              <TableRow>
                <TableData>
                  <StakeButton
                    onClick={stakeClick}
                    text={'Stake'}
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

export default ValidatorDetailModal;
