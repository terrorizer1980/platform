import styled from '../../../theme/index';
import {css} from '../../../theme/index';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-var-requires
// const separator = require('../../../assets/seperate.svg');

const text = css`
  font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Ubuntu, sans-serif;
`;

const hoverTranslate = css`
  transition: transform 700ms ease-in-out;

  &:hover {
    transform: translate(0px, -3px);
    background: rgba(0, 0, 0, 0.02);
    -webkit-filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.1));
    filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.1));
  }
`;

const TextBlack = styled.text`
  ${text}
  color: black;
  text-align: left;
  vertical-align: middle;
  position: relative;
  top: -0.85em;
  padding-right: 0.1em;
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
margin-top: -130px;
border-spacing: 0;
border-collapse: collapse;
`;

// const TableHead = styled.thead`
//   ${text}
//   text-align: center;
//   font-size: 27px;
//   line-height: 25px;
// `;

const TableRow = styled.tr`
margin-top: 9%;
cursor: pointer;
${hoverTranslate}
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
height: 2.6em;
padding-right: 1em;
//padding-bottom:2em;
`;

const ValidatorName = styled(TextBlack)``;

const DelegationAmount = styled(TextBlack)`
  position: absolute;
  left: 65%;
  top: 40%;
  text-align:right;
  float:right;
  display: flex;
  justify-content: flex-end;
`;

const ValidatorDiv = styled.div`
  // position:absolute;
`;

// const SDSeparator = styled.img`
//   // margin-top: 1em;
//   // margin-bottom: 1em;
//   // padding-top:2%;
//   // padding-bottom:2%;
//   position: absolute;
//   left: 10%;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   width: 80%;
//   align-self: center;
// `;

interface Delegation {
  id: string;
  imgSrc: string;
  validatorName: string;
  amount: number;
  denom: string;
}

export interface WithdrawListProps {
  delegations: Delegation[];
  onWithdrawList: (delegation: any) => void;
}

export interface WithdrawListState {
  showCoinModal: boolean;
  showValidatorModal: boolean;
  showStakeModal: boolean;
}

class WithdrawListModal extends React.Component<
  WithdrawListProps,
  WithdrawListState
> {
  constructor(props: WithdrawListProps) {
    super(props);
    this.state = {
      showCoinModal: false,
      showValidatorModal: false,
      showStakeModal: false,
    };
  }

  onWithdrawList = (delegation:any) => {
    this.props.onWithdrawList(delegation);
  };

  render(): JSX.Element {
    return (
      <>
        <ContainerDiv>
          <Table>
            <tbody>
              {/* <TableRow>
                <TableData>
                  <SDSeparator src={separator} />
                </TableData>
              </TableRow> */}

              {this.props.delegations.map((delegation: Delegation) => {
                let delegationClick = this.onWithdrawList.bind(
                  this,
                  delegation
                );
                return (
                  <TableRow
                    key={delegation.id}
                    data-item={delegation}
                    onClick={delegationClick}
                  >
                    <TableData>
                      <ValidatorDiv>
                        <ValidatorImg src={delegation.imgSrc} />
                        <ValidatorName>{delegation.validatorName}</ValidatorName>
                      </ValidatorDiv>
                      <DelegationAmount>{delegation.amount} {delegation.denom}</DelegationAmount>
                    </TableData>
                  </TableRow>
                );
              })}
            </tbody>
          </Table>
        </ContainerDiv>
      </>
    );
  }
}

export default WithdrawListModal;
