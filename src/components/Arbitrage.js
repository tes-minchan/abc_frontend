import React, { Component, Fragment } from 'react';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import Header from 'components/Header';
import MarketInfo from 'components/MarketInfo';

import './Arbitrage.css';
import _ from 'underscore';
import * as Api from 'lib/api';

class Arbitrage extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  _getMessage = (message) => {
    let getMessage    = JSON.parse(message);
    let orderbookArr = [];

    _.map(getMessage.market,(item,index) => {
      let orderbook = {
        market : item,
        orderbook : getMessage.data[index]
      }

      orderbookArr.push(orderbook);
    })

    this.setState({
      orderbookArr
    })
    
  }

  onSocketOpen = () => {
    let subscribe = {
      channel : "Arbitrage",
    }

    this.socket.send(JSON.stringify(subscribe));
  }

  componentDidMount() {
    this.socket = new WebSocket('ws://localhost:3600');
    // this.socket = new WebSocket('ws://13.125.2.107:3600');
    this.socket.onopen = () => this.onSocketOpen()
    this.socket.onmessage = (m) => this._getMessage(m.data);

  }

  render() {
    return (
      <Fragment>
        <Header />
        <MarketInfo />
        <div className="container card-list">
          <RenderCoinInfo orderbook={this.state.orderbookArr} />
          {/* <RenderOrderbookCard orderbook={this.state.orderbookArr}/> */}
          <RenderArbitrageCard orderbook={this.state.orderbookArr}/>
          <RenderOrdersendButton orderinfo ={""}/>
        </div>
      </Fragment>

    )
  }
}

class RenderCoinInfo extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  onClickCoinSelect = (e) => {
    console.log(e.target.innerHTML);
    console.log(this.refs);
  }

  render() {
    const modifyValues = function(values) {
      let modified = values * 10000;
      modified = Math.round(modified) / 10000;
  
      return modified;
    }
  
    const orderbookArea = this.props.orderbook? (
      
      this.props.orderbook.map((info, index) => {
        let parseOrderbook = JSON.parse(info.orderbook);
        let askPrice = Number(parseOrderbook.buy.minAsk);
        let bidPrice = Number(parseOrderbook.sell.maxBid);
  
        let marketGap = bidPrice - askPrice;
        
        return (
          <div className="card darkgray" key = {index}>
            <div className="title">{info.market}</div>
            <div className="line"></div>
            <div>
              <Button bsStyle="primary" onClick={this.onClickCoinSelect} id={info.market+ "_button"} >{info.market}</Button>
  
              <div className="sellMarketText">{parseOrderbook.buy.market} ASK</div>
              <div className="sellMarketText">₩{parseOrderbook.buy.minAsk} / {modifyValues(parseOrderbook.buy.volume)} {info.market}</div>
  
              <div className="value">₩{marketGap}</div>
  
              <div className="buyMarketText">{parseOrderbook.sell.market} BID</div>
              <div className="buyMarketText">₩{parseOrderbook.sell.maxBid} / {modifyValues(parseOrderbook.sell.volume)} {info.market} </div>
  
            </div>
          </div>
       
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

function RenderOrdersendButton(orderinfo) {
  function onClickButton() {
    console.log("BUY");
  }

  const ordersendArea = orderinfo? (
    <div>

      <div className="ordersendcard orange">
        <div className="title">BUY</div>
        <div>
          <Input name="buy_price" id="buy_price" placeholder="price" /> <br />
          <Input name="volume" id="volume" placeholder="volume" /> <br />
          <Button onClick={onClickButton}>BUY</Button>
        </div>
      </div>

      <div className="ordersendcard orange">
        <div className="title">ARBITRAGE</div>
        <div>
          <Button onClick={onClickButton}>BUY && SELL</Button>

        </div>
      </div>

      <div className="ordersendcard orange">
        <div className="title">SELL</div>
        <div>
          <Input name="price" id="price" placeholder="price" /> <br />
          <Input name="volume" id="volume" placeholder="volume" /> <br />
          <Button onClick={onClickButton}>SELL</Button>
        </div>
      </div>

    </div>
  ) : null;

  return ordersendArea;
}

function RenderOrderbookCard({orderbook}) {

  const modifyValues = function(values) {
    let modified = values * 10000;
    modified = Math.round(modified) / 10000;

    return modified;
  }

  const orderbookArea = orderbook? (
    
    orderbook.map((info, index) => {
      let parseOrderbook = JSON.parse(info.orderbook);
      let askPrice = Number(parseOrderbook.buy.minAsk);
      let bidPrice = Number(parseOrderbook.sell.maxBid);

      let marketGap = bidPrice - askPrice;
      
      return (
        <div className="card darkgray" key = {index}>
          <div className="title">{info.market}</div>
          <div className="line"></div>
          <div>
            <Button bsStyle="primary">Select</Button>

            <div className="sellMarketText">{parseOrderbook.buy.market} ASK</div>
            <div className="sellMarketText">₩{parseOrderbook.buy.minAsk} / {modifyValues(parseOrderbook.buy.volume)} {info.market}</div>

            <div className="value">₩{marketGap}</div>

            <div className="buyMarketText">{parseOrderbook.sell.market} BID</div>
            <div className="buyMarketText">₩{parseOrderbook.sell.maxBid} / {modifyValues(parseOrderbook.sell.volume)} {info.market} </div>

          </div>
        </div>
     
      )
    })    
  ) : null;

  return orderbookArea;

}

function RenderArbitrageCard({orderbook}) {

  const orderbookArea = orderbook? (
    
    orderbook.map((info, index) => {
      let parseOrderbook = JSON.parse(info.orderbook);
      let askVol = Number(parseOrderbook.buy.volume);
      let bidVol = Number(parseOrderbook.sell.volume);

      let askPrice = Number(parseOrderbook.buy.minAsk);
      let bidPrice = Number(parseOrderbook.sell.maxBid);
      
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
        <div className="card medgray" key = {index}>
          {/* <div className="title">{info.market}</div> */}
          <div className="line"></div>
          <div className="profitTab1st">
            <div className="profitTitle">Fiat Benefit</div>
            <div className="benefit">Req. Funds : ₩ {Math.floor(requiredFiatFunds)}</div>
            <div className="benefit">Profit     : ₩ {Math.floor(fiatProfit)}</div>
            <div className="line"></div>

            <div className="profitTitle">Coin Benefit</div>
            <div className="benefit">Req. Funds : ₩ {Math.floor(requiredCoinFunds)}</div>
            <div className="benefit">Profit     : {coinProfit} {info.market}</div>
            <div className="line"></div>
            <div className="common">Trade Vol : {minCoinVol} {info.market}</div>
            <div className="common">Percentage : {Math.round(percentageProfit*100)/100}%</div>

          </div>
        </div>
     
      )
    })    
  ) : null;

  return orderbookArea;
}




export default Arbitrage;

