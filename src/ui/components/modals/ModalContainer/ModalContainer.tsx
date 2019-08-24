import styled from '../../../theme/index';
import {css} from '../../../theme/index';
import React from 'react';
import CoinModal from '../CoinModal/CoinModal';
import ValidatorModal from '../ValidatorModal/ValidatorModal';
import ValidatorDetailModal from '../ValidatorDetailModal/ValidatorDetailModal';
import StakeInputModal from '../StakeInputModal/StakeInputModal';
import StakeConfirmModal from '../StakeConfirmModal/StakeConfirmModal';
import WithdrawListModal from '../WithdrawListModal/WithdrawListModal';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const exit = require('../../../assets/exit.svg');

const text = css`
  font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Ubuntu, sans-serif;
  font-size: 17px;
  line-height: 21px;
`;

const ModalContainerDiv = styled.div`
  position: absolute;
  width: 500px;
  height: 50%;
  // padding: 12em 15em;
  left: 35%;
  top: 15%;

  z-index: 1;

  // position: absolute;
  // display: flex;
  // justify-content: center;
  // align-items: center;
  // width: 35%;
  // height: 50%;
  // border: 1px green solid;
`;

const ModalHeader = styled.div`
  height: 80px;
  width: 500px;
  // border:1px solid black;
  display: block;
  position: relative;
  background: #3375bb;
  border-radius: 8px 8px 0px 0px;
`;

const ModalHeaderText = styled.text`
  ${text}
  text-align: center;
  color: white;

  font-size: 32px;
  line-height: 25px;
  display: flex;
  align-items: flex-end;
  text-align: center;
  display: block;
  padding-top: 0.8em;
`;

const ModalBody = styled.div`
  overflow-y: scroll;
  width: 100%;
`;

interface ButtonProps {
  name: string;
  onClick: (btnName: string) => any;
  imgSrc: any;
  selected: string;
  isBottom?: boolean;
}

const ExitButton = styled.div<{isSelected: boolean; isBottom?: boolean}>`
  // display: flex;
  // flex-direction: column;

  position: absolute;
  width: 38px;
  height: 38px;
  left: 89%;
  top: 23%;

  // margin-top: 1em;
  // padding: 0.5em 0em 0.4em 0.5em;
  // border-radius: 4px;
  cursor: pointer;
  // border: 1px black solid;/

  transition: transform 700ms ease-in-out;
  :hover {
    transform: translate(0px, -3px);
    -webkit-filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.3));
    filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.3));
  }
`;

const SDBtnImg = styled.img`
  //display: flex;
  height: 100%;
  width: 100%;
`;

export interface ModalContainerProps {
  account: string;
  balance: number;

  showCoinModal: boolean;
  showValidatorModal: boolean;
  showValidatorDetailModal: boolean;
  showStakeInputModal: boolean;
  showStakeConfirmModal: boolean;
  showWithdrawListModal: boolean;

  onClose: () => void;
  onSelectCoin: () => void;
  onSelectValidator: () => void;
  onValidatorDetail: () => void;
  onStakeInput: () => void;
  onStakeConfirm: () => void;

  onWithdrawList: () => void;
}

export interface ModalContainerState {
  balance: number;
  account: string;

  showCoinModal: boolean;
  showValidatorModal: boolean;
  showValidatorDetailModal: boolean;
  showStakeInputModal: boolean;
  showStakeConfirmModal: boolean;

  showWithdrawListModal: boolean;

  stakeAsset: any;
  stakeValidator: any;
  stakeAmount: any;

  withdrawDelegation: any;
}

class ModalContainer extends React.Component<
  ModalContainerProps,
  ModalContainerState
