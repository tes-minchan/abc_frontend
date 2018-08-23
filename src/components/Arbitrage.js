import React, { Component, Fragment } from 'react';

import Header from 'components/Header';
import MarketStatus from 'components/MarketStatus';

import './Arbitrage.css';
import websocket from 'config';

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

    if(getMessage.type === 'init_dashboard') {

      if(!this.userSubscribeCoin) {
        let subscribe_coin = getMessage.coinList.map(coin => {
          let subscribe = {
            name : coin.name,
            ASK : {
              support_market : coin.support_market,
              sub_status : []
            },
            BID : {
              support_market : coin.support_market,
              sub_status : []
            }
          }

          // Default coin subscribe status set to true.
          coin.support_market.forEach(market => {
            subscribe.ASK.sub_status.push(true);
            subscribe.BID.sub_status.push(true);
          });
  
          return subscribe;
        });
        sessionStorage.setItem('subsCoinList',JSON.stringify(subscribe_coin));

        // subscribe all market.
        let subscribe = {
          channel   : "update_dashboard",
          subscribe : subscribe_coin
        }
        this.socket.send(JSON.stringify(subscribe));
      }
      else {

        let getSessionSubsCoin = JSON.parse(sessionStorage.getItem('subsCoinList'));

        let subscribe = {
          channel  : "update_dashboard",
        }

        subscribe['subscribe'] = getSessionSubsCoin.map(coin => {

          let subscrieb_coin = {
            name : coin.name,
            ASK : {
              support_market : [],
              count      : 0
            },
            BID : {
              support_market : [],
              count      : 0
            }
          }

          coin.ASK.sub_status.forEach((check, index) => {
            if(check) {
              subscrieb_coin.ASK.support_market.push(coin.ASK.support_market[index]);
            }
          });

          coin.BID.sub_status.forEach((check, index) => {
            if(check) {
              subscrieb_coin.BID.support_market.push(coin.BID.support_market[index]);
            }
          });

          subscrieb_coin.ASK.count = subscrieb_coin.ASK.support_market.length;
          subscrieb_coin.BID.count = subscrieb_coin.BID.support_market.length;

          return subscrieb_coin;

        });
        this.socket.send(JSON.stringify(subscribe));

      }

    }
    else if(getMessage.type === 'update_dashboard') {
      this.setState({
        orderbook : getMessage.orderbook
      });
    }
        
  }

  onSocketOpen = () => {

    let subscribe = {
      channel  : "init_dashboard"
    }

    this.socket.send(JSON.stringify(subscribe));
  }

  componentDidMount() {
    this.socket = new WebSocket(websocket.URL);
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
        <MarketStatus />
        <div className="container card-list">
          <RenderCoinInfo orderbook={this.state.orderbook} />

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

  componentDidMount() {

  }

  openModal= (e) => {
    this.setState({
      modalIsOpen: true,
      modalInfo : e.target.id,
      volume : this.props.orderbook[0].ASK.volume
    });
  }
 
  afterOpenModal= () => {
    // references are now sync'd and can be accessed.
    this.subtitle.style.color = '#f00';
  }
 
  closeModal= () => {
    this.setState({modalIsOpen: false});
  }

  onClickCoinSelect = (e) => {
    console.log(e.target.id)
  }

  render() {
    const modifyValues = function(values) {
      let modified = values * 10000;
      modified = Math.floor(modified) / 10000;
  
      return modified;
    }

    const orderbookArea = this.props.orderbook? (
      this.props.orderbook.map((info, index) => {
          let parseOrderbook = info;
          let askPrice = Number(parseOrderbook.ASK.minAsk);
          let bidPrice = Number(parseOrderbook.BID.maxBid);
    
          let marketGap = bidPrice - askPrice;
          
          return (
            <Fragment>
              <div className="card darkgray" key = {index}>
                <span style={{fontSize:"14spx"}}>{info.COIN}</span>
                <div className="line"></div>

                <div>
                  <div className="sellMarketText">{parseOrderbook.ASK.market} ASK [{info.ASK_MARKET_COUNT}]</div>
                  <div className="sellMarketText">₩{parseOrderbook.ASK.minAsk} / {modifyValues(parseOrderbook.ASK.volume)} {info.market}</div>
      
                  <div className="value">₩{modifyValues(marketGap)}</div>
      
                  <div className="buyMarketText">{parseOrderbook.BID.market} BID [{info.BID_MARKET_COUNT}]</div>
                  <div className="buyMarketText">₩{parseOrderbook.BID.maxBid} / {modifyValues(parseOrderbook.BID.volume)} {info.market} </div>
      
                </div>
                <RenderArbCoinInfo coinInfo = {parseOrderbook} />
              </div>

            </Fragment>
          )
        
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

    // Crypto Coin Benefit
    let requiredCoinFunds = (minCoinVol * bidPrice);
    let coinProfit = (requiredCoinFunds/askPrice - minCoinVol);

    // Common value.
    let percentageProfit = (coinProfit/minCoinVol) * 100;
    percentageProfit = percentageProfit;

    // calculate values for visiual.
    let digit = 4;
    requiredCoinFunds = Math.floor(requiredCoinFunds * Math.pow(10,digit)) / Math.pow(10,digit);
    coinProfit = Math.floor(coinProfit * Math.pow(10,digit)) / Math.pow(10,digit);
    minCoinVol = Math.floor(minCoinVol * Math.pow(10,digit)) / Math.pow(10,digit);

    return (
      <div className="card medgray">
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
          <div className="common">Percentage : {Math.floor(percentageProfit*100)/100}%</div>

        </div>
      </div>
    )
  }

}

export default Arbitrage;

