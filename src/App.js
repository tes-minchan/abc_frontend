import React, { Component, Fragment } from 'react';
import Header from './components/Header'
import './App.css';

class App extends Component {
  render() {
    return (

      <Fragment key ="App">
        <Header />
        <div className="Intro">
          <h4>HOME</h4>
        </div>
        
      </Fragment>
    );
  }
}

export default App;
