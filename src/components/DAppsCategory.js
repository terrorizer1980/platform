import React from 'react';
import '../App.css';
import DAppItems from './DAppItems';
import { TrustClient } from '../network/TrustClient';

class DAppsCategory extends React.Component {
  constructor(props) {
    super(props);
    this.state = { list: [], category: {} };
    this.trustClient = new TrustClient();
    console.log(props);
  }

  componentWillMount() {
    this.fetch();
  }

  async fetch() {
    try {
      const dapps = await this.trustClient.stakingProviders(this.props.id)
      const list = dapps.data.docs;
      const category = dapps.data.category;
      
      this.setState({category, list});
    } catch (error) {
      console.log(`Error at fetch() `, error)
    }
  }

  render() {
    const name = this.state.category.name || 'Loading...';
    console.log(this.state.category);
    return (
      <div className="DApps">
        <h2 className="categories">{name}</h2>
        <DAppItems items={this.state.list} />
      </div>
    );
  }
}

export default DAppsCategory;
