import React, { Component, Fragment } from 'react';
import Header from 'components/Header';


class ETHKRW extends Component {

  onSocketOpen = () => {
    
    let subscribe = {
      channel  : "Orderbook",
      currency : "ETH",
    }

    this.socket.send(JSON.stringify(subscribe));
  }
  _getMessage = (message) => {
    console.log(message);
  }
  componentDidMount() {
    this.socket = new WebSocket('ws://localhost:3600');
    console.log(this.socket);

    // this.socket = new WebSocket('ws://13.125.2.107:3600');
    this.socket.onopen = () => this.onSocketOpen()
    this.socket.onmessage = (m) => this._getMessage(m.data)
    // this.socket.onclose = () => this.onSocketClose()
  }

  render() {
    return (
      <Fragment>
        <Header />
        <div>
          ETH/KRW TEST
        </div>
      </Fragment>

    )
  }
}

export default ETHKRW;

