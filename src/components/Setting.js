import React, { Component, Fragment } from 'react';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import Switch from "react-switch";
import Header from 'components/Header';
import PropTypes from 'prop-types'

import './Arbitrage.css';
import './Setting.css';

import _ from 'underscore';

class Setting extends Component {

  constructor(props) {
    super(props);
    this.userSubscribeCoin = JSON.parse(sessionStorage.getItem('subsCoinList')) ? JSON.parse(sessionStorage.getItem('subsCoinList')) : null;
  }


  onClickSave = () => {
    const switch_status = this.RenderCoinSettingCard.state.switch_status;

    let new_state = this.userSubscribeCoin.map(coin => {
      return {
        name : coin.name,
        sub_market : coin.sub_market,
        sub_status : coin.sub_market.map(market => {
          return switch_status[`${coin.name}_${market}`]
        })
      }
    });

    sessionStorage.setItem('subsCoinList',JSON.stringify(new_state));

  }

  componentDidMount() {


  }

  render() {
   

    return (
      <Fragment>
        <Header />
        <div className="settingContainer settingCard-list">
          <Button color="info" onClick={this.onClickSave } >SAVE</Button>
        </div>
        <div className="settingContainer settingCard-list">
          <RenderCoinSettingCard userSubscribe={this.userSubscribeCoin} onRef={ (el) => this.RenderCoinSettingCard = el}/>
        </div>


      </Fragment>

    )
  }

}

class RenderCoinSettingCard extends Component {
  static propTypes = {
    onRef: PropTypes.func,
  }

  componentDidMount() {
    this.props.onRef(this)
  }
  componentWillUnmount() {
    this.props.onRef(undefined)
  }

  constructor(props) {
    super(props);
    let initStat = {};

    if(this.props.userSubscribe) {
      this.props.userSubscribe.map((coin, index) => {
        coin.sub_market.map((market, index) => {
          initStat[`${coin.name}_${market}`] = coin.sub_status[index];
        })
      });
  
      this.state = {
        switch_status : initStat
      }
    }
  

  }

  handleChange = (checked, event, id) => {

    let market    = id.split('-')[0];
    let coin_name = id.split('-')[1];

    this.state.switch_status[`${coin_name}_${market}`] = !this.state.switch_status[`${coin_name}_${market}`];

    this.setState({
      switch_status : this.state.switch_status
    });
   
  }

  render() {
    const coinSettingArea = this.props.userSubscribe.map((coin, index) => {
        return (
          <div className="settingCard darkgray" key = {index}>
            <div className="title">{coin.name}</div>
            <div className="line"></div>
            {
              coin.sub_market.map(market => {
                return (
                  <div className="toggleText"> {market} 
                    <Switch onChange={this.handleChange} checked = {this.state.switch_status[`${coin.name}_${market}`]} className="toggleButton" id={`${market}-${coin.name}-switch`} height={20} width={40} onColor="#1e90ff"/>
                  </div>
                )
              })
            }
          </div>
        )
    });

    return (
      <div>
        {coinSettingArea}
      </div>
    )
  }


}

export default Setting;

