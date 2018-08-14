import React, { Component, Fragment } from 'react';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import Switch from "react-switch";
import Header from 'components/Header';
import './Arbitrage.css';
import './Setting.css';

import _ from 'underscore';

class Setting extends Component {

  constructor(props) {
    super(props);

    this.coinList   = ['BTC', 'ETH', 'EOS', 'XRP', 'ZRX'];
    this.marketList = ['UPBIT', 'BITHUMB', 'COINONE', 'GOPAX', 'CASHIEREST', 'KORBIT'];

    const toSetState = {};
    const getSubscribeCoin = JSON.parse(sessionStorage.getItem('arbitrabe_subscribe'));

    this.coinList.map(coin => {
      this.marketList.map(market => {
        if(getSubscribeCoin) {
          toSetState[`ask-${coin}-${market}-switch`] = false;
          toSetState[`bid-${coin}-${market}-switch`] = false;

          getSubscribeCoin[coin].askmarket.map(item => {
            if(item === market) {
              toSetState[`ask-${coin}-${market}-switch`] = true;
              return;
            }
          });

          getSubscribeCoin[coin].bidmarket.map(item => {
            if(item === market) {
              toSetState[`bid-${coin}-${market}-switch`] = true;
              return;
            }
          });


        }
        else {
          toSetState[`ask-${coin}-${market}-switch`] = true;
          toSetState[`bid-${coin}-${market}-switch`] = true;
        }
        
      })
    });

    this.state = toSetState;
  }

  setArbitrageSub = () => {

    let toSetStorage = {};

    this.coinList.map(coin => {
      let coinObj = {
        askmarket : [],
        bidmarket : []
      };

      this.marketList.map(market => {
        if(this.state[`ask-${coin}-${market}-switch`]) {
          coinObj.askmarket.push(market);
        }

        if(this.state[`bid-${coin}-${market}-switch`]) {
          coinObj.bidmarket.push(market);
        }

      });
      toSetStorage[coin] = coinObj;
    });
    sessionStorage.setItem('arbitrabe_subscribe', JSON.stringify(toSetStorage));

  }

  handleChange = (checked, event, id) => {
    let toSetToggle = {};
    toSetToggle[id] = checked;

    this.setState(toSetToggle);


  }

  componentDidMount() {


  }

  render() {

    const orderbookArea = this.coinList? (

      this.coinList.map((coin,index) => {
        return (
          <div className="card darkgray" key = {index}>
            <div className="title">{coin}</div>
            <div className="line"></div>
            <div className="toggleTtitle">ASK</div>
            {
              this.marketList.map(market => {
                return (
                  <div className="toggleText"> {market} 
                    <Switch onChange={this.handleChange} checked={this.state[`ask-${coin}-${market}-switch`]} id={`ask-${coin}-${market}-switch`} className="toggleButton" height={20} width={40} onColor="#1e90ff"/>
                  </div>
                )
              })
            }
            <div className="line"></div>
            <div className="toggleTtitle">BID</div>

            {
              this.marketList.map(market => {
                return (
                  <div className="toggleText"> {market} 
                    <Switch onChange={this.handleChange} checked={this.state[`bid-${coin}-${market}-switch`]} id={`bid-${coin}-${market}-switch`} className="toggleButton" height={20} width={40} onColor="#e84118"/>
                  </div>
                )
              })
            }
          </div>
        )
      })
    ) : null;

    return (
      <Fragment>
        <Header />
        
        <div className="container card-list">
          {orderbookArea}

        </div>
        <div className="container">

        <Button color="info" onClick={this.setArbitrageSub } >SAVE</Button>
        </div>
      </Fragment>

    )
  }

}


export default Setting;


/*
<div className="container card-list">
          <div className="card darkgray">
            <div className="title">BTC</div>
              <div className="line"></div>
              <div>
                <div className="toggleTtitle">ASK</div>



                <div className="toggleText"> COINONE
                  <Switch onChange={this.handleChange} checked={this.state["ask-coinone-switch"]} id="ask-coinone-switch" className="toggleButton" height={20} width={40}/>
                </div>

                <div className="line"></div>

                <div className="toggleTtitle">BID</div>
                <div className="toggleText"> UPBIT
                  <Switch onChange={this.handleChange} checked={this.state["bid-upbit-switch"]} id="bid-upbit-switch" className="toggleButton" height={20} width={40}/>
                </div>
                <div className="toggleText"> COINONE
                  <Switch onChange={this.handleChange} checked={this.state["bid-coinone-switch"]} id="bid-coinone-switch" className="toggleButton" height={20} width={40}/>
                </div>
              </div>
          </div>
        </div>
*/
