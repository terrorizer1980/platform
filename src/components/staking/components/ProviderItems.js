import React from 'react';
import {
  Row,
  Col,
} from 'reactstrap';
import ProviderItem from './ProviderItem';

class ProviderItems extends React.Component {
  render() {
    return (
      <div>
        <Row>
          {this.props.elements.map((element, index) => (
            <Col xs="12" key={index}>
              <ProviderItem item={element} key={index} />
            </Col>
          ))}
        </Row>
      </div>
    );
  }
}

export default ProviderItems;
