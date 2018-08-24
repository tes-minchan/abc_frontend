import React, { Component, Fragment } from 'react';
import { Table, Button, Container, Row, Col  } from 'reactstrap';

import Header from 'components/Header';
import MarketStatus from 'components/MarketStatus';
import Modal from 'components/Modal'

import './Orderbook.css';
import websocket from 'config';
import * as Api from 'lib/api';
import * as Util from 'lib/utils';

class Orderbook extends Component {

  constructor(props) {
    super(props);
    this.state = {
      currency : "BTC",
      invest_rate : '1',
      invest_curremcy : "KRW"
    };

    this.orderbook_coin = ['BTC', 'ETH', 'EOS', 'BCH', 'BTG', 'ETC', 'XRP', 'ZRX', 'REP'];

  }

  onClickSelectCoin = (e) => {

    let subscribe = {
      channel  : "subscribe_orderbook",
      currency : e.target.id
    }

    this.socket.send(JSON.stringify(subscribe));

    this.setState({
      currency : e.target.id
    })

    // modal open func
    // this.test.open();
  }

  onClickInvestRate = (e) => {

    this.setState({
      invest_rate : e.target.id
    })
  }

  onClickInvestCurrency = (e) => {
    this.setState({
      invest_curremcy : e.target.id
    })
  }

  convertFloatDigit = (number,digit) => {

    return Math.floor(number * Math.pow(10,digit)) / Math.pow(10,digit);
  }

  calculateCoinBenefit = (coinInfo) => {

    let askVol = Number(coinInfo.ASK[0].volume);
    let bidVol = Number(coinInfo.BID[0].volume);

    let askPrice = Number(coinInfo.ASK[0].price);
    let bidPrice = Number(coinInfo.BID[0].price);
    
    let minCoinVol = (askVol > bidVol) ? bidVol : askVol;

    // Fiat Benefit!
    let requiredFiatFunds = (askPrice*minCoinVol);
    let fiatProfit = minCoinVol * (bidPrice - askPrice);

    // Crypto Coin Benefit
    let requiredCoinFunds = (minCoinVol * bidPrice);
    let coinProfit = (requiredCoinFunds/askPrice - minCoinVol);

    // Common value.
    let percentageProfit = (coinProfit/minCoinVol) * 100;
    percentageProfit = percentageProfit;

    return {
      fiat : {
        benefit : Math.floor(requiredFiatFunds),
        profit  : Math.floor(fiatProfit)
      },
      coin : {
        benefit : Math.floor(requiredCoinFunds),
        profit  : this.convertFloatDigit(coinProfit, 6)
      },
      tradeVol   : minCoinVol,
      precentage : this.convertFloatDigit(percentageProfit,2)
    }
    
  }

  calculateOrdesend = (buy, sell) => {
    const buyWallet   = this.state.WALLET ? this.state.WALLET[buy.market] : 0;
    const sellWallet  = this.state.WALLET ? this.state.WALLET[sell.market] : 0;
    const fiatFunds   = this.state.ARB_INFO ? this.state.ARB_INFO.fiat.benefit : 0; 
    const coinFunds   = this.state.ARB_INFO ? this.state.ARB_INFO.coin.benefit : 0;
    const tradeVolume = buy.volume > sell.volume ? sell.volume : buy.volume;

    let krwBalance   = 0;
    let coinBalance  = 0;
    let buyVolume    = 0;
    let sellVolume   = 0;
    
    if(buyWallet) {
      krwBalance = Util.convertFloatDigit(buyWallet['KRW'].available,6);
    }

    if(sellWallet) {
      coinBalance = sellWallet[this.state.currency] ? sellWallet[this.state.currency] : 0;

      if(coinBalance) {
        coinBalance = Util.convertFloatDigit(coinBalance.available, 6);
        sellVolume = krwBalance / buy.price;
        sellVolume = sellVolume > tradeVolume ? tradeVolume : sellVolume;
        sellVolume = sellVolume > coinBalance ? coinBalance : sellVolume;
      }
    }

    if(this.state.invest_curremcy === 'KRW') {
      buyVolume = sellVolume;
    }
    else {
      buyVolume = (sellVolume * sell.price) / buy.price;
    }

    buyVolume  = Util.convertFloatDigit(buyVolume,6);
    sellVolume = Util.convertFloatDigit(sellVolume,6);


    return {
      krw_balance  : krwBalance,
      krw_funds    : fiatFunds,
      coin_balance : coinBalance,
      coin_funds   : coinFunds,
      buy_market   : buy.market,
      buy_price    : buy.price,
      buy_volume   : buyVolume * Number(this.state.invest_rate),
      sell_market  : sell.market,
      sell_price   : sell.price,
      sell_volume  : sellVolume * Number(this.state.invest_rate)
    }

  }

