import React, { Component, Fragment } from 'react';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import './MarketInfo.css';
import axios from 'axios';
import jsonwebtoken from 'jsonwebtoken';


class MarketInfo extends Component {


  constructor(props) {
    super(props);
    this.state = {};
  }

  
  componentDidMount() {
    const payload = {access_key: 'VxinLzDJd60CZdAjJzxmnpxQdIatFHmADSSLu9F2', nonce: (new Date).getTime()};
    const token = jsonwebtoken.sign(payload, 'mn7pxWXr3KMoJkHXqHxEsarnvSymMUke8y2FQOVu');

    var config = {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Authorization':  `Bearer ${token}`,
      }
    };

    axios.get('https://api.upbit.com/v1/accounts', config)
    .then( response => { console.log(response)})
    .catch( response => { console.log(response); } );     

  }


  render() {
    return (
      <Fragment>
        <div className="market_container">
          TEST
        </div>
      </Fragment>

    )
  }

}

export default MarketInfo;
