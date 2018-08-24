import React, { Component, Fragment } from 'react';
import './MarketStatus.css';
import websocket from 'config';


class MarketStatus extends Component {


  constructor(props) {
    super(props);
    this.state = {};
    
  }

  
  onSocketMessage = (message) => {
    let parseJson = JSON.parse(message);

    if(parseJson.type === 'market_status') {
      this.setState({
        marketStatus : parseJson.status
      })
    }
  }

  onSocketOpen = () => {
    let subscribe = {
      channel : 'market_status'
    }

    this.socket.send(JSON.stringify(subscribe));

    this.interval = setInterval(() => {
      this.socket.send(JSON.stringify({channel : "market_status"}));
    },1000);
    
  }

  componentDidMount() {
    this.socket = new WebSocket(websocket.URL);
    this.socket.onopen = () => this.onSocketOpen()
    this.socket.onmessage = (m) => this.onSocketMessage(m.data);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {

    const marketStatusArea = this.state.marketStatus? (
      this.state.marketStatus.map(marketInfo => {
        const statusIcon = marketInfo.status === 'true' ? (
          <div className="demo-up">
            <span className="server-status" type="up"></span>
          </div>
        ) 
        : (
          <div className="demo-down">
            <span className="server-status" type="down"></span>
          </div>
        );

        return(
          <div className="marketcard darkgray">
              <span>{marketInfo.market}</span>
              {statusIcon}
          </div>
        )
      })
    ) : null;

    return (
      <Fragment>
        <div className="marketcontainer card-list">
          {marketStatusArea}
        </div>

      </Fragment>

    )
  }

}



export default MarketStatus;