  onSocketMessage = (message) => {
    let parseJson = JSON.parse(message);

    if(parseJson.type === 'orderbook') {
      const orderbook = parseJson.data;

      if(orderbook.ASK.length !== 0 && orderbook.BID.length !== 0) {
        let askPrice = Number(orderbook.ASK[0].price);
        let bidPrice = Number(orderbook.BID[0].price);

        const arbInfo = this.calculateCoinBenefit(orderbook);

        let ask_orderbook = [];
        orderbook.ASK.map((orderbook, index) => {
          if(index < 10) {
            ask_orderbook.push(orderbook);
          }
        });
        
        let buyInfo = {
          market : ask_orderbook[0].market,
          price  : ask_orderbook[0].price,
          volume : ask_orderbook[0].volume
        }

        let sellInfo = {
          market : orderbook.BID[0].market,
          price  : orderbook.BID[0].price,
          volume : orderbook.BID[0].volume
        }

        const ordersendInfo = this.calculateOrdesend(buyInfo, sellInfo);

        this.setState({
          ASK : ask_orderbook.reverse(),
          BID : orderbook.BID, 
          GAP : (bidPrice - askPrice),
          ARB_INFO  : arbInfo,
          ORDERSEND : ordersendInfo,
          ORDERSEND_BUY  : buyInfo,
          ORDERSEND_SELL : sellInfo,

        });
      }
    }
    else if(parseJson.type === 'market_status') {
      this.setState({
        market_status : parseJson.status
      })
    }

  }


  onSocketOpen = () => {

    let subscribe = {
      channel  : "subscribe_orderbook",
      currency : this.state.currency
    }

    this.socket.send(JSON.stringify(subscribe));

  }


  componentDidMount() {
    this.socket = new WebSocket(websocket.URL);
    this.socket.onopen = () => this.onSocketOpen()
    this.socket.onmessage = (m) => this.onSocketMessage(m.data);

    const loginCheck = sessionStorage.getItem('token')? sessionStorage.getItem('token') : null;

    if(loginCheck) {
      // Get User Wallet Info.
      Api.GetBalance()
      .then((data) => {
  
        this.setState({
          WALLET : data.data
        });

      }, (err) => {
        console.log(err.response)
      });
    }


  }