> {
  constructor(props: ModalContainerProps) {
    super(props);
    this.state = {
      balance: this.props.balance,
      account: this.props.account,

      showCoinModal: this.props.showCoinModal,
      showValidatorModal: this.props.showValidatorModal,
      showValidatorDetailModal: this.props.showValidatorDetailModal,
      showStakeInputModal: this.props.showStakeInputModal,
      showStakeConfirmModal: this.props.showStakeConfirmModal,

      showWithdrawListModal: this.props.showWithdrawListModal,

      stakeAsset: null,
      stakeValidator: null,
      stakeAmount: null,

      withdrawDelegation: null,
      // errorMessage: undefined
    };

    this.onModalClose = this.onModalClose.bind(this);
    this.onSelectCoin = this.onSelectCoin.bind(this);
    this.onSelectValidator = this.onSelectValidator.bind(this);
    this.onValidatorDetail = this.onValidatorDetail.bind(this);
    this.onStakeInput = this.onStakeInput.bind(this);
    this.onStakeConfirm = this.onStakeConfirm.bind(this);
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

  onModalClose() {
    this.setState({
      showCoinModal: false,
    });
    console.log('pressed');
    this.props.onClose();
  }

  onSelectCoin(asset: any) {
    this.setState({
      stakeAsset: asset,
    });
    this.props.onSelectCoin();
  }

  onSelectValidator(validator: any) {
    this.setState({
      stakeValidator: validator,
    });
    this.props.onSelectValidator();
  }

  onValidatorDetail() {
    this.props.onValidatorDetail();
  }

  onStakeInput(stakeAmount: any) {
    this.setState({
      stakeAmount: stakeAmount,
    });
    this.props.onStakeInput();
  }

  onStakeConfirm() {
    this.props.onStakeConfirm();
  }

  onWithdrawListModal(delegation: any) {
    this.setState({
      withdrawDelegation: delegation
    })
    this.props.onWithdrawList();
  }

  render() {
    if (
      !this.props.showCoinModal &&
      !this.props.showValidatorModal &&
      !this.props.showValidatorDetailModal &&
      !this.props.showStakeInputModal &&
      !this.props.showStakeConfirmModal &&
      !this.props.showWithdrawListModal
    ) {
      return null;
    }

    if (this.props.showCoinModal) {
      return (
        <>
          <ModalContainerDiv>
            <ModalHeader>
              <ModalHeaderText>Stake</ModalHeaderText>
              <this.ExitButton
                onClick={() => {
                  this.onModalClose();
                }}
                imgSrc={exit}
                name={''}
                selected={''}
                isBottom={false}
              />
            </ModalHeader>
            <ModalBody>
              <CoinModal onSelectCoin={this.onSelectCoin}></CoinModal>
            </ModalBody>
          </ModalContainerDiv>
        </>
      );
    }

    if (this.props.showValidatorModal) {
      return (
        <>
          <ModalContainerDiv>
            <ModalHeader>
              <ModalHeaderText>Stake</ModalHeaderText>
              <this.ExitButton
                onClick={() => {
                  this.onModalClose();
                }}
                imgSrc={exit}
                name={''}
                selected={''}
                isBottom={false}
              />
            </ModalHeader>
            <ModalBody>
              <ValidatorModal
                onSelectValidator={this.onSelectValidator}
                validators={[
                  {
                    id: 'Sesameseed',
                    imgSrc: '',
                    name: 'Sesameseed',
                    apr: 22,
                  },
                ]}
              ></ValidatorModal>
            </ModalBody>
          </ModalContainerDiv>
        </>
      );
    }

    if (this.props.showValidatorDetailModal) {
      return (
        <>
          <ModalContainerDiv>
            <ModalHeader>
              <ModalHeaderText>Stake</ModalHeaderText>
              <this.ExitButton
                onClick={() => {
                  this.onModalClose();
                }}
                imgSrc={exit}
                name={''}
                selected={''}
                isBottom={false}
              />
            </ModalHeader>
            <ModalBody>
              <ValidatorDetailModal
                onValidatorDetail={this.onValidatorDetail}
                validator={{
                  id: '1',
                  imgSrc: '',
                  name: 'Polychain Labs',
                  apr: 5,
                  detail:
                    'Polychain Labs designs, builds and operates secure, institutional grade staking systems. Our team includes some of the industry’s most experienced infrastructure and security engineers who are now focused on advancing the state of staking infrastructure across many networks.',
                }}
              ></ValidatorDetailModal>
            </ModalBody>
          </ModalContainerDiv>
        </>
      );
    }

    if (this.props.showStakeInputModal) {
      return (
        <>
          <ModalContainerDiv>
            <ModalHeader>
              <ModalHeaderText>Stake</ModalHeaderText>
              <this.ExitButton
                onClick={() => {
                  this.onModalClose();
                }}
                imgSrc={exit}
                name={''}
                selected={''}
                isBottom={false}
              />
            </ModalHeader>
            <ModalBody>
              <StakeInputModal
                onStakeInput={this.onStakeInput}
                balance={this.state.balance}
                validator={{
                  id: '1',
                  imgSrc: '',
                  name: 'Polychain Labs',
                  apr: 5,
                  detail:
                    'Polychain Labs designs, builds and operates secure, institutional grade staking systems. Our team includes some of the industry’s most experienced infrastructure and security engineers who are now focused on advancing the state of staking infrastructure across many networks.',
                }}
              ></StakeInputModal>
            </ModalBody>
          </ModalContainerDiv>
        </>
      );
    }

    if (this.props.showStakeConfirmModal) {
      return (
        <>
          <ModalContainerDiv>
            <ModalHeader>
              <ModalHeaderText>Stake</ModalHeaderText>
              <this.ExitButton
                onClick={() => {
                  this.onModalClose();
                }}
                imgSrc={exit}
                name={''}
                selected={''}
                isBottom={false}
              />
            </ModalHeader>
            <ModalBody>
              <StakeConfirmModal
                onStakeConfirm={this.onStakeConfirm}
                stakeAmount={this.state.stakeAmount}
              ></StakeConfirmModal>
            </ModalBody>
          </ModalContainerDiv>
        </>
      );
    }

    if (this.props.showWithdrawListModal) {
      return (
        <>
          <ModalContainerDiv>
            <ModalHeader>
              <ModalHeaderText>Stake</ModalHeaderText>
              <this.ExitButton
                onClick={() => {
                  this.onModalClose();
                }}
                imgSrc={exit}
                name={''}
                selected={''}
                isBottom={false}
              />
            </ModalHeader>
            <ModalBody>
              <WithdrawListModal
                onWithdrawList={this.onWithdrawListModal}
                delegations={[
                  {
                    id: '1',
                    imgSrc: '',
                    validatorName: 'Polychain Labs',
                    amount: 600,
                    denom: 'ATOM',
                  },
                ]}
              ></WithdrawListModal>
            </ModalBody>
          </ModalContainerDiv>
        </>
      );
    }

    return <></>;
  }
}

export default ModalContainer;
