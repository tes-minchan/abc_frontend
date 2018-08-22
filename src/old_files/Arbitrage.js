import React, { Component, Fragment } from 'react';
import { Button, Input } from 'reactstrap';
import Switch from "react-switch";

import PropTypes from 'prop-types'

import Header from 'components/Header';
import MarketInfo from 'components/MarketInfo';

// import './Arbitrage.css';
import _ from 'underscore';
import * as Api from 'lib/api';

class Arbitrage extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
    this.coinList   = ['BTC', 'ETH', 'EOS', 'XRP', 'ZRX'];
    this.marketList = ['UPBIT', 'BITHUMB', 'COINONE', 'GOPAX', 'CASHIEREST', 'KORBIT'];
  }


  onSocketMessage = (message) => {
    let getMessage    = JSON.parse(message);

    console.log(getMessage);

    // let orderbookArr = [];

    // _.map(getMessage.market,(item,index) => {
    //   let orderbook = {
    //     market : item,
    //     orderbook : getMessage.data[index]
    //   }

    //   orderbookArr.push(orderbook);
    // })

    // this.setState({
    //   orderbookArr
    // })
    
  }

  onSocketOpen = () => {
    const getSubscribeCoin = sessionStorage.getItem('arbitrabe_subscribe');
    let toSetStorage = {};

    let subscribe = {
      channel  : "getmarketinfo"
    }

    if(!getSubscribeCoin) {

      this.coinList.map(coin => {
        let coinObj = {
          askmarket : [],
          bidmarket : []
        };
  
        this.marketList.map(market => {
          coinObj.askmarket.push(market);
          coinObj.bidmarket.push(market);
  
        });
        toSetStorage[coin] = coinObj;
      });

      subscribe.sub_coin = JSON.stringify(toSetStorage);
    }
    else {
      subscribe.sub_coin = getSubscribeCoin;

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
    const {clickCoinSelect} = this;
    return (
      <Fragment>
        <Header />
        <MarketInfo onRef={ (el) => this.marketInfo = el}/>
        <div className="container card-list">
          <RenderCoinInfo orderbook={this.state.orderbookArr} onClickBtn={clickCoinSelect}/>
          {/* <RenderOrderbookCard orderbook={this.state.orderbookArr}/> */}
          <RenderArbitrageCard orderbook={this.state.orderbookArr}/>
          <RenderOrdersendButton orderinfo ={"11"} onRef={ (el) => this.sendBtn = el} />
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
  handleChange = (checked) => {
    this.setState({
      checked : checked
    })
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
        let parseOrderbook = (info.orderbook);
        let askPrice = Number(parseOrderbook.buy.minAsk);
        let bidPrice = Number(parseOrderbook.sell.maxBid);
  
        let marketGap = bidPrice - askPrice;
        
        return (
          <div className="card darkgray" key = {index}>
            <Button color="info" onClick={this.onClickCoinSelect} >{info.market}</Button>
            <div className="line"></div>
            <div>
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


class RenderOrdersendButton extends Component {

  static propTypes = {
    onRef: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    this.props.onRef(this)
  }
  componentWillUnmount() {
    this.props.onRef(undefined)
  }

  onClickBuy = () => {
    const {price, volume} = this.state;
    console.log(price, volume)
  }

  onClickSell = () => {
    console.log(2)
  }

  getInformations = (orderbook, marketBalance, coin) => {
    // let userInfos = JSON.parse(marketBalance);
    console.log(orderbook);
    _.map(marketBalance, (values , coin) => {
      console.log(coin, values);
    });
    
    // const valPrice = orderbook.orderbookArr[0].market;
    // const valVolume = orderbook.orderbookArr[0].market+"178236712";
    
    // this.setState({
    //   price:valPrice,
    //   volume: valVolume,
    // })
  }

  state = { 
    price:0,
    volume:0
  }

  render() {
    const {orderinfo} = this.props;
    const {onClickBuy, onClickSell} = this;
    const {price, volume} = this.state;

    let orderbookButton = orderinfo? (
      <div>
  
        <div className="ordersendcard orange">
          <div className="title">BUY</div>
          <div>
            <Input name="buy_price" id="buy_price" placeholder="price" value={price} onChange={(e)=> this.setState({price:e.target.value})}/> <br />
            <Input name="volume" id="volume" placeholder="volume" value={volume}/> <br />
            <Button onClick={onClickBuy}>BUY</Button>
          </div>
        </div>
  
        <div className="ordersendcard orange">
          <div className="title">ARBITRAGE</div>
          <div>
            <Button onClick={onClickSell}>BUY && SELL</Button>
  
          </div>
        </div>
  
        <div className="ordersendcard orange">
          <div className="title">SELL</div>
          <div>
            <Input name="price" id="price" placeholder="price" /> <br />
            <Input name="volume" id="volume" placeholder="volume" /> <br />
            <Button onClick={onClickSell}>SELL</Button>
          </div>
        </div>
  
      </div>
    ) : null;

    return (
      <Fragment>
        {orderbookButton}
      </Fragment>

    )
  }
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
      let parseOrderbook = (info.orderbook);
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

