import React, { Component, Fragment } from "react";
import { Button, Container, Row, Col } from "reactstrap";
import { AreaChart, Area, XAxis, YAxis } from "recharts";

import Header from "components/Header";
import MarketStatus from "components/MarketStatus";
import Modal from "components/Modal";

import "./Orderbook.css";
import websocket from "config";
import * as Api from "lib/api";
import * as Util from "lib/utils";
import _ from 'underscore';

class Orderbook extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currency: "BTC",
      invest_rate: "1",
      invest_curremcy: "KRW",
      chart_data: []
    };

    this.orderbook_coin = [
      "BTC",
      "ETH",
      "EOS",
      "BCH",
      "BTG",
      "ETC",
      "XRP",
      "ZRX",
      "REP"
    ];
    this.orderbookCount = 10;

    const userSubscribeCoin = sessionStorage.getItem('subsCoinList')? sessionStorage.getItem('subsCoinList') : null;
    this.subscribeMarket = JSON.parse(userSubscribeCoin);

  }

  onClickSelectCoin = e => {

    let toSubscribeMarket;
    const subCurrency = e.target.id;
    this.subscribeMarket.forEach(item => {
      if(item.name === subCurrency) {
        toSubscribeMarket = item;
        return;
      }
    })   
    
    let subscribe = {
      channel: "subscribe_orderbook",
      currency: e.target.id,
      subscribe_market : toSubscribeMarket
    };
    this.socket.send(JSON.stringify(subscribe));

    this.setState({
      currency: e.target.id
    });

  };

  onClickInvestRate = e => {
    this.setState({
      invest_rate: e.target.id
    });
  };

  onClickInvestCurrency = e => {
    this.setState({
      invest_curremcy: e.target.id
    });
  };

  /**
   * Ordersend Button Click Event
   */
  onClickOrdersend = e => {

    const orderinfo = {
      market : this.state.ORDERSEND.buy_market,
      coin   : this.state.currency,
      side   : e.target.id,
      price  : this.state.ORDERSEND.buy_price,
      volume : this.state.ORDERSEND.buy_volume,
    }

    Api.OrderSend(orderinfo)
    .then((data) => {
      console.log("onClickOrdersend");
      console.log(data);
    }, (err) => {
      // Need to error control
      console.log(err.response.data)
    });

  };

  convertFloatDigit = (number, digit) => {
    return Math.floor(number * Math.pow(10, digit)) / Math.pow(10, digit);
  };

  calculateCoinBenefit = coinInfo => {
    let askVol = Number(coinInfo.ASK[0].volume);
    let bidVol = Number(coinInfo.BID[0].volume);

    let askPrice = Number(coinInfo.ASK[0].price);
    let bidPrice = Number(coinInfo.BID[0].price);

    let minCoinVol = askVol > bidVol ? bidVol : askVol;

    // Fiat Benefit!
    let requiredFiatFunds = askPrice * minCoinVol;
    let fiatProfit = minCoinVol * (bidPrice - askPrice);

    // Crypto Coin Benefit
    let requiredCoinFunds = minCoinVol * bidPrice;
    let coinProfit = requiredCoinFunds / askPrice - minCoinVol;

    // Common value.
    let percentageProfit = (coinProfit / minCoinVol) * 100;
    percentageProfit = percentageProfit;

    return {
      fiat: {
        benefit: Math.floor(requiredFiatFunds),
        profit: Math.floor(fiatProfit)
      },
      coin: {
        benefit: Math.floor(requiredCoinFunds),
        profit: this.convertFloatDigit(coinProfit, 6)
      },
      tradeVol: minCoinVol,
      precentage: this.convertFloatDigit(percentageProfit, 2)
    };
  };

  calculateOrdesend = (buy, sell) => {
    const buyWallet = this.state.WALLET ? this.state.WALLET[buy.market] : 0;
    const sellWallet = this.state.WALLET ? this.state.WALLET[sell.market] : 0;
    const fiatFunds = this.state.ARB_INFO
      ? this.state.ARB_INFO.fiat.benefit
      : 0;
    const coinFunds = this.state.ARB_INFO
      ? this.state.ARB_INFO.coin.benefit
      : 0;
    const tradeVolume = buy.volume > sell.volume ? sell.volume : buy.volume;

    let krwBalance = 0;
    let coinBalance = 0;
    let buyVolume = 0;
    let sellVolume = 0;

    if (buyWallet) {
      krwBalance = Util.convertFloatDigit(buyWallet["KRW"].available, 6);
    }

    if (sellWallet) {
      coinBalance = sellWallet[this.state.currency]
        ? sellWallet[this.state.currency]
        : 0;

      if (coinBalance) {
        coinBalance = Util.convertFloatDigit(coinBalance.available, 6);
        sellVolume = krwBalance / buy.price;
        sellVolume = sellVolume > tradeVolume ? tradeVolume : sellVolume;
        sellVolume = sellVolume > coinBalance ? coinBalance : sellVolume;
      }
    }

    if (this.state.invest_curremcy === "KRW") {
      buyVolume = sellVolume;
    } else {
      buyVolume = (sellVolume * sell.price) / buy.price;
    }

    buyVolume = Util.convertFloatDigit(buyVolume, 6);
    sellVolume = Util.convertFloatDigit(sellVolume, 6);

    return {
      krw_balance: krwBalance,
      krw_funds: fiatFunds,
      coin_balance: coinBalance,
      coin_funds: coinFunds,
      buy_market: buy.market,
      buy_price: buy.price,
      buy_volume: buyVolume * Number(this.state.invest_rate),
      sell_market: sell.market,
      sell_price: sell.price,
      sell_volume: sellVolume * Number(this.state.invest_rate)
    };
  };

  createChartData = orderbook => {
    let chartData = [];
    let toSetChartData = [];
    let accumVol = 0;
    let askOrderbook = {};
    let bidOrderbook = {};

    orderbook.ASK.forEach(item => {
      accumVol += Number(item.volume);
      chartData.push(Number(item.price));
      askOrderbook[item.price] = accumVol;
    });

    accumVol = 0;
    orderbook.BID.forEach(item => {
      accumVol += Number(item.volume);
      chartData.push(Number(item.price));
      bidOrderbook[item.price] = accumVol;
    });

    chartData = chartData.sort(function(a, b) {
      return a - b;
    });

    chartData = Util.removeDuplicateArray(chartData);
    let prevAskVol = 0,
      prevBidVol = 0;
    const bidLength = Object.keys(bidOrderbook).length;

    chartData.forEach((price, index) => {
      if (index === 0) {
        toSetChartData.push({
          name: price,
          ASK: askOrderbook[price] ? askOrderbook[price] : 0,
          BID: bidOrderbook[price] ? bidOrderbook[price] : 0
        });
      } else {
        toSetChartData.push({
          name: price,
          ASK: askOrderbook[price] ? askOrderbook[price] : prevAskVol,
          BID: bidOrderbook[price] ? bidOrderbook[price] : prevBidVol
        });

        prevAskVol = toSetChartData[toSetChartData.length - 1].ASK;
        if (price >= Number(Object.keys(bidOrderbook)[bidLength - 1])) {
          prevBidVol = 0;
        } else {
          prevBidVol = toSetChartData[toSetChartData.length - 1].BID;
        }
      }
    });

    
    return (toSetChartData.map(item => {
      return (
        {
          ...item,
          GAP : item.ASK > item.BID ? item.BID : item.ASK
        }
      )
      }
    ));

  };

  onSocketMessage = message => {
    let parseJson = JSON.parse(message);

    if (parseJson.type === "orderbook") {
      const orderbook = parseJson.data;

      if (orderbook.ASK.length !== 0 && orderbook.BID.length !== 0) {
        let askPrice = Number(orderbook.ASK[0].price);
        let bidPrice = Number(orderbook.BID[0].price);

        const arbInfo = this.calculateCoinBenefit(orderbook);

        let ask_orderbook = [];
        orderbook.ASK.map((orderbook, index) => {
          if (index < 10) {
            ask_orderbook.push(orderbook);
          }
        });

        let buyInfo = {
          market: ask_orderbook[0].market,
          price: ask_orderbook[0].price,
          volume: ask_orderbook[0].volume
        };

        let sellInfo = {
          market: orderbook.BID[0].market,
          price: orderbook.BID[0].price,
          volume: orderbook.BID[0].volume
        };

        this.setState({
          chart_data: this.createChartData(orderbook),
          ASK: ask_orderbook.reverse(),
          BID: orderbook.BID,
          GAP: bidPrice - askPrice,
          ARB_INFO: arbInfo,
          ORDERSEND: this.calculateOrdesend(buyInfo, sellInfo)
        });
      }
    } else if (parseJson.type === "market_status") {
      this.setState({
        market_status: parseJson.status
      });
    }
  };

  onSocketOpen = () => {

    if(this.state) {

      let toSubscribeMarket;
      const subCurrency = this.state.currency;
      this.subscribeMarket.forEach(item => {
        if(item.name === subCurrency) {
          toSubscribeMarket = item;
          return;
        }
      })

      let subscribe = {
        channel: "subscribe_orderbook",
        currency: this.state.currency,
        subscribe_market : toSubscribeMarket
      };
  
      this.socket.send(JSON.stringify(subscribe));

    }

  };

  componentDidMount() {
    this.socket = new WebSocket(websocket.URL);
    this.socket.onopen = () => this.onSocketOpen();
    this.socket.onmessage = m => this.onSocketMessage(m.data);

    const loginCheck = sessionStorage.getItem("token")
      ? sessionStorage.getItem("token")
      : null;

    if (loginCheck) {
      // Get User Wallet Info.
      Api.GetBalance().then(
        data => {
          this.setState({
            WALLET: data.message
          });
        },
        err => {
          console.log(err.response);
        }
      );
    }
  }

  render() {
    console.log(this.state);
    const askOrderbookArea = this.state.ASK ? (
      <tbody className="orderbook-tbody">
        {this.state.ASK.map((item, index) => {
          if (index <= this.orderbookCount) {
            return (
              <tr>
                <td style={{ width: "200px", color: "#c8d6e5" }}>
                  {Util.paddingZero(item.volume, 7)}
                </td>
                <td style={{ width: "200px", color: "rgb(226, 19, 70)" }}>
                  {item.price}
                </td>
                <td style={{ width: "200px", color: "#8395a7" }}>
                  {item.market}
                </td>
              </tr>
            );
          }
        })}
      </tbody>
    ) : null;

    const bidOrderbookArea = this.state.BID ? (
      <tbody className="orderbook-tbody">
        {this.state.BID.map((item, index) => {
          if (index <= this.orderbookCount) {
            return (
              <tr>
                <td style={{ width: "200px", color: "#c8d6e5" }}>
                  {Util.paddingZero(item.volume, 7)}
                </td>
                <td style={{ width: "200px", color: "rgb(82, 176, 120)" }}>
                  {item.price}
                </td>
                <td style={{ width: "200px", color: "#8395a7" }}>
                  {item.market}
                </td>
              </tr>
            );
          }
        })}
      </tbody>
    ) : null;

    const arbInfoArea = this.state.ARB_INFO ? (
      <table className="arbitrage-table-info">
        <tr>
          <td style={{ color: "#F79F1F" }}>
            {this.state.ARB_INFO.precentage}%{" "}
          </td>
          <td>KRW</td>
          <td>Coin</td>
        </tr>
        <tr>
          <td>Req. Funds</td>
          <td style={{ color: "gold" }}>
            ₩ {Util.expressKRW(this.state.ARB_INFO.fiat.benefit)}
          </td>
          <td style={{ color: "gold" }}>
            ₩ {Util.expressKRW(this.state.ARB_INFO.coin.benefit)}{" "}
          </td>
        </tr>
        <tr>
          <td>Profit</td>
          <td style={{ color: "gold" }}>₩ {Util.expressKRW(this.state.ARB_INFO.fiat.profit)}</td>
          <td style={{ color: "gold" }}>
            {this.state.ARB_INFO.coin.profit} {this.state.currency}
          </td>
        </tr>
        <tr>
          <td />
          <td />
          <td />
        </tr>
      </table>
    ) : null;

    const orderSendArea = ordersendInfo => {
      if (!ordersendInfo) {
        return;
      } else {
        return (
          <Fragment>
            <Col>
              <div className="ordersend-container">
                <p>
                  <div style={{ fontSize: "20px" }}>
                    {ordersendInfo.buy_market}
                  </div>
                  <div className="ordersend-balance">KRW Balance : </div>{" "}
                  <div className="ordersend-values">
                    {" "}
                    ₩ {Util.expressKRW(ordersendInfo.krw_balance)}
                  </div>
                  <div className="ordersend-balance">Req Funds : </div>{" "}
                  <div className="ordersend-values">
                    {" "}
                    ₩ {Util.expressKRW(ordersendInfo.krw_funds)}
                  </div>
                </p>
              </div>

              <form className="ordersend-form">
                <span className="ordersendText">Price : </span>
                <input
                  name="Price"
                  type="text"
                  className="ordersend-input"
                  placeholder="Price"
                  value={ordersendInfo.buy_price}
                />
                <span className="ordersendText">Volume : </span>
                <input
                  name="Volume"
                  type="text"
                  className="ordersend-input"
                  placeholder="Volume"
                  value={ordersendInfo.buy_volume}
                />
                <Button
                  className="ordersend-buy-button"
                  onClick={this.onClickOrdersend}
                  id="BUY"
                >
                  BUY
                </Button>
              </form>
            </Col>
            <Col>
              <div className="ordersend-container">
                <p>
                  <div style={{ fontSize: "20px" }}>
                    {ordersendInfo.sell_market}
                  </div>
                  <div className="ordersend-balance">Coin Balance : </div>{" "}
                  <div className="ordersend-values">
                    {" "}
                    {ordersendInfo.coin_balance} {this.state.currency}{" "}
                  </div>
                  <div className="ordersend-balance">Expt Funds : </div>{" "}
                  <div className="ordersend-values">
                    {" "}
                    ₩ {Util.expressKRW(ordersendInfo.coin_funds)}{" "}
                  </div>
                </p>
              </div>

              <form className="ordersend-form">
                <span className="ordersendText">Price : </span>
                <input
                  name="Price"
                  type="text"
                  className="ordersend-input"
                  placeholder="Price"
                  value={ordersendInfo.sell_price}
                />
                <span className="ordersendText">Volume : </span>
                <input
                  name="Volume"
                  type="text"
                  className="ordersend-input"
                  placeholder="Volume"
                  value={ordersendInfo.sell_volume}
                />
                <Button
                  className="ordersend-sell-button"
                  onClick={this.onClickOrdersend}
                  id="SELL"
                >
                  SELL
                </Button>
              </form>
            </Col>
          </Fragment>
        );
      }
    };

    return (
      <Fragment>
        <Header />
        <MarketStatus />
        <br />
        <br />

        {/* coin select button */}
        <div className="orderbook-select">
          {this.orderbook_coin.map(coin => {
            if (this.state.currency === coin) {
              return (
                <Button
                  className="orderbook-button"
                  color="warning"
                  onClick={this.onClickSelectCoin}
                  id={coin}
                >
                  {coin}
                </Button>
              );
            } else {
              return (
                <Button
                  className="orderbook-button"
                  color="secondary"
                  onClick={this.onClickSelectCoin}
                  id={coin}
                >
                  {coin}
                </Button>
              );
            }
          })}
        </div>

        {/* arbitrage information */}
        {arbInfoArea}

        <Container>
          <Row>
            <Col>
              {/* coin orderbook */}
              <div className="orderbook-content">
                <table className="orderbook-table">{askOrderbookArea}</table>

                <h3>
                  {/* <span className="gapText">{this.state.currency}  </span>  */}
                  <span className="gapNumber">{this.state.GAP}</span>
                </h3>

                <table className="orderbook-table">{bidOrderbookArea}</table>
              </div>
            </Col>

            <Col>
              <Container style={{ padding: "0" }}>
                <Col>
                  <Button
                    className="ordersend-invest-rate"
                    color={
                      this.state.invest_rate === "1" ? "warning" : "secondary"
                    }
                    onClick={this.onClickInvestRate}
                    id={"1"}
                  >
                    100%
                  </Button>

                  <Button
                    className="ordersend-invest-rate"
                    color={
                      this.state.invest_rate === "0.5" ? "warning" : "secondary"
                    }
                    onClick={this.onClickInvestRate}
                    id={"0.5"}
                  >
                    50%
                  </Button>
                  <Button
                    className="ordersend-invest-rate"
                    color={
                      this.state.invest_rate === "0.1" ? "warning" : "secondary"
                    }
                    onClick={this.onClickInvestRate}
                    id={"0.1"}
                  >
                    10%
                  </Button>
                </Col>

                <Col>
                  <Button
                    className="ordersend-invest-rate"
                    color={
                      this.state.invest_curremcy === "KRW"
                        ? "warning"
                        : "secondary"
                    }
                    onClick={this.onClickInvestCurrency}
                    id={"KRW"}
                  >
                    KRW
                  </Button>
                  <Button
                    className="ordersend-invest-rate"
                    color={
                      this.state.invest_curremcy === "COIN"
                        ? "warning"
                        : "secondary"
                    }
                    onClick={this.onClickInvestCurrency}
                    id={"COIN"}
                  >
                    COIN
                  </Button>
                </Col>

                <Col>
                  <Container style={{ padding: "1px" }}>
                    <Row>{orderSendArea(this.state.ORDERSEND)}</Row>
                  </Container>
                </Col>
                <Col>
                  <form className="ordersend-form">
                    <input
                      type="submit"
                      value="BUY-SELL"
                      className="ordersend-arb-button"
                      onClick={this.onClickArbitrage}
                    />
                  </form>

                  <div className="depth-chart">
                    <AreaChart
                      width={520}
                      height={200}
                      data={this.state.chart_data ? this.state.chart_data : []}
                      margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                      ifOverflow="extendDomain"
                    >
                      <XAxis
                        dataKey="name"
                        type="number"
                        domain={["dataMin", "dataMax"]}
                        tickCount={100}
                      />
                      <YAxis hide={true} />
                      {/* <Tooltip active={true} cursor={{ stroke: 'red', strokeWidth: 2 }}/> */}

                      <Area
                        type="monotone"
                        stackId="ASK"
                        animationDuration={1000}
                        dataKey="ASK"
                        stroke="rgb(255, 93, 50)"
                        strokeWidth={1.6}
                        fill="rgb(68, 44, 41)"
                      />
                      <Area
                        type="monotone"
                        stackId="BID"
                        animationDuration={1000}
                        dataKey="BID"
                        stroke="rgb(121, 246, 91)"
                        strokeWidth={1.6}
                        fill="rgb(41, 74, 49)"
                      />
                      <Area
                        type="monotone"
                        stackId="GAP"
                        animationDuration={1000}
                        dataKey="GAP"
                        stroke="#6e92c7"
                        strokeWidth={1.6}
                        fill="#6e92c7"
                      />
                    </AreaChart>
                  </div>
                </Col>
              </Container>
            </Col>
          </Row>
        </Container>

      </Fragment>
    );
  }
}

export default Orderbook;
