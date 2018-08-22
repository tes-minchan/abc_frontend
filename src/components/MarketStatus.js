import React, { Component, Fragment } from 'react';
import { Button, Form, FormGroup, Label, Input, FormText, Table } from 'reactstrap';
import './MarketStatus.css';


class MarketStatus extends Component {


  constructor(props) {
    super(props);
    this.state = {};
    
    this.interval = setInterval(() => {
      this.socket.send(JSON.stringify({channel : "market_status"}));
    },1000);
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
  }

  componentDidMount() {
    //this.socket = new WebSocket('ws://localhost:3600');
    this.socket = new WebSocket('ws://13.125.2.107:3600');
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
          <div class="demo-up">
            <span class="server-status" type="up"></span>
          </div>
        ) 
        : (
          <div class="demo-down">
            <span class="server-status" type="down"></span>
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
