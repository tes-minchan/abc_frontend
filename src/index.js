import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import App from './App';
import Signin from 'components/Signin'
import Login from 'components/Login';
import BTCKRW from 'components/currency/BTCKRW';
import ETHKRW from 'components/currency/ETHKRW';
import Arbitrage from 'components/Arbitrage';

import { BrowserRouter as Router, Route } from 'react-router-dom';

ReactDOM.render(
  <Router>
    <div>
      <Route exact path="/"    component={App} />
      <Route path="/Login"     component={Login} />
      <Route path="/Signin"    component={Signin} />
      <Route path="/BTCKRW"    component={BTCKRW} />
      <Route path="/ETHKRW"    component={ETHKRW} />
      <Route path="/Arbitrage" component={Arbitrage} />

    </div>
  </Router>  
  ,document.getElementById('root'));
  