import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { fullscreenScreenshot } from './screenshot'

class App extends Component {
  componentDidMount(){
    document.documentElement.style.border='1px solid red';
    document.getElementById("trigger").addEventListener("click", function(){
      document.documentElement.style.border='initial';
      fullscreenScreenshot(function(base64data){
          document.documentElement.style.border='1px solid red';
          document.getElementById("image-preview").setAttribute("src", base64data);
          
      },"image/jpeg");
    },false);
  }
  render() {
    return (
      <div className="App">
        <img id="image-preview"/>
        <input id="trigger" value="Fullscreen screenshot" type="button"/>
      </div>
    );
  }
}

export default App;
