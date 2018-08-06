import React, { Component, Fragment } from 'react';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import Header from 'components/Header';
import './Arbitrage.css';
import _ from 'underscore';

class Arbitrage extends Component {

  constructor(props) {
    super(props);
    this.state = {};
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
    this.socket.onmessage = (m) => this._getMessage(m.data)
  }

  render() {
    return (
      <Fragment>
        <Header />
        <div className="container card-list">
          <RenderOrderbookCard orderbook={this.state.orderbookArr}/>
          <RenderArbitrageCard orderbook={this.state.orderbookArr}/>

        </div>

      </Fragment>

    )
  }
}

function RenderOrderbookCard({orderbook}) {

  const orderbookArea = orderbook? (
    
    orderbook.map((info, index) => {
      let parseOrderbook = JSON.parse(info.orderbook);
      let askPrice = Number(parseOrderbook.sell.maxAsk);
      let bidPrice = Number(parseOrderbook.buy.minBid);

      let marketGap = askPrice - bidPrice;
      
      return (
        <div className="card darkgray" key = {index}>
          <div className="title">{info.market}</div>
          <div className="line"></div>
          <div>

            <div className="sellMarketText">{parseOrderbook.sell.market}</div>
            <div className="sellMarketText">{parseOrderbook.sell.maxAsk} </div>
            <div className="sellMarket">{parseOrderbook.sell.volume}</div>

            <div className="value">{marketGap}</div>

            <div className="buyMarketText">{parseOrderbook.buy.market} </div>
            <div className="buyMarketText">{parseOrderbook.buy.minBid} </div>
            <div className="buyMarket"> {parseOrderbook.buy.volume}</div>

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
      let askVol = Number(parseOrderbook.sell.volume);
      let bidVol = Number(parseOrderbook.buy.volume);

      let askPrice = Number(parseOrderbook.sell.maxAsk);
      let bidPrice = Number(parseOrderbook.buy.minBid);

      let minCoinVol = (askVol > bidVol) ? bidVol : askVol;
      let requireMoney = (askPrice*minCoinVol).toFixed(1);
      let possiableProfit = Math.floor(minCoinVol*(askPrice - bidPrice));

      let percentageProfit = (possiableProfit/requireMoney) * 100;
      percentageProfit = percentageProfit.toFixed(2);

      // ******* //
      // 1st
      let maxRequireMoney = minCoinVol * askPrice;

      // 2nd 
      // minCoinVol

      // 3rd 
      let profit2 = maxRequireMoney/bidPrice - minCoinVol;


      let profit2_percentage = (profit2/minCoinVol) * 100;
      profit2_percentage = profit2_percentage.toFixed(2);

      return (
        <div className="card medgray" key = {index}>
          <div className="title">{info.market}</div>
          <div className="line"></div>
          <div>
            <div className="buyMarketText">M.C.V : {minCoinVol} </div>
            <div className="buyMarketText">R.M : {requireMoney} </div>
            <div className="buyMarketText">Profit : {possiableProfit}</div>
            <div className="buyMarketText"> {percentageProfit}%</div>

            <div className="line"></div>

            <div className="sellMarketText">Max : {maxRequireMoney}</div>
            <div className="sellMarketText">R.Coin : {minCoinVol} </div>
            <div className="sellMarket">Profit : {profit2}</div>
            <div className="sellMarket">{profit2_percentage}%</div>

          </div>
        </div>
     
      )
    })    
  ) : null;

  return orderbookArea;
}
export default Arbitrage;

