import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { fullscreenScreenshot } from './screenshot'
const electron = window.require('electron')
import { fabric } from 'fabric';
import { Slider, Switch } from 'antd';
import { Button } from 'antd';
import { setTimeout } from 'timers';


class App extends Component {
  borderSize = 1

  state={
    isShooting: false,
    window: {
      height: 0,
      width: 0
    }
  }
  componentDidMount(){
    const canvas = new fabric.Canvas('c');
    this.canvas = canvas;
    this.resizeCanvas();

    window.addEventListener('resize', (e)=>{
      canvas.setWidth(e.target.innerWidth - this.borderSize * 2)
      canvas.setHeight(e.target.innerHeight - this.borderSize * 2)
      canvas.renderAll();
    }, true);
    
    window.addEventListener('keydown', (e)=>{
      var distanceX = window.screenLeft;
      var distanceY = window.screenTop;
      if(e.keyCode == 37){
        // ArrowLeft
        electron.remote.getCurrentWindow().setPosition(distanceX - 1, distanceY)
        e.preventDefault()
      }
      if(e.keyCode == 38){
        // ArrowUp
        electron.remote.getCurrentWindow().setPosition(distanceX, distanceY - 1)
        e.preventDefault()
      }
      if(e.keyCode == 39){
        // ArrowRight
        electron.remote.getCurrentWindow().setPosition(distanceX + 1, distanceY)
        e.preventDefault()
      }
      if(e.keyCode == 40){
        // ArrowDown
        electron.remote.getCurrentWindow().setPosition(distanceX, distanceY + 1)
        e.preventDefault()
      }
    })
    

  }
  resizeCanvas = () => {
    this.canvas.setWidth(window.innerWidth - this.borderSize * 2)
    this.canvas.setHeight(window.innerHeight  - this.borderSize * 2)
    this.canvas.renderAll();
  }
  shoot = () => {
    if(this.img){
      this.canvas.getObjects().forEach((o)=>{
        this.canvas.remove(o)
      })
    }
    this.setState({isShooting: true})
    fullscreenScreenshot((base64data)=>{
      

      var height = window.innerHeight;
      var width = window.innerWidth;
      var distanceX = window.screenLeft;
      var distanceY = window.screenTop;
      var screenDimensions = electron.screen.getPrimaryDisplay().size;
      var screenHeight = screenDimensions.height;
      var screenWidth = screenDimensions.width;
      

      fabric.Image.fromURL(base64data, (img) => {
        this.img = img;
        img.scale(screenWidth / img.width).set({
          left: -(distanceX +1 ),
          top: -(distanceY+23),
          opacity: 0.5,
          
        });
        img.evented=false;
        this.canvas.add(img);
        this.resizeCanvas()

        this.setState({isShooting: false})
        
      });
    },"image/jpeg");
  }
  setOpacity = (value) =>{
    this.img.set({
      opacity: value / 100,
    });
    this.canvas.renderAll();
  }
  render() {
    const height = window.innerHeight;
    const width = window.innerWidth;
    return (
      <div className="App" style= {{ 
          border:`${this.borderSize}px solid`, 
          borderRadius: '0px 0px 8px 8px',
          display: this.state.isShooting ? 'none' : 'block',

        }}
      >
        <div style={{ position: 'absolute', zIndex: 9, left:0, right: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
          <div style={{display: 'flex', margin: 10, alignItems: 'center', justifyContent: 'flex-end' }}>  
            
            {this.img ? <Slider style={{flexGrow: 1}} onChange={this.setOpacity} defaultValue={30} />: null}
            <Button onClick={this.shoot} type="primary">screenshot</Button>
          </div>

        </div>
        <canvas id="c">
        </canvas>
        
      </div>
    );
  }
}

export default App;
