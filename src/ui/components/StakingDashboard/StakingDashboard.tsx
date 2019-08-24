import styled from '../../theme';
import {css} from '../../theme/index';
import React from 'react';
import BigNumber from 'bignumber.js';
import ModalContainer from '../modals/ModalContainer/ModalContainer';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const stakeSvg = require('../../assets/stake.svg');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const withdrawSvg = require('../../assets/withdraw.svg');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const separator = require('../../assets/seperate.svg');

const hoverTranslate = css`
  transition: transform 500ms ease-in-out;

  &:hover {
    transform: translate(0px, -3px);
  }
`;

const HeaderText = styled.text`
  width: 100%;
  display: flex;
  flex-direction: row;
  padding-top: 0.3em;
  font-size: 20px;
  white-space: nowrap;
  overflow: hidden;
`;

const TextGrey = styled.text`
  color: Grey;
  text-align: left;
  vertical-align: middle;
  font-size: 15px;
  line-height: 18px;
  position: relative;
  top: -0.5em;
  white-space: nowrap;
  overflow: hidden;
`;

const TextBlack = styled.text`
  color: black;
  text-align: left;
  vertical-align: middle;
  font-size: 16px;
  line-height: 20px;
  position: relative;
  top: -0.55em;
  padding-right: 0.1em;
  white-space: nowrap;
  overflow: hidden;
`;

const AlphaChannelDiv = styled.div<{showAlpha: boolean}>`
  width: 85%;
  height: 100%;
  // border: 1px black solid;
  position:absolute;
  left:15%;
  right:8px;
  top:0px;
  box-shadow: 0px 6px 16px rgba(0, 0, 0, 0.03);
  background: 
  z-index:1;
  background: ${(props) => (props.showAlpha ? 'rgba(0, 0, 0, 0.07)' : 'white')};

`;

const ContainerDiv = styled.div<{showBlur: boolean}>`
  // display: flex;
  // flex-direction: column;
  // align-items: center;
  width: 85%;
  height: 100%;
  // border: 1px black solid;
  position: absolute;
  left: 15%;
  right: 8px;
  top: 0px;
  box-shadow: 0px 6px 16px rgba(0, 0, 0, 0.03);
  z-index: 0;

  -webkit-filter: ${(props) => (props.showBlur ? 'blur(3px)' : 'blur(0px)')};
  -moz-filter: ${(props) => (props.showBlur ? 'blur(3px)' : 'blur(0px)')};
  -o-filter: ${(props) => (props.showBlur ? 'blur(3px)' : 'blur(0px)')};
  -ms-filter: ${(props) => (props.showBlur ? 'blur(3px)' : 'blur(0px)')};
  filter: ${(props) => (props.showBlur ? 'blur(3px)' : 'blur(0px)')};
`;

const StakedAmount = styled.div`
  display: flex;
  //border: 1px red solid;
  // margin-left: 10em;
  line-height: 57px;
  // width: 100px;
`;

const StakedAmountText = styled.text`
  width: 200px;
  //height: 32px;
  //left: 270px;
  top: 52px;
  position: absolute;

  font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Ubuntu, sans-serif;
  font-size: 48px;
  display: flex;
  align-items: center;
  letter-spacing: -0.04em;

  color: #313848;
`;

const StakeWithdrawDiv = styled.div`
  position: absolute;

  left: 1086.33332%;
  top: 17.12831237%;
  display: flex;
  flex-direction: flex-end;
`;

const SDButton = styled.div<{isSelected: boolean; isBottom?: boolean}>`
  // display: flex;
  // flex-direction: column;
  position: relative;
  width: 6em;
  // margin-top: 2em;
  padding: 1em 1em 1em 1em;
  border-radius: 4px;
  cursor: pointer;
  //border: 1px black solid;
`;

const SDBtnImg = styled.img`
  display: flex;
  height: 12vh;
  ${hoverTranslate}
`;

const SDBtnText = styled.div`
  margin-left: 0.7em;
  line-height: 1.6em;
  font-size: 0.9em;
  text-align: center;
  color: white;
`;

const SDMain = styled.div`
  // display: flex;
  //border: blue 1px solid;
`;

const SDSeparator = styled.img`
  // margin-top: 5.3%;
  margin-bottom: 2em;
  top: 19vh;
  // width: 80%;
  // display: flex;
  position: absolute;
  left: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80%;
  align-self: center;
`;

const Table = styled.table`
  width: 50%;
  // margin-top:10%;
  border-spacing: 0;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  margin-bottom: 100px;
`;

const TableData = styled.td`
  // height: 100%;
  width: 160%;
  text-align: left;
  vertical-align: middle;
  padding: 1em 9em;
  font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Ubuntu, sans-serif;
  // position:relative;
`;

const TableBody = styled.tbody`
  margin-top:5em;
  margin-left:2.523904203948%

  width: 1000px;
  position:relative;
  display:block;
`;

const TableRow = styled.tr`
  width: 100px;
  position: relative;
  display: block;
`;
const HeaderRow = styled(TableRow)`
  height: 12vh;
`;

const ValidatorDiv = styled.div`
  margin-top: -1.2em;
  width: 160%;
  // display:flex;
`;

const ROIDiv = styled.div`
  padding-left: 16%;
`;

const ValidatorImg = styled.img`
  //display: flex;
  //float:left;
  //display:inline;
  height: 28px;
  width: 28px;
  padding-right: 1em;
  //padding-bottom:2em;
`;

interface Validator {
  imgSrc: string;
  name: string;
}

interface ButtonProps {
  name: string;
  onClick: (btnName: string) => any;
  imgSrc: any;
  selected: string;
  isBottom?: boolean;
}

export interface StakingDashboardProps {
  navOnClick: (buttonName: string) => void;
  stakes: Stake[];
}

