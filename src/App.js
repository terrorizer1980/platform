import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import { Container } from 'reactstrap';
import './App.css';
import Staking from './components/staking/index.js';
import ProviderPage from './components/staking/components/ProviderPage.js';
import Footer from './components/global/Footer.js';
import Header from './components/global/Header.js';
import ContactUs from './components/global/ContactUs.js';

const StakingElement = ({ match }) => (
  <div>
    <ProviderPage id={match.params.id} />
  </div>
);

class ModalSwitch extends React.Component {
  componentWillUpdate(nextProps) {
    const { location } = this.props;

    if (
      nextProps.history.action !== 'POP' &&
      (!location.state || !location.state.modal)
    ) {
      this.previousLocation = this.props.location;
    }
  }

  previousLocation = this.props.location;

  render() {
    const { location } = this.props;
    const isModal = !!(
      location.state &&
      location.state.modal &&
      this.previousLocation !== location
    );
    return (
      <div>
        <Footer />
        <Container>
          <Switch location={isModal ? this.previousLocation : location}>
            <Route path="/staking/:id" component={StakingElement} />
            <Route path="/staking" component={Staking} />
            <Route path="/contact-us" component={ContactUs} />
          </Switch>
        </Container>
        <Header />
      </div>
    );
  }
}

const App = () => (
  <Router>
    <Route component={ModalSwitch} />
  </Router>
);

export default App;