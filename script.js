//jshint esversion:6
//class to handle paddle properties
class Paddle{
  constructor(game){
    this.width=100;//width of paddle
    this.height=20;//height of paddle
    this.gameWidth=game.gameWidth;
    this.gameHeight=game.gameHeight;
    this.position={
      x:game.gameWidth/2-this.width/2,//x axis position of paddle
      y:game.gameHeight-this.height-10//y axis position of paddle
    };
    this.maxSpeed=7;//paddle is moving 10px per frame
    this.speed=0;//current speed of paddle
  }
  draw(ctx){
    ctx.fillStyle="#7882A4";
    ctx.fillRect(this.position.x,this.position.y,this.width,this.height);//drawing the paddle on canvas
  }

  moveLeft(){
    this.speed=-this.maxSpeed;// paddle moves towards the left ie -maxSpeed in the x axis
  }

  moveRight(){
    this.speed=this.maxSpeed;
  }

  stop(){
    this.speed=0;
  }

  update(deltaTime){//deltaTime stands for how much time has it been since last animation
    if(!deltaTime)return;
    //this.position.x+=5/deltaTime;//we want to move the paddle by 5px every second..not dividing by 5 will move it faster
    this.position.x+=this.speed;
    if(this.position.x<0)this.position.x=0;// to prevent paddle from moving outside canvas
    if(this.position.x+this.width>this.gameWidth)this.position.x=this.gameWidth-this.width;

  }
}














//class to handle input functions
class InputHandler{
  constructor(paddle,game){
    document.addEventListener("keydown",(event)=>{
      switch(event.keyCode){
        case 37:
        console.log('move left');// ascii code for left arrow is 37
        paddle.moveLeft();
        break;
        case 39:
        console.log('move right');//right arrow is 39
        paddle.moveRight();
        break;
        case 27:
        game.togglePause();
        break;
        case 32:
        game.start();
      }
    });

    document.addEventListener("keyup",(event)=>{
      switch(event.keyCode){
        case 37:
        if(paddle.speed<0)
        paddle.stop();
        break;
        case 39:
        if(paddle.speed>0)
        paddle.stop();
      }
    });
  }
}









class Ball{
  constructor(game){
    this.image =document.getElementById("imgBall");
    this.size=16;
    this.gameWidth=game.gameWidth;
    this.gameHeight=game.gameHeight;
    this.game=game;
    this.position={
      x:10,
      y:400
    };
    this.speed={x:4,
      y:-5
    };
  }
  draw(ctx){
    ctx.drawImage(this.image,this.position.x,this.position.y,this.size,this.size);
  }
  update(deltaTime){
    this.position.x+=this.speed.x;
    this.position.y+=this.speed.y;
    //check for collisions on the left or right
    if(this.position.x + this.size>this.gameWidth || this.position.x<0)
    this.speed.x=-this.speed.x;
    //check for collisions on the top or bottom
    if(this.position.y + this.size>this.gameHeight || this.position.y<0)
    this.speed.y=-this.speed.y;

    //check for collision with Paddle
    /*let bottomOfBall=this.position.y+this.size;
    let topOfPaddle=this.game.paddle.position.y;

    let leftSideOfPaddle=this.game.paddle.position.x;
    let rightSideOfPaddle=this.game.paddle.position.x+this.game.paddle.width
    if(bottomOfBall>=topOfPaddle && this.position.x>=leftSideOfPaddle && this.position.x+this.size<=rightSideOfPaddle)*/

    if(this.position.y+this.size>this.gameHeight)
    this.game.lives--;
    if(detectCollision(this,this.game.paddle)){
      this.speed.y=-this.speed.y;
      this.position.y=this.game.paddle.position.y-this.size;
    }
  }
}

function detectCollision(ball,gameObject){
  let bottomOfBall=ball.position.y+ball.size;
  let topOfball=ball.position.y;
  let topOfObject=gameObject.position.y;
  let leftSideOfObject=gameObject.position.x;
  let rightSideOfObject=gameObject.position.x+gameObject.width;
  let bottomOfObject=gameObject.position.y+gameObject.height;
  if(bottomOfBall>=topOfObject && topOfball<=bottomOfObject && ball.position.x>=leftSideOfObject && ball.position.x+ball.size<=rightSideOfObject){
    return true;
  }
  else return false;
}



