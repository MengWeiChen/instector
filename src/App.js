import React, { Component } from 'react';
import './App.css';
import { fullscreenScreenshot } from './screenshot'
import { fabric } from 'fabric';
import { Slider,Switch, Icon } from 'antd';
import { Button } from 'antd';
import { fromEvent } from 'rxjs/observable/fromEvent'
import { filter, tap, concatMapTo, take, takeUntil, map } from 'rxjs/operators'

const ButtonGroup = Button.Group;
const electron = window.require('electron')


const calculateLineLong = (x1,x2,y1,y2) => {
  const width = x1 - x2;
  const height = y1 - y2;
  const long = Math.sqrt(width * width + height * height)
  return Math.floor(long * 10) / 10;
}
class App extends Component {
  borderSize = 1

  state={
    isShooting: false,
    window: {
      height: 0,
      width: 0
    },
    opacity: 30,
    zoom: 0,
    mode: 'capture'
  }
  componentDidMount(){
    const canvas = new fabric.Canvas('c', { selection: false });
    this.canvas = canvas;
    this.resizeCanvas();

    const keyDown$ = fromEvent(window, 'keydown');
    const keyUp$ = fromEvent(window, 'keyup');
    this.shiftKeyObserver = keyDown$
      .pipe(
        filter((e)=> e.keyCode === 16),
        tap(()=>{
          console.log('a')
          this.shift = true;
        }),
        concatMapTo(keyUp$.pipe(
          filter((e)=> e.keyCode === 16), 
          tap(()=>{
            this.shift = false;
          }), 
          take(1)))
      ).subscribe(()=>{});
      
    


    let line, isDown, text, sl1, sl2;
    canvas.on('mouse:down', (o)=>{
      //if(!this.img) return;
      if(line){
        this.canvas.remove(line);
        this.canvas.remove(text);
        this.canvas.remove(sl1);
        this.canvas.remove(sl2);
      }
      isDown = true;
      var pointer = canvas.getPointer(o.e);
      var points = [ pointer.x, pointer.y, pointer.x, pointer.y ];
      line = new fabric.Line(points, {
        strokeWidth: 1,
        fill: 'red',
        stroke: 'red',
        originX: 'center',
        originY: 'center'
      });

      sl1 = new fabric.Line([points[0], points[1]-5, points[2], points[3]+5], {
        strokeWidth: 1,
        fill: 'red',
        stroke: 'red',
        originX: 'center',
        originY: 'center'
      });

      sl2 = new fabric.Line([points[0], points[1], points[2]-5, points[3]+5], {
        strokeWidth: 1,
        fill: 'red',
        stroke: 'red',
        originX: 'center',
        originY: 'center'
      });

      text = new fabric.Text('1', {
        left: pointer.x,
        top: pointer.y,
        fontSize: 12,
        fontFamily: 'sans-serif',
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
        fontWeight: 'bold'
      })
      canvas.add(line);
      canvas.add(text);
      canvas.add(sl1);
      canvas.add(sl2);
    });
    canvas.on('mouse:move', (o)=>{
      if (!isDown) return;
      
      var pointer = canvas.getPointer(o.e);
      if (this.shift){
        line.set({ x2: pointer.x, y2: pointer.y });
      }else{
        const { x1, y1 } = line;
        const dx = Math.abs(x1 - pointer.x);
        const dy = Math.abs(y1 - pointer.y);
        if(dx > dy){
          // 橫向
          sl1.set({ x1: line.x1, x2:line.x1, y1: line.y1 + 5, y2: line.y1 -5 })
          sl2.set({ x1: pointer.x, x2:pointer.x, y1: line.y1 + 5, y2: line.y1 -5 });
          line.set({ x2: pointer.x, y2: line.y1 });
        }else{
          line.set({ x2: line.x1, y2: pointer.y });
          sl1.set({ x1: line.x1 +5 , x2:line.x1 -5, y1: line.y1, y2: line.y1 });
          sl2.set({ x1: line.x1 +5 , x2:line.x1 -5, y1: pointer.y, y2: pointer.y });
        }
      }
      const long = calculateLineLong(line.x1, line.x2, line.y1, line.y2);

      text.set('text', `${long} px`);

      canvas.renderAll();
    });
    
    canvas.on('mouse:up', (o)=>{
      isDown = false;
      const long = calculateLineLong(line.x1, line.x2, line.y1, line.y2);
      if (long < 1) {
        canvas.remove(line);
        canvas.remove(text);
        canvas.remove(sl1);
        canvas.remove(sl2);
        line = false;
        text = false;
        sl1 = false;
        sl2 = false;
      }
    });



    window.addEventListener('resize', (e)=>{
      canvas.setWidth(e.target.innerWidth - this.borderSize * 2)
      canvas.setHeight(e.target.innerHeight - this.borderSize * 2)
      canvas.renderAll();
    }, true);
    
    window.addEventListener('keydown', (e)=>{
      var distanceX = window.screenLeft;
      var distanceY = window.screenTop;
      if(e.keyCode === 37){
        // ArrowLeft
        electron.remote.getCurrentWindow().setPosition(distanceX - 1, distanceY)
        e.preventDefault()
      }
      if(e.keyCode === 38){
        // ArrowUp
        electron.remote.getCurrentWindow().setPosition(distanceX, distanceY - 1)
        e.preventDefault()
      }
      if(e.keyCode === 39){
        // ArrowRight
        electron.remote.getCurrentWindow().setPosition(distanceX + 1, distanceY)
        e.preventDefault()
      }
      if(e.keyCode === 40){
        // ArrowDown
        electron.remote.getCurrentWindow().setPosition(distanceX, distanceY + 1)
        e.preventDefault()
      }
    })
    

  }
  componentWillUnmount(){
    this.shiftKeyObserver.unsubscribe();
  }
  resizeCanvas = () => {
    this.canvas.setWidth(window.innerWidth - this.borderSize * 2)
    this.canvas.setHeight(window.innerHeight  - this.borderSize * 2)
    this.canvas.renderAll();
  }
  shoot = () => {
    this.canvas.clear()
    this.setState({isShooting: true})
    fullscreenScreenshot((base64data)=>{
      


      var distanceX = window.screenLeft > window.screen.width ?  window.screenLeft - window.screen.availLeft : window.screenLeft  ;
      var distanceY = window.screenTop;

      const cursorScreenPoint = electron.screen.getCursorScreenPoint();
      const currentDisplay = electron.screen.getDisplayNearestPoint(cursorScreenPoint)

      var screenDimensions = currentDisplay.size;
      // var screenHeight = screenDimensions.height;
      var screenWidth = screenDimensions.width;
      
      fabric.Image.fromURL(base64data, (img) => {
        this.img = img;
        this.img.resizeZoom = screenWidth / img.width;
        img.scale(this.img.resizeZoom).set({
          left: -(distanceX +1 ),
          top: -(distanceY+23 - 22),
          opacity: this.state.opacity / 100,
          
        });
        img.evented=false;
        this.canvas.add(img);
        this.resizeCanvas()

        this.setState({isShooting: false})
        
      });
    },"image/jpeg");
  }
  clear = () => {
    this.canvas.clear();
    this.img = false;
    this.setState({});
  }
  setOpacity = (value) => {
    this.img.set({
      opacity: value / 100,
    });
    this.canvas.renderAll();
    this.setState({opacity: value})
  }
  setZoom = (value) => {
    console.log(value);
    const zoom = value / 50 * 0.5 + 1 ;
    
    this.img.scale(this.img.resizeZoom * zoom);
    this.canvas.renderAll();
  }
  setSlwaysOnTop = (value) => {
    electron.remote.getCurrentWindow().setAlwaysOnTop(value)
  }
  changeMode = () => {
    const mode = this.state.mode == 'capture' ? 'edit' : 'capture';
    this.setState({mode});
    if(mode == 'edit'){
      this.canvas.setActiveObject(this.img);
      this.img.evented=true;
    }else{
      this.img.evented=false;
    }
  }
  render() {
    return (
      <div className="App" style= {{ 
          border:`${this.borderSize}px solid`, 
          borderRadius: '0px 0px 8px 8px',
          display: this.state.isShooting ? 'none' : 'block',
        }}
      >
        <div style={{ position: 'absolute', zIndex: 9, left:0, right: 0, }}>
          <div id="titleBar" style={{ display: 'flex', justifyContent: 'flex-end',padding: 5, backgroundColor: 'rgba(0, 0, 0, 0.9)', height: 32 }}>  
            <Switch onChange={this.setSlwaysOnTop} checkedChildren="on" unCheckedChildren="off"  />
          </div>
          {
            this.state.mode == 'capture' ?
            <div style={{display: 'flex', padding: 10, alignItems: 'center', justifyContent: 'flex-end',  backgroundColor: 'rgba(0, 0, 0, 0.4)'  }}>  
              {this.img ? <Slider style={{flexGrow: 1}} onChange={this.setOpacity} value={this.state.opacity} />: null}
              {this.img ? <Button onClick={this.changeMode} style={{margin: '0px 12px'}} icon="tool" >
                edit
                </Button>: null}
              {this.img ? 
                <ButtonGroup>
                  
                  <Button onClick={this.clear} type="primary"> clear </Button>
                  <Button onClick={this.shoot} type="primary"> screenshot </Button>
                </ButtonGroup>
                :
                <Button onClick={this.shoot} type="primary">screenshot</Button>}
            </div> 
            :
            <div style={{display: 'flex', padding: 10, alignItems: 'center', justifyContent: 'flex-end',  backgroundColor: 'rgba(0, 0, 0, 0.4)'  }}>  
              <Slider style={{flexGrow: 1}} onChange={this.setOpacity} value={this.state.opacity} />
              <Slider style={{flexGrow: 1}} onChange={this.setZoom}  defaultValue={0} max={50} min={-50} step={0.1} />
              <Button onClick={this.changeMode} style={{margin: '0px 5px'}} icon="tool" >
                Done
              </Button>
            </div> 

          }
          
        </div>
        <canvas id="c">
        </canvas>
        
      </div>
    );
  }
}

export default App;
