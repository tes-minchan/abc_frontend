import React, { Component, Fragment } from 'react';
import { Redirect } from 'react-router-dom';

import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import Header from 'components/Header';
import './Signin.css';
import * as Api from 'lib/api';


class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      modalIsOpen: false

    };
  }

  openModal= () => {
    this.setState({modalIsOpen: true});
  }
 
  afterOpenModal= () => {
    // references are now sync'd and can be accessed.
    this.subtitle.style.color = '#f00';
  }
 
  closeModal= () => {
    this.setState({modalIsOpen: false});
  }


  onChange = (id) => {
    return (e) => {
      let scope = {}
      scope[id]=e.target.value
      this.setState(scope)
    }
  }


  onClickSignin = (e) => {
    
    e.preventDefault();
    let userinfo = {
      data : {
        "id"       : this.state.id,
        "password" : this.state.password
      }
    }

    Api.SignIn(userinfo)
    .then((data) => {
      sessionStorage.setItem('token', data.data);
      this.setState({registered : 1});
    }, (err) => {
      // Need to error control
      console.log(err.response)
    });

  }

  render() {
    if(sessionStorage.getItem('token')) {
      return (
        <Redirect to='/' />
      )
    }

    return (
      <Fragment>
        <Header />

        <div className="login">

          <Form onSubmit={this.onClickSignin}>
            <h1>Sign In</h1>
            <div class="inset">
            
              <p>
                <label for="id">ID</label>
                <input type="text" name="id" id="id" onChange={this.onChange('id')}/>
              </p>

              <p>
                <label for="password">PASSWORD</label>
                <input type="password" name="password" id="password" onChange={this.onChange('password')}/>
              </p>

              <div className="signbutton">
                <Button color="primary">Sign In</Button>
              </div>

            </div>
          </Form>

        </div> 
      </Fragment>

    )
  }
}

export default Login;

