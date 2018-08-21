import React, { Component, Fragment } from 'react';
import { Button, Input } from 'reactstrap';
import PropTypes from 'prop-types'

import Header from 'components/Header';
import MarketStatus from 'components/MarketStatus';

import './Arbitrage2.css';

import _ from 'underscore';
import * as Api from 'lib/api';

class Arbitrage extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };

    this.userSubscribeCoin = sessionStorage.getItem('subsCoinList')? sessionStorage.getItem('subsCoinList') : null;

  }


  onSocketMessage = (message) => {
    let getMessage = JSON.parse(message);

    if(getMessage.type === 'init') {

      if(!this.userSubscribeCoin) {
        let sub_coinlist = getMessage.coinList.map(coin => {
          let sub = {
            name : coin.name,
            sub_market : coin.support_market,
            sub_status : []
          }
  
          // Default coin subscribe status set to true.
          coin.support_market.forEach(market => {
            sub.sub_status.push(true);
          })
  
          return sub;
        });

        sessionStorage.setItem('subsCoinList',JSON.stringify(sub_coinlist));

        // subscribe all market.
        let subscribe = {
          channel  : "update"
        }
        this.socket.send(JSON.stringify(subscribe));
      }
      else {
        let getSessionSubsCoin = JSON.parse(sessionStorage.getItem('subsCoinList'));

        let subscribe = {
          channel  : "update",
        }

        subscribe['subscribe'] = getSessionSubsCoin.map(coin => {
          let coinsubs = {
            name : coin.name,
            support_market : []
          }

          coin.sub_status.forEach((subs_status, index) => {
            if(subs_status) {
              coinsubs.support_market.push(coin.sub_market[index])
            }
          });

          coinsubs['count'] = coinsubs.support_market.length;
          return coinsubs;

        });
        
        this.socket.send(JSON.stringify(subscribe));
      }
      

    }
    else if(getMessage.type === 'update') {
      this.setState({
        orderbook : getMessage.orderbook,
        status    : getMessage.status
      });
    }
        
  }

  onSocketOpen = () => {

    let subscribe = {
      channel  : "init"
    }

    this.socket.send(JSON.stringify(subscribe));
  }

  componentDidMount() {
    this.socket = new WebSocket('ws://localhost:3600');
    // this.socket = new WebSocket('ws://13.125.2.107:3600');
    this.socket.onopen = () => this.onSocketOpen()
    this.socket.onmessage = (m) => this.onSocketMessage(m.data);
  }

  clickCoinSelect = (coin) => {
    const marketInfo = this.marketInfo.getMarketInfo();
    this.state.orderbookArr.map(item => {
      if(item.market === coin) {
        this.sendBtn.getInformations(item, marketInfo, coin);
        return;
      }
    })

  }

  render() {
    
    return (
      <Fragment>
        <Header />
        <MarketStatus marketStatus = {this.state.status}/>
        <div className="container card-list">
          <RenderCoinInfo orderbook={this.state.orderbook} count = {5} />
          <RenderCoinInfo orderbook={this.state.orderbook} count = {4} />
          <RenderCoinInfo orderbook={this.state.orderbook} count = {3} />
          <RenderCoinInfo orderbook={this.state.orderbook} count = {2} />

        </div>
      </Fragment>

    )
  }
}


class RenderCoinInfo extends Component {

  constructor(props) {
    super(props);
    this.state = {
      checked: false
    };

  }

  onClickCoinSelect = (e) => {
    const {onClickBtn} = this.props;
    onClickBtn(e.target.innerHTML)
  }

  render() {
    const modifyValues = function(values) {
      let modified = values * 10000;
      modified = Math.round(modified) / 10000;
  
      return modified;
    }

    const orderbookArea = this.props.orderbook? (
      this.props.orderbook.map((info, index) => {
        if(this.props.count === info.COUNT) {

          let parseOrderbook = info;
          let askPrice = Number(parseOrderbook.ASK.minAsk);
          let bidPrice = Number(parseOrderbook.BID.maxBid);
    
          let marketGap = bidPrice - askPrice;
          
          return (
            <Fragment>
              <div className="card darkgray" key = {index}>
                <Button color="info" onClick={this.onClickCoinSelect} >{info.COIN}[{info.COUNT}]</Button>
                <div className="line"></div>
                <div>
                  <div className="sellMarketText">{parseOrderbook.ASK.market} ASK</div>
                  <div className="sellMarketText">₩{parseOrderbook.ASK.minAsk} / {modifyValues(parseOrderbook.ASK.volume)} {info.market}</div>
      
                  <div className="value">₩{modifyValues(marketGap)}</div>
      
                  <div className="buyMarketText">{parseOrderbook.BID.market} BID</div>
                  <div className="buyMarketText">₩{parseOrderbook.BID.maxBid} / {modifyValues(parseOrderbook.BID.volume)} {info.market} </div>
      
                </div>
                <RenderArbCoinInfo coinInfo = {parseOrderbook} />
              </div>
            </Fragment>
          )
        }
        
      })    
    ) : null;

    return (
      <Fragment>
        {orderbookArea}
      </Fragment>

    )
  }
}

function RenderArbCoinInfo( {coinInfo}) {
  if(!coinInfo) {
    return;
  }
  else {
    let parseOrderbook = (coinInfo);
    let askVol = Number(parseOrderbook.ASK.volume);
    let bidVol = Number(parseOrderbook.BID.volume);

    let askPrice = Number(parseOrderbook.ASK.minAsk);
    let bidPrice = Number(parseOrderbook.BID.maxBid);
    
    let minCoinVol = (askVol > bidVol) ? bidVol : askVol;

    // Fiat Benefit
    let requiredFiatFunds = (askPrice*minCoinVol);
    let fiatProfit = minCoinVol * (bidPrice - askPrice);
    fiatProfit = fiatProfit;

    // Crypto Coin Benefit
    let requiredCoinFunds = (minCoinVol * bidPrice);
    let coinProfit = (requiredCoinFunds/askPrice - minCoinVol);

    // Common value.
    let percentageProfit = (coinProfit/minCoinVol) * 100;
    percentageProfit = percentageProfit;

    // calculate values for visiual.
    let digit = 4;
    requiredCoinFunds = Math.round(requiredCoinFunds * Math.pow(10,digit)) / Math.pow(10,digit);
    coinProfit = Math.round(coinProfit * Math.pow(10,digit)) / Math.pow(10,digit);
    minCoinVol = Math.round(minCoinVol * Math.pow(10,digit)) / Math.pow(10,digit);

    return (
      <div className="card medgray">
        {/* <div className="title">{info.market}</div> */}
        <div className="line"></div>
        <div className="profitTab1st">
          <div className="profitTitle">Fiat Benefit</div>
          <div className="benefit">Req. Funds : ₩ {Math.floor(requiredFiatFunds)}</div>
          <div className="benefit">Profit     : ₩ {Math.floor(fiatProfit)}</div>
          <div className="line"></div>

          <div className="profitTitle">Coin Benefit</div>
          <div className="benefit">Req. Funds : ₩ {Math.floor(requiredCoinFunds)}</div>
          <div className="benefit">Profit     : {coinProfit} {parseOrderbook.COIN}</div>
          <div className="line"></div>
          <div className="common">Trade Vol : {minCoinVol} {parseOrderbook.COIN}</div>
          <div className="common">Percentage : {Math.round(percentageProfit*100)/100}%</div>

        </div>
      </div>
    )
  }

}

export default Arbitrage;

