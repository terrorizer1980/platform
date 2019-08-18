import styled from '../../../theme';
import {css} from '../../../theme';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-var-requires
// const separator = require('../../../assets/seperate.svg');

const text = css`
  font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Ubuntu, sans-serif;
  font-size: 17px;
  line-height: 21px;
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
//   font-size: 4vh;
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

const TextBlack = styled.text`
  ${text}
  color: black;
  text-align: left;
  vertical-align: middle;
  position: relative;
  top: -0.85em;
  padding-right: 0.1em;
`;

const APR = styled(TextBlack)`
  position: absolute;
  left: 80%;
  top: 40%;
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
}

// interface Asset {
//     id: number;
//     imgSrc: string;
//     name: string;
//     symbol: string;
// }

export interface ValidatorProps {
  validators: Validator[];
  onSelectValidator: (validator: any) => void;
}

export interface ValidatorModalState {
  showCoinModal: boolean;
  showValidatorModal: boolean;
  showStakeModal: boolean;
}

class ValidatorModal extends React.Component<
  ValidatorProps,
  ValidatorModalState
> {
  constructor(props: ValidatorProps) {
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

  selectValidator = (validator: Validator, e: any) => {
    this.props.onSelectValidator(validator);
    console.log(validator);
  };

  render(): JSX.Element {
    return (
      <>
        <ContainerDiv>
          <Table>
            {/* <TableHead></TableHead> */}
            <tbody>
              {/* <TableRow>
                <TableData>
                  <SDSeparator src={separator} />
                </TableData>
              </TableRow> */}

              {this.props.validators.map((validator: Validator) => {
                let validatorClick = this.selectValidator.bind(this, validator);
                return (
                  <TableRow
                    key={validator.id}
                    data-item={validator}
                    onClick={validatorClick}
                  >
                    <TableData>
                      <ValidatorImg src={validator.imgSrc} />
                      <TextBlack>{validator.name}</TextBlack>
                      <APR>{validator.apr}% Apr</APR>
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

export default ValidatorModal;
