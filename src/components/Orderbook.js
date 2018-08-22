import React, { Component, Fragment } from 'react';
import { Table, Button, Container, Row, Col  } from 'reactstrap';

import Header from 'components/Header';
import MarketStatus from 'components/MarketStatus';

import './Orderbook.css';


class Orderbook extends Component {

  constructor(props) {
    super(props);
    this.state = {
      currency : "ETH"
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

        this.setState({
          ASK : ask_orderbook.reverse(),
          BID : orderbook.BID, 
          GAP : (bidPrice - askPrice),
          ARB_INFO : arbInfo

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
    //this.socket = new WebSocket('ws://localhost:3600');
    this.socket = new WebSocket('ws://13.125.2.107:3600');
    this.socket.onopen = () => this.onSocketOpen()
    this.socket.onmessage = (m) => this.onSocketMessage(m.data);
  }


  render() {

    const askOrderbookArea = this.state.ASK? (
      <div>
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
      </div>

    ) : null;

    const bidOrderbookArea = this.state.BID? (
      <div>
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
      </div>

    ) : null;

    const arbInfoArea = this.state.ARB_INFO? (
      <div className="arbitrage-info">
        <span style={{color:"#dfe6e9"}}> Fiat Req.funds : </span> 
          ₩ {this.state.ARB_INFO.fiat.benefit} 
        <span style={{color:"#dfe6e9"}}>  Profit : </span>
          ₩ {this.state.ARB_INFO.fiat.profit}
        <span style={{color:"#dfe6e9"}}> || Coin Req.funds : </span> 
          ₩ {this.state.ARB_INFO.coin.benefit} 
        <span style={{color:"#dfe6e9"}}>  Profit : </span>
          ₩ {this.state.ARB_INFO.coin.profit} <br/>
        <span style={{color:"#F79F1F"}}> {this.state.ARB_INFO.precentage}% </span>
      </div>

    ) : null;

    return(
      <Fragment>
        <Header />
        <MarketStatus /><br /><br />

        {/* coin select button */}
        <div className="orderbook-select">
          {
            this.orderbook_coin.map(coin => {
              return (
                <Button className="orderbook-button" color="info" onClick={this.onClickSelectCoin} id={coin} >{coin}</Button>
              )
            })
          }

        </div>
        
        {/* arbitrage information */}
        {arbInfoArea}
        
        <Container>
          <Row>
            <Col>
            <div className="orderbook-content">

              <table className="orderbook-table">
                  {askOrderbookArea}
              </table>  

              <p>
                <h3>
                  <span className="gapText">{this.state.currency}  </span> 
                  <span className="gapNumber">  {this.state.GAP}</span>
                </h3>
              </p>

              <table className="orderbook-table">
                  {bidOrderbookArea}
              </table>  
            </div>
            </Col>
            <Col>

                  <span className="gapText">{this.state.currency}  </span> 

            </Col>
          </Row>

        </Container>
        
      </Fragment>
       

    )
  }

}


export default Orderbook;

