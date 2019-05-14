import React from 'react';
import {
  Row,
  Col,
} from 'reactstrap';
import ProviderItems from './components/ProviderItems';

class Staking extends React.Component {
  constructor(props) {
    super(props);
    this.state = { elements: [{
      id: "123",
      url: "urasd",
      title: "qdasa",
      description: "12312312"
    },
    {
      id: "123",
      url: "urasd",
      title: "qdasa",
      description: "12312312"
    }] };
  }

  render() {
    return (
      <ProviderItems elements={this.state.elements} />
    );
  }
}

export default Staking;
