import React, { Component, Fragment } from 'react';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import Header from 'components/Header';
import './Login.css';

class Login extends Component {

  render() {
    return (
      <Fragment>
        <Header />

        <div className="login">

          <Form>
            <h1>Log In</h1>
            <div class="inset">
            
              <p>
                <label for="email">ID</label>
                <input type="text" name="email" id="email"/>
              </p>

              <p>
                <label for="password">PASSWORD</label>
                <input type="password" name="password" id="password"/>
              </p>

              <p class="p-container">
                <input type="submit" name="go" id="go" value="Log In" />
              </p>

            </div>
          </Form>

        </div> 
      </Fragment>

    )
  }
}

export default Login;