interface Stake {
  id: number;
  validator: Validator;
  supply: BigNumber;
  apr: number;
  earnedInterest: BigNumber;
  total: BigNumber;
  denom: string;
}

export interface StakingDashboardState {
  showAlpha: boolean;
  showBlur: boolean;

  balance: number;
  account: string;

  showCoinModal: boolean;
  showValidatorModal: boolean;
  showValidatorDetailModal: boolean;
  showStakeInputModal: boolean;
  showStakeConfirmModal: boolean;

  showWithdrawListModal: boolean;
}

class StakingDashboard extends React.Component<
  StakingDashboardProps,
  StakingDashboardState
> {
  constructor(props: StakingDashboardProps) {
    super(props);
    this.state = {
      balance: 1239823.28, // TODO change
      account: 'cosmos1fcyx472u3r2cg90zufv9pludp8r6scfwu2hnhx', // TODO change

      showAlpha: false,
      showBlur: false,
      showCoinModal: false,
      showValidatorModal: false,
      showStakeInputModal: false,
      showValidatorDetailModal: false,
      showStakeConfirmModal: false,

      showWithdrawListModal: false,
    };
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
    return (
      <>
        <AlphaChannelDiv showAlpha={this.state.showAlpha}></AlphaChannelDiv>

        <ModalContainer
          balance={this.state.balance}
          account={this.state.account}
          showCoinModal={this.state.showCoinModal}
          showValidatorModal={this.state.showValidatorModal}
          showValidatorDetailModal={this.state.showValidatorDetailModal}
          showStakeInputModal={this.state.showStakeInputModal}
          showStakeConfirmModal={this.state.showStakeConfirmModal}
          showWithdrawListModal={this.state.showWithdrawListModal}
          onClose={async () => {
            await this.setState({
              showAlpha: false,
              showBlur: false,
              showCoinModal: false,
              showValidatorModal: false,
              showValidatorDetailModal: false,
              showStakeInputModal: false,
              showStakeConfirmModal: false,
              showWithdrawListModal: false
            });
          }}
          onSelectCoin={async () => {
            await this.setState({
              showCoinModal: false,
              showValidatorModal: true,
            });
            console.log('set validator ' + this.state.showValidatorModal);
          }}
          onSelectValidator={async () => {
            await this.setState({
              showValidatorModal: false,
              showValidatorDetailModal: true,
            });
          }}
          onValidatorDetail={async () => {
            await this.setState({
              showValidatorDetailModal: false,
              showStakeInputModal: true,
            });
          }}
          onStakeInput={async () => {
            await this.setState({
              showStakeInputModal: false,
              showStakeConfirmModal: true,
            });
          }}
          onStakeConfirm={async () => {
            await this.setState({
              showStakeConfirmModal: false,
              showAlpha: false,
              showBlur: false
            });
            // TODO Send signed transaction
          }}
          onWithdrawList={async () => {
            await this.setState({
              showWithdrawListModal: false,
            });
          }}
        ></ModalContainer>

        <ContainerDiv showBlur={this.state.showBlur}>
          <SDMain>
            {/* <CoinModal navOnClick={():null=>{return null}}></CoinModal> */}

            <Table>
              <TableHead>
                <HeaderRow>
                  <TableData>
                    <StakedAmount>
                      <StakedAmountText>1798 USD</StakedAmountText>
                    </StakedAmount>
                  </TableData>

                  <TableData>
                    <StakeWithdrawDiv>
                      <this.Button
                        onClick={() => {
                          this.setState({
                            showCoinModal: true,
                            showAlpha: true,
                            showBlur: true,
                          });
                        }}
                        imgSrc={stakeSvg}
                        name={''}
                        selected={''}
                        isBottom={false}
                      />

                      <this.Button
                        onClick={() => {
                          this.setState({
                            showWithdrawListModal: true,
                            showAlpha: true,
                            showBlur: true,
                          });
                        }}
                        imgSrc={withdrawSvg}
                        name={''}
                        selected={''}
                        isBottom={false}
                      />
                    </StakeWithdrawDiv>
                  </TableData>
                </HeaderRow>
              </TableHead>

              <SDSeparator src={separator} />
              <TableBody>
                {/* <TableRow><TableData></TableData></TableRow>
                <TableRow><TableData></TableData></TableRow> */}
                <TableRow>
                  <TableData>
                    <HeaderText>Your stakes</HeaderText>
                  </TableData>
                  <TableData>
                    <HeaderText>Supply</HeaderText>
                  </TableData>
                  <TableData>
                    <HeaderText>APR</HeaderText>
                  </TableData>
                  <TableData>
                    <HeaderText>Estimated ROI</HeaderText>
                  </TableData>
                </TableRow>
                {this.props.stakes.map((stake: Stake) => (
                  <TableRow key={stake.id}>
                    <TableData>
                      <ValidatorDiv>
                        <ValidatorImg src={stake.validator.imgSrc} />
                        <TextBlack>{stake.validator.name}</TextBlack>
                      </ValidatorDiv>
                    </TableData>
                    <TableData>
                      <TextBlack>{stake.supply.toString()}</TextBlack>
                      <TextGrey>{stake.denom}</TextGrey>
                    </TableData>
                    <TableData>
                      <TextBlack>{stake.apr}</TextBlack>
                      <TextGrey>%</TextGrey>
                    </TableData>
                    <TableData>
                      <ROIDiv>
                        <TextBlack>{stake.earnedInterest.toString()}</TextBlack>
                        <TextGrey>{stake.denom}</TextGrey>
                      </ROIDiv>
                    </TableData>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SDMain>
        </ContainerDiv>
      </>
    );
  }
}

export default StakingDashboard;
