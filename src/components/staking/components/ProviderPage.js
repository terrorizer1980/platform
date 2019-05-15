import React from 'react';

class ProviderPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {isToggleOn: true};

    // This binding is necessary to make `this` work in the callback
    this.handleClick = this.handleClick.bind(this);
  }

  render() {
    return (
      <div>
        <div>
          ProviderPage: {this.props.id}
        </div>
        <button onClick={this.handleClick}>
            {this.state.isToggleOn ? 'ON' : 'OFF'}
          </button>
      </div>  
    );
  }

  handleClick() {
    this.setState(state => ({
      isToggleOn: !state.isToggleOn
    }));

    let transaction = { 
      network: 118,  
      command: "sign", 
      transaction: {
          "accountNumber": "1035",
          "chainId": "cosmoshub-2",
          "fee": {
            "amounts": [
              {
                "denom": "uatom",
                "amount": "5000"
              }
            ],
            "gas": "200000"
          },
          "sequence": "40",
          "sendCoinsMessage": {
            "fromAddress": "cosmos135qla4294zxarqhhgxsx0sw56yssa3z0f78pm0",
            "toAddress": "cosmos1zcax8gmr0ayhw2lvg6wadfytgdhen25wrxunxa",
            "amounts": [
              {
                "denom": "uatom",
                "amount": "100000"
              }
            ]
          }
        }
    }

    window.provider.requestSignature(transaction).then(result => {
      window.alert("result: " + result)
    }).catch(err => {
      window.alert("err: " + err)
    })
  }  
}

export default ProviderPage;