import React, { Component, Fragment } from 'react';
import { Table, Button } from 'reactstrap';

import Header from 'components/Header';
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

  onSocketMessage = (message) => {
    let parseJson = JSON.parse(message);

    if(parseJson.ASK.length !== 0 && parseJson.BID.length !== 0) {
      let askPrice = Number(parseJson.ASK[0].price);
      let bidPrice = Number(parseJson.BID[0].price);

      this.setState({
        ASK : parseJson.ASK.reverse(),
        BID : parseJson.BID, 
        GAP : (bidPrice - askPrice)
      });
  
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
    this.socket = new WebSocket('ws://localhost:3600');
    // this.socket = new WebSocket('ws://13.125.2.107:3600');
    this.socket.onopen = () => this.onSocketOpen()
    this.socket.onmessage = (m) => this.onSocketMessage(m.data);
  }


  render() {

    const askOrderbookArea = this.state.ASK? (
      <Fragment>
        <tbody className="orderbook-tbody">
          {
            this.state.ASK.map(item => {
              return (
                <tr>
                  <td style={{width:"200px"}}>{item.price}</td>
                  <td style={{width:"200px"}}>{item.volume}</td>
                  <td style={{width:"200px"}}>{item.market}</td>
                </tr>
              );
            })
          }
        </tbody>
      </Fragment>

    ) : null;

    const bidOrderbookArea = this.state.BID? (
      <Fragment>
        <tbody className="orderbook-tbody">
          {
            this.state.BID.map(item => {
              return (
                <tr>
                  <td style={{width:"200px"}}>{item.price}</td>
                  <td style={{width:"200px"}}>{item.volume}</td>
                  <td style={{width:"200px"}}>{item.market}</td>
                </tr>
              );
            })
          }
        </tbody>
      </Fragment>

    ) : null;

    return(
      <Fragment>
        <Header />
        <div className="orderbook-select">
          {
            this.orderbook_coin.map(coin => {
              return (
                <Button className="orderbook-button" color="info" onClick={this.onClickSelectCoin} id={coin} >{coin}</Button>
              )
            })
          }

        </div>
        <br />

        <div className="orderbook-content" >
          <Table className="orderbook-table">
              {askOrderbookArea}
          </Table>  
          
          <h3> {this.state.currency} {this.state.GAP}</h3>
          
          <Table className="orderbook-table">
              {bidOrderbookArea}
          </Table>  
        </div>
        
      </Fragment>
       

    )
  }

}


export default Orderbook;

