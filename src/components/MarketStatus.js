import React, { Component, Fragment } from 'react';

import { Button, Form, FormGroup, Label, Input, FormText, Table } from 'reactstrap';

import './MarketStatus.css';


class MarketStatus extends Component {


  constructor(props) {
    super(props);
    this.state = {};
    
  }

  render() {

    const marketStatusArea = this.props.marketStatus? (
      this.props.marketStatus.map(marketInfo => {
        const status = marketInfo.status === 'true' ? 'marketcard orange' : 'marketcard red';
        return(
          <div className={status}>
            <div className="title">{marketInfo.market}</div>
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
