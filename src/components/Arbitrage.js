import React, { Component, Fragment } from 'react';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import Header from 'components/Header';
import './Arbitrage.css';

class Arbitrage extends Component {

  render() {
    return (
      <Fragment>
        <Header />
        <Arbitrage_Left />
      </Fragment>

    )
  }
}

class Arbitrage_Left extends Component {
  render() {
    return (
      <div>
        <div class="container card-list">

        <div class="card medgray">
          <div class="title">points</div>
          <div class="value">332</div>
        <div class="title">last 30 days: </div>
          <div class="line"><a href="https://www.zevo.io/cc-dashboard/" class="details"><span class="dashicons dashicons-arrow-right-alt2"></span>Points</a></div></div>


        <div class="card red">
          <div class="title">scenes</div>
          <div class="value">12</div>
          <div class="title">last 30 days: </div>
          <div class="line"><a href="https://www.zevo.io/cc-dashboard/" class="details"><span class="dashicons dashicons-arrow-right-alt2"></span>Scenes & Uses</a></div></div>


        <div class="card orange">
          <div class="title">total uses</div>
          <div class="value">32</div>
          <div class="title">last 30 days:</div>
          <div class="line"><a href="https://www.zevo.io/cc-dashboard/" class="details"><span class="dashicons dashicons-arrow-right-alt2"></span>Scenes & Uses</a></div></div>


        <div class="card yellow">
          <div class="title">total earnings</div>
          <div class="value">$212</div>
          <div class="title">total payouts: $</div>
          <div class="line"><a href="https://www.zevo.io/cc-dashboard/" class="details"><span class="dashicons dashicons-arrow-right-alt2"></span>Payout History</a></div></div>


        <div class="card darkgray">
          <div class="title">royalties due</div>
          <div class="value">$112</div>
          <div class="title">test</div>
          <div class="line"><a href="https://www.zevo.io/cc-dashboard/" class="details"><span class="dashicons dashicons-arrow-right-alt2"></span>Request Payout</a></div></div>

        </div>

      </div>

    )
  }
  
}

export default Arbitrage;

