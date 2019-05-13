import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import { Container } from 'reactstrap';
import './App.css';
import DApps from './components/DApps.js';
import DAppsCategory from './components/DAppsCategory.js';
import ContactUs from './components/ContactUs.js';
import Staking from './components/staking/index.js';

const StakingElement = ({ match }) => (
  <div>
    <DAppsCategory id={match.params.id} />
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
        <Container>
          <Switch location={isModal ? this.previousLocation : location}>
            <Route exact path="/" component={DApps} />
            <Route path="/staking" component={Staking} />
            <Route path="/staking/:id" component={Staking} />
            <Route path="/staking/:id" component={StakingElement} />
            <Route path="/contact-us" component={ContactUs} />
          </Switch>
        </Container>
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
