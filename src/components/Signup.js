import React, { Component, Fragment } from 'react';
import { Redirect } from 'react-router-dom';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import Header from 'components/Header';
import './Signin.css';
import * as Api from 'lib/api';

class Singup extends Component {

  constructor(props) {
    super(props);
    this.state = {
      registered : 0
    };
  }
  
  onChange = (id) => {
    return (e) => {
      let scope = {}
      scope[id]=e.target.value
      this.setState(scope)
    }
  }

  onClickSignup = (e) => {
    
    e.preventDefault();
    let userinfo = {
      data : {
        "id"       : this.state.id,
        "name"     : this.state.name,
        "password" : this.state.password
      }
    }

    Api.SignUp(userinfo)
    .then((data) => {
      this.setState({registered : 1});
    }, (err) => {
      // Need to error control
      console.log(err.response)
    });

  }



  render() {

    if(this.state.registered) {
      return (
        <Redirect to='/' />
      )
    }

    return (
      <Fragment>
        <Header />
          <div className="login">

          <Form onSubmit={this.onClickSignup}>
              <h1>Sign Up</h1>
              <div class="inset">
                <p>
                  <label for="ID">ID</label>
                  <input type="text" name="ID" id="ID" onChange={this.onChange('id')}/>
                  <label for="name">NAME</label>
                  <input type="text" name="name" id="name" onChange={this.onChange('name')}/>
                  <label for="password">PASSWORD</label>
                  <input type="password" name="password" id="password" onChange={this.onChange('password')}/>
                </p>

                <p class="p-container">
                  <input type="submit" name="go" id="go" value="Sign Up" />
                </p>
              </div>
            </Form>

          </div> 
      </Fragment>

    )
  }
}

export default Singup;

