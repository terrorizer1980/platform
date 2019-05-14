import React from 'react';
import { Media } from 'reactstrap';

class ProviderItem extends React.Component {
  render() {
    const item = this.props.item;
    const url = `/staking/${item.id}`
    return (
      <Media className="dappItem" tag="a" href={url}>
        <span>ProviderItem</span>
        <Media className="mt-1 align media-block">
          <Media bottom>
            <img src={item.image} alt="logo" className="media-logo" />
          </Media>
          <Media body>
            <Media heading>
              {item.name}
            </Media>
            {item.description}
          </Media>
        </Media>
      </Media>
    );
  }
}

export default ProviderItem;
