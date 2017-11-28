import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { fullscreenScreenshot } from './screenshot'
const electron = window.require('electron')
import { fabric } from 'fabric';
import { Slider, Switch } from 'antd';
import { Button } from 'antd';


class App extends Component {
  componentDidMount(){
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
    const canvas = new fabric.Canvas('c');

    document.documentElement.style.border='1px solid red';
    document.getElementById("trigger").addEventListener("click", function(){
      document.documentElement.style.border='initial';
      fullscreenScreenshot(function(base64data){
        console.log(fabric);
        var height = window.innerHeight;
        var width = window.innerWidth;
        var distanceX = window.screenLeft;
        var distanceY = window.screenTop;
        var screenDimensions = electron.screen.getPrimaryDisplay().size;
        var screenHeight = screenDimensions.height;
        var screenWidth = screenDimensions.width;
        

        fabric.Image.fromURL(base64data, function(img) {

          
          img.scale(screenWidth / img.width).set({
            left: -(distanceX),
            top: -(distanceY+22),
            opacity: 0.5,
            
          });
          img.evented=false;
          canvas.add(img).setActiveObject(img);
        });
        // console.log(base64data);
        // var encondedImageBuffer = new Buffer(base64data.replace(/^data:image\/(png|gif|jpeg);base64,/,''), 'base64');
        // console.log(encondedImageBuffer);
        // var height = window.innerHeight;
        // var width = window.innerWidth;
        // var distanceX = window.screenLeft;
        // var distanceY = window.screenTop;
        // var screenDimensions = electron.screen.getPrimaryDisplay().size;
        // var screenHeight = screenDimensions.height;
        // var screenWidth = screenDimensions.width;
        // console.log(Jimp);
        // Jimp.read(encondedImageBuffer, function (err, image) {
        //     if (err) throw err;

        //     // Show the original width and height of the image in the console
        //     console.log(image.bitmap.width, image.bitmap.height);

        //     // Resize the image to the size of the screen
        //     image.resize(screenWidth, screenHeight)
        //     // Crop image according to the coordinates
        //     // add some margin pixels for this example
        //     image.crop(distanceX+1, distanceY+22+2, width-3, height-6)
        //     // Get data in base64 and show in img tag
        //     .getBase64('image/jpeg', function(err,base64data){
              
        //         document.getElementById("image-preview").setAttribute("src", base64data);
        //         //console.log(data);
        //     });
        // });
          
      },"image/jpeg");
    },false);
  }
  render() {
    const height = window.innerHeight;
    const width = window.innerWidth;
    return (
      <div className="App">
        <div style={{ position: 'ansolute', height: 150, backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
          <div>  
          <Button type="primary">Primary</Button>
            <Slider defaultValue={30} />
          </div>
        </div>
        <canvas width={width} height={height} id="c" style={{ }}>
        </canvas>
        <img id="image-preview"/>
        <input id="trigger" value="Fullscreen screenshot" type="button"/>
      
      </div>
    );
  }
}

export default App;
