import styled from '../../../theme/index';
import {css} from '../../../theme/index';
import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const cosmos = require('../../../assets/CoinImg/cosmos.svg');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const binance = require('../../../assets/CoinImg/binance.png');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ethereum_classic = require('../../../assets/CoinImg/ethereum_classic.png');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ethereum = require('../../../assets/CoinImg/ethereum.png');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ripple = require('../../../assets/CoinImg/ripple.png');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const stellar = require('../../../assets/CoinImg/stellar.png');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tezos = require('../../../assets/CoinImg/tezos.png');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tron = require('../../../assets/CoinImg/tron.png');

// eslint-disable-next-line @typescript-eslint/no-var-requires
// const exit = require('../../../assets/exit.svg');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const separator = require('../../../assets/seperate.svg');

const hoverTranslate = css`
  transition: transform 700ms ease-in-out;

  &:hover {
    transform: translate(0px, -3px);
    background: rgba(0, 0, 0, 0.02);
    -webkit-filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.1));
    filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.1));
  }
`;

const text = css`
  font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Ubuntu, sans-serif;
  font-size: 17px;
  line-height: 21px;
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
  border-radius: 0px 0px 8px 8px;
  z-index: 1;
  // border: 1px black dotted;
`;

const Table = styled.table`
  width: 100%;
  height: 100%;
  margin-top: 80px;
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
  text-align: left;
  vertical-align: middle;
  padding: 1.3em 7em;
  // border: 1px black solid;
`;

const CoinImg = styled.img`
  //display: flex;
  //float:left;
  //display:inline;
  height: 2.6em;
  padding-right: 1em;
  //padding-bottom:2em;
`;

const TextGrey = styled.text`
  ${text}
  color: Grey;
  text-align: left;
  vertical-align: middle;
  position: relative;
  // top: -0.4em;
  padding-left: 0.4em;
  top: -1em;
  font-weight: lighter;
`;

const TextBlack = styled.text`
  ${text}
  color: black;
  text-align: left;
  vertical-align: middle;

  position: relative;
  top: -1em;
  padding-right: 0.1em;
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

interface Asset {
  id: number;
  imgSrc: string;
  name: string;
  symbol: string;
}

export interface CoinModalProps {
  onSelectCoin: (asset: any) => void;
}

export interface CoinModalState {
  assets: Asset[];
  showCoinModal: boolean;
  showValidatorModal: boolean;
  showStakeModal: boolean;
}

class CoinModal extends React.Component<CoinModalProps, CoinModalState> {
  constructor(props: CoinModalProps) {
    super(props);
    this.state = {
      assets: [
        {
          id: 1,
          imgSrc: cosmos,
          name: 'Cosmos',
          symbol: 'ATOM',
        },
        {
          id: 2,
          imgSrc: ethereum,
          name: 'Ethereum',
          symbol: 'ETH',
        },
        {
          id: 3,
          imgSrc: tezos,
          name: 'Tezos',
          symbol: 'XTZ',
        },
        {
          id: 4,
          imgSrc: binance,
          name: 'Binance',
          symbol: 'BNB',
        },
        {
          id: 5,
          imgSrc: ripple,
          name: 'Ripple',
          symbol: 'XRP',
        },
        {
          id: 6,
          imgSrc: tron,
          name: 'Tron',
          symbol: 'TRX',
        },
        {
          id: 7,
          imgSrc: stellar,
          name: 'Stellar Lumens',
          symbol: 'XLM',
        },
        {
          id: 8,
          imgSrc: ethereum_classic,
          name: 'Ethereum Classic',
          symbol: 'ETC',
        },
      ],
      showCoinModal: false,
      showValidatorModal: false,
      showStakeModal: false,
    };

    this.selectAsset = this.selectAsset.bind(this);
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

  selectAsset = (asset: Asset, e: any) => {
    this.props.onSelectCoin(asset);
  };

  render(): JSX.Element {
    return (
      <>
        <ContainerDiv>
          <Table>
            <tbody>
              <TableRow>
                <TableData>
                  <SDSeparator src={separator} />
                </TableData>
              </TableRow>

              {this.state.assets.map((asset: Asset) => {
                let assetClick = this.selectAsset.bind(this, asset);
                return (
                  <TableRow
                    key={asset.id}
                    data-item={asset}
                    onClick={assetClick}
                  >
                    <TableData>
                      <CoinImg src={asset.imgSrc} />
                      <TextBlack>{asset.name}</TextBlack>
                      <TextGrey>{asset.symbol}</TextGrey>
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

export default CoinModal;
