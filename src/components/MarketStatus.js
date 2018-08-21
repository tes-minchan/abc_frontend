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
