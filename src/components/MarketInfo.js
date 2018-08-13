import React, { Component, Fragment } from 'react';


import { Button, Form, FormGroup, Label, Input, FormText, Table } from 'reactstrap';

import './MarketInfo.css';
// import './Arbitrage.css';

import * as Api from 'lib/api';
import _ from 'underscore';


class MarketInfo extends Component {


  constructor(props) {
    super(props);
    this.state = {};
    this.currencyInfo = ['KRW','BTC', 'EOS', 'ETH', 'ZRX', 'XRP'];

  }

  
  componentDidMount() {
    Api.GetBalance()
    .then((data) => {
      let toSetStateMarket = {};
      _.map(data.data, (values, market) => {
        toSetStateMarket[market] = values
      })

      this.setState({
        market : toSetStateMarket
      });

    }, (err) => {
      // Need to error control
      console.log(err.response)
    });
  }


  render() {
    return (
      <Fragment>

        <div className="marketcontainer card-list">
          <RenderMarketCard currency = {this.currencyInfo} marketinfo = {this.state.market}/>
        </div>

      </Fragment>

    )
  }

}

function RenderMarketCard({currency, marketinfo}) {

  const modifyValues = function(values) {
    let modified = values * 10000;
    modified = Math.round(modified) / 10000;

    return modified;
  }

  const renderValues = function(market, currency) {
    let returnValues = null;
    if(marketinfo) {
      returnValues = marketinfo[market].map(item => {
        if(item.currency === currency) {
          return (
            <div>
              <div className="valuetitle"> {market}</div> <h5> {modifyValues(item.available)} {currency} </h5>
            </div>
          )
        }
      });

    }

    return returnValues;
  }

  const marketCardArea = currency ? (
    currency.map((item, index) => {
      return (
        <div className="marketcard orange" key = {index}>
          <div className="title">{item} </div>
          <div className="line"></div>
          {renderValues("upbit", item)}
          {renderValues("bithumb", item)}
          {renderValues("coinone", item)}
          {renderValues("gopax", item)}
          {/* {renderValues("korbit", item)} */}

        </div>
      )
    })
  ) : null;

  return marketCardArea;
}


export default MarketInfo;