  render() {

    const askOrderbookArea = this.state.ASK? (
      <tbody className="orderbook-tbody">
        {

          this.state.ASK.map((item, index) => {
            if(index < 10) {
              return (
                <tr>
                  <td style={{width:"200px"}}>{item.price}</td>
                  <td style={{width:"200px"}}>{item.volume}</td>
                  <td style={{width:"200px"}}>{item.market}</td>
                </tr>
              );
            }
          })
        }
      </tbody>

    ) : null;

    const bidOrderbookArea = this.state.BID? (
      <tbody className="orderbook-tbody">
        {
          this.state.BID.map((item, index) => {
            if(index < 10) {

              return (
                <tr>
                  <td style={{width:"200px"}}>{item.price}</td>
                  <td style={{width:"200px"}}>{item.volume}</td>
                  <td style={{width:"200px"}}>{item.market}</td>
                </tr>
              );
            }
          })
        }
      </tbody>

    ) : null;

    const arbInfoArea = this.state.ARB_INFO? (
      <div className="arbitrage-info">
        <span style={{color:"#dfe6e9"}}> Fiat </span>
          Req.funds : ₩ {this.state.ARB_INFO.fiat.benefit} Profit : ₩ {this.state.ARB_INFO.fiat.profit}
        <span style={{color:"#dfe6e9"}}> Coin </span> 
          Req.funds : ₩ {this.state.ARB_INFO.coin.benefit} Profit : {this.state.ARB_INFO.coin.profit} {this.state.currency}<br/>
        <span style={{color:"#F79F1F"}}> {this.state.ARB_INFO.precentage}% </span>
      </div>

    ) : null;

    const orderSendArea = (ordersendInfo) => {
      if(!ordersendInfo) {
        return;
      }
      else {

        return (
          <Fragment>
            <Col>
              <div className="ordersend-container">
                <p>
                  <div style={{fontSize:"20px"}}>{ordersendInfo.buy_market}</div>
                  <div className="ordersend-balance">KRW Balance : </div> <div className="ordersend-values"> ₩ {ordersendInfo.krw_balance}</div>
                  <div className="ordersend-balance" >Req Funds : </div> <div className="ordersend-values"> ₩ {ordersendInfo.krw_funds}</div>
                </p>
              </div>
                                    
              <form className="ordersend-form">  
                <span className="ordersendText">Price : </span>    
                <input name="Price" type="text" className="ordersend-input" placeholder="Price" value={ordersendInfo.buy_price} />   
                <span className="ordersendText">Volume : </span>    
                <input name="Volume" type="text" className="ordersend-input" placeholder="Volume" value={ordersendInfo.buy_volume}/>
                <input type="submit" value="BUY" className="ordersend-buy-button"/>
              </form>
            </Col>
            <Col>
              <div className="ordersend-container">
                <p>
                  <div style={{fontSize:"20px"}}>{ordersendInfo.sell_market}</div>
                  <div className="ordersend-balance">Coin Balance : </div> <div className="ordersend-values"> {ordersendInfo.coin_balance} {this.state.currency} </div>
                  <div className="ordersend-balance" >Expt Funds : </div> <div className="ordersend-values"> ₩ {ordersendInfo.coin_funds} </div>
                </p>

              </div>

              <form className="ordersend-form">   
                <span className="ordersendText">Price : </span>       
                <input name="Price" type="text" className="ordersend-input" placeholder="Price" value={ordersendInfo.sell_price} />   
                <span className="ordersendText">Volume : </span>    
                <input name="Volume" type="text" className="ordersend-input" placeholder="Volume" value={ordersendInfo.sell_volume} />
                <input type="submit" value="SELL" className="ordersend-sell-button"/>
              </form>
            </Col>

          </Fragment>
        )
      }
    }

    return(
      <Fragment>
        <Header />
        <MarketStatus /><br /><br />

        {/* coin select button */}
        <div className="orderbook-select">
          {
            this.orderbook_coin.map(coin => {
              if(this.state.currency === coin) {
                return (
                  <Button className="orderbook-button" color="warning" onClick={this.onClickSelectCoin} id={coin} >{coin}</Button>
                )
              }
              else {

                return (
                  <Button className="orderbook-button" color="secondary" onClick={this.onClickSelectCoin} id={coin} >{coin}</Button>
                )
              }
            })
          }

        </div>
        
        {/* arbitrage information */}
        {arbInfoArea}
        
        <Container>
          <Row>
            <Col>
            {/* coin orderbook */}
            <div className="orderbook-content">

              <table className="orderbook-table">
                  {askOrderbookArea}
              </table>  

              <h3>
                <span className="gapText">{this.state.currency}  </span> 
                <span className="gapNumber">  {this.state.GAP}</span>
              </h3>

              <table className="orderbook-table">
                  {bidOrderbookArea}
              </table>  
            </div>
            </Col>

            <Col>

              <Container>
                <Col>
                  <Button className="ordersend-invest-rate" color={this.state.invest_rate === '1' ? 'warning' : 'secondary'} 
                  onClick={this.onClickInvestRate} id={"1"} >100%</Button>  

                  <Button className="ordersend-invest-rate" color={this.state.invest_rate === '0.5' ? 'warning' : 'secondary'}
                  onClick={this.onClickInvestRate} id={"0.5"} >50%</Button>
                  <Button className="ordersend-invest-rate" color={this.state.invest_rate === '0.1' ? 'warning' : 'secondary'}
                  onClick={this.onClickInvestRate} id={"0.1"} >10%</Button>
                </Col>

                <Col>
                  <Button className="ordersend-invest-rate" color={this.state.invest_curremcy === 'KRW' ? 'warning' : 'secondary'}
                  onClick={this.onClickInvestCurrency} id={"KRW"}>KRW</Button>  
                  <Button className="ordersend-invest-rate" color={this.state.invest_curremcy === 'COIN' ? 'warning' : 'secondary'}
                  onClick={this.onClickInvestCurrency} id={"COIN"}>COIN</Button>
                </Col>

                <Col>
                  <Container>
                    <Row>
                      {orderSendArea(this.state.ORDERSEND)}
                    </Row>

                  </Container>

                </Col>
                <Col>
                  <form className="ordersend-form">  
                    <input type="submit" value="BUY-SELL" className="ordersend-arb-button"/>    
                  </form>
                </Col>
                
              </Container>
 
            </Col>
          </Row>

        </Container>
        
        <Modal onRef={(ref)=>{this.test = ref}}/>

      </Fragment>
       

    )
  }

}


export default Orderbook;
