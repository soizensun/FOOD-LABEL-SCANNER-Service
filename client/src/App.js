
import React, { Component } from 'react';
import logo from './logo.svg';
import './cssFile/App.css';
import UploadPic from './components/uploadPic';
import ChoiceBox from './components/choiceBox';

class App extends Component {
  componentDidMount(){
    fetch('./render')
  }
  render() {
    return (
      <div className="App">

        <header className="App-header">
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
          <h2 className="App-title"> FOOD LABEL SCANNER </h2>
        </header>

        <div className="uploadPiczone">
          <br/><div className="labelUploadPicZone"> 1. Choose your target picture. </div><br/>
          <UploadPic/><br/>
        </div>

        <div className="selectZone">
          <br/><div className="labelSelectZone"> 2. Select your target picture's market. </div><br/>
          <ChoiceBox/><br/>
        </div>

      </div>
    );
  }
}

export default App;