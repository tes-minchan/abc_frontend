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
        </div>

      </Fragment>

    )
  }
}

function RenderOrderbookCard({orderbook}) {

  const orderbookArea = orderbook? (

    orderbook.map((info, index) => {
      let parseOrderbook = JSON.parse(info.orderbook);
      let marketGap = Number(parseOrderbook.buy.maxAsk) - Number(parseOrderbook.sell.minBid);

      return (
        <div className="card medgray" key = {index}>
          <div className="title">{info.market}</div>
          <div className="line"></div>
          <div>
            <div className="buyMarketText">{parseOrderbook.buy.market} </div>
            <div className="buyMarketText">{parseOrderbook.buy.maxAsk} </div>
            <div className="buyMarket"> {parseOrderbook.buy.volume}</div>

            <div className="value">{marketGap}</div>
            <div className="sellMarketText">{parseOrderbook.sell.market}</div>
            <div className="sellMarketText">{parseOrderbook.sell.minBid} </div>
            <div className="sellMarket">{parseOrderbook.sell.volume}</div>

          </div>
        </div>
     
      )
    })    
  ) : null;

  return orderbookArea;

}

export default Arbitrage;

