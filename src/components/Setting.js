import React, { Component, Fragment } from "react";
import { Button, Form, FormGroup, Label, Input, FormText } from "reactstrap";
import Switch from "react-switch";
import Header from "components/Header";
import PropTypes from "prop-types";

import "./Arbitrage.css";
import "./Setting.css";

import _ from "underscore";

class Setting extends Component {
  constructor(props) {
    super(props);
    this.userSubscribeCoin = JSON.parse(sessionStorage.getItem("subsCoinList"))
      ? JSON.parse(sessionStorage.getItem("subsCoinList"))
      : null;
  }

  onClickSave = () => {
    const switch_status = this.RenderCoinSettingCard.state.switch_status;

    let new_state = this.userSubscribeCoin.map(coin => {
      let toSetCoinSubcribe = {
        name: coin.name,
        ASK: {
          support_market: coin.ASK.support_market,
          sub_status: []
        },
        BID: {
          support_market: coin.BID.support_market,
          sub_status: []
        }
      };

      coin.ASK.support_market.forEach(market => {
        toSetCoinSubcribe.ASK.sub_status.push(
          switch_status[`ASK_${coin.name}_${market}`]
        );
      });

      coin.BID.support_market.forEach(market => {
        toSetCoinSubcribe.BID.sub_status.push(
          switch_status[`BID_${coin.name}_${market}`]
        );
      });

      return toSetCoinSubcribe;
    });

    sessionStorage.setItem("subsCoinList", JSON.stringify(new_state));
  };

  componentDidMount() {}

  render() {
    return (
      <Fragment>
        <Header />
        <div className="settingContainer settingCard-list">
          <Button color="info" onClick={this.onClickSave}>
            SAVE
          </Button>
        </div>
        <div className="settingContainer settingCard-list">
          <RenderCoinSettingCard
            userSubscribe={this.userSubscribeCoin}
            onRef={el => (this.RenderCoinSettingCard = el)}
          />
        </div>
      </Fragment>
    );
  }
}

class RenderCoinSettingCard extends Component {
  static propTypes = {
    onRef: PropTypes.func
  };

  componentDidMount() {
    this.props.onRef(this);
  }
  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  constructor(props) {
    super(props);
    let initStat = {};

    this.props.userSubscribe.map(coin => {
      coin.ASK.support_market.forEach((market, index) => {
        initStat[`ASK_${coin.name}_${market}`] = coin.ASK.sub_status[index];
      });

      coin.BID.support_market.forEach((market, index) => {
        initStat[`BID_${coin.name}_${market}`] = coin.BID.sub_status[index];
      });
    });

    this.state = {
      switch_status: initStat
    };
  }

  handleChange = (checked, event, id) => {
    let type = id.split("-")[0];
    let market = id.split("-")[1];
    let coin_name = id.split("-")[2];

    this.state.switch_status[`${type}_${coin_name}_${market}`] = !this.state
      .switch_status[`${type}_${coin_name}_${market}`];

    this.setState({
      switch_status: this.state.switch_status
    });
  };

  render() {
    const coinSettingArea = this.props.userSubscribe.map((coin, index) => {
      return (
        <div className="settingCard darkgray" key={index}>
          <div className="settingCard_title">{coin.name}</div>
          <div className="line" />

          <div className="settingCard_coin">ASK</div>

          {coin.ASK.support_market.map(market => {
            return (
              <div className="toggleText">
                {" "}
                {market}
                <Switch
                  onChange={this.handleChange}
                  checked={
                    this.state.switch_status[`ASK_${coin.name}_${market}`]
                  }
                  className="toggleButton"
                  id={`ASK-${market}-${coin.name}-switch`}
                  height={20}
                  width={40}
                  onColor="#1e90ff"
                />
              </div>
            );
          })}
          <div className="line" />
          <div className="settingCard_coin">BID</div>
          {coin.BID.support_market.map(market => {
            return (
              <div className="toggleText">
                {" "}
                {market}
                <Switch
                  onChange={this.handleChange}
                  checked={
                    this.state.switch_status[`BID_${coin.name}_${market}`]
                  }
                  className="toggleButton"
                  id={`BID-${market}-${coin.name}-switch`}
                  height={20}
                  width={40}
                  onColor="#e55039"
                />
              </div>
            );
          })}
          <div className="line" />
        </div>
      );
    });

    return <div>{coinSettingArea}</div>;
  }
}

export default Setting;
