import React, { Component, Fragment } from 'react';
import { Redirect } from 'react-router-dom';
import Modal from 'react-modal';

import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import Header from 'components/Header';
import './Signin.css';
import * as Api from 'lib/api';

const customStyles = {
  content : {
    top                   : '30%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)',
    width                 : '500px',
    height                : '500px'
  }
};

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root');

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

        {/* modal test */}
        <div>
          <button onClick={this.openModal}>Open Modal</button>
          <Modal
            isOpen={this.state.modalIsOpen}
            onAfterOpen={this.afterOpenModal}
            onRequestClose={this.closeModal}
            style={customStyles}
            contentLabel="Example Modal"
          >

            <h2 ref={subtitle => this.subtitle = subtitle}>Hello</h2>
            <button onClick={this.closeModal}>close</button>
            <div>I am a modal</div>
            <form>
              <input />
              <button>tab navigation</button>
              <button>stays</button>
              <button>inside</button>
              <button>the modal</button>
            </form>
          </Modal>
        </div>
      </Fragment>

    )
  }
}

export default Login;

