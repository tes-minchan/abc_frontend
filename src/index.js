import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import App from './App';
import Signup from 'components/Signup'
import Signin from 'components/Signin';
import BTCKRW from 'components/currency/BTCKRW';
import ETHKRW from 'components/currency/ETHKRW';
import Arbitrage from 'components/Arbitrage';
import Setting from 'components/Setting';

import { BrowserRouter as Router, Route } from 'react-router-dom';

ReactDOM.render(
  <Router>
    <div>
      <Route exact path="/"    component={App} />
      <Route path="/Signin"    component={Signin} />
      <Route path="/Signup"    component={Signup} />
      <Route path="/BTCKRW"    component={BTCKRW} />
      <Route path="/ETHKRW"    component={ETHKRW} />
      <Route path="/Arbitrage" component={Arbitrage} />
      <Route path="/Setting" component={Setting} />

    </div>
  </Router>  
  ,document.getElementById('root'));
  