let brk=[];
const levels=[
  [0,1,1,0,0,0,0,1,1,0],
  [1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1]
];
function buildLevels(game,level){
  levels.forEach((row,rowIndex)=>{
    row.forEach((brick,brickIndex)=>{
      if(brick==1){
        let position={
          x:80*brickIndex,
          y:75+24*rowIndex
        };
        brk.push(new Brick(game,position));
      }
    });
  });
return brk;
}


const gameState={
  paused:0,
  running:1,
  menu:2,
  gameover:3
};
class Game{
  constructor(gameWidth,gameHeight){
    this.gameWidth=gameWidth;
    this.gameHeight=gameHeight;
    this.gamestate=gameState.menu;
    this.paddle=new Paddle(this);
    this.ball=new Ball(this);
    this.gameObjects=[];
    this.lives=3;
    this.inp=new InputHandler(this.paddle,this);
  }
  start(){
    if(this.gamestate!=2)return;
    let bricks=buildLevels(game,levels);
    this.gameObjects=[this.ball,this.paddle,...bricks];
    this.gamestate=1;
  }
  update(deltaTime){
    if(this.lives==0)this.gamestate=gameState.gameover;
    if(this.gamestate==0 || this.gamestate==2 ||this.gameOver==3)return;
    this.gameObjects.forEach((object)=>object.update(deltaTime));
    this.gameObjects=this.gameObjects.filter(object=>!object.markedForDeletion);
  }
  draw(ctx){
    this.gameObjects.forEach((object)=>object.draw(ctx));

    if(this.gamestate==gameState.paused){
      ctx.rect(0,0,this.gameWidth,this.gameHeight);
      ctx.fillStyle="rgba(0,0,0,0.5)";
      ctx.fill();

      ctx.font="30px Arial";
      ctx.fillStyle="white";
      ctx.textAlign="center";
      ctx.fillText("Paused",this.gameWidth/2,this.gameHeight/2);
    }
    if(this.gamestate==gameState.menu){
      ctx.rect(0,0,this.gameWidth,this.gameHeight);
      ctx.fillStyle="rgba(0,0,0,1)";
      ctx.fill();

      ctx.font="30px Arial";
      ctx.fillStyle="white";
      ctx.textAlign="center";
      ctx.fillText("Press Space Bar to Start.You have 3 lives",this.gameWidth/2,this.gameHeight/2);
    }
    if(this.gamestate==gameState.gameover){
      ctx.rect(0,0,this.gameWidth,this.gameHeight);
      ctx.fillStyle="rgba(0,0,0,1)";
      ctx.fill();

      ctx.font="30px Arial";
      ctx.fillStyle="white";
      ctx.textAlign="center";
      ctx.fillText("Game Over!!",this.gameWidth/2,this.gameHeight/2);
    }
  }
  togglePause(){
    if(this.gamestate==gameState.paused){
      this.gamestate=gameState.running;
    }
    else
    this.gamestate=gameState.paused;

  }
}




class Brick{
  constructor(game,position){
    this.image =document.getElementById("imgBrick");
    this.gameWidth=game.gameWidth;
    this.gameHeight=game.gameHeight;
    this.game=game;
    this.width=80;
    this.height=24;
    this.position=position;
    this.ball=this.game.ball;
    this.markedForDeletion=false;
  }
  update(){
    if(detectCollision(this.ball,this)){
      this.ball.speed.y=-this.ball.speed.y;
      this.markedForDeletion=true;
    }
  }
  draw(ctx){
    ctx.drawImage(this.image,this.position.x,this.position.y,this.width,this.height);
  }
}













let canvas=document.getElementById("gameScreen");
let ctx=canvas.getContext('2d');//stores the context so that we cann draw on the canvas
//constants to store width and height of canvas
const gameWidth=800,gameHeight=600;


ctx.fillStyle='blue';
//creating paddle object
//let paddle=new Paddle(gameWidth,gameHeight)
//let ball=new Ball(gameWidth,gameHeight)

let game=new Game(gameWidth,gameHeight);

let lastTime=0;
function gameLoop(timeStamp){
  let deltaTime=timeStamp-lastTime;
  ctx.clearRect(0,0,gameWidth,gameHeight);
  lastTime=timeStamp;// storing current timestamp for next animation
  //paddle.update(deltaTime)
  //paddle.draw(ctx)
  //ball.update(deltaTime)
  //ball.draw(ctx)
  game.update(deltaTime);
  game.draw(ctx);
  requestAnimationFrame(gameLoop);//need to class this when we are ready to animate the next frame before browser can repaint
}

requestAnimationFrame(gameLoop);
