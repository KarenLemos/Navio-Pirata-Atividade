const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;

let engine, world, backgroundImg, waterSound, pirateLaughSound, backgroundMusic, cannonExplosion;
let canvas, angle, tower, ground, cannon, boat;

let balls = [];
let boats = [];

let score = 0;

let boatAnimation = [];
let boatSpritedata, boatSpritesheet;

let brokenBoatAnimation = [];
let brokenBoatSpritedata, brokenBoatSpritesheet;

let waterSplashAnimation = [];
let waterSplashSpritedata, waterSplashSpritesheet;

let isGameOver = false;
let isLaughing= false;

function preload() {
  backgroundImg = loadImage("./assets/background.gif");
  backgroundMusic = loadSound("./assets/background_music.mp3");
  waterSound = loadSound("./assets/cannon_water.mp3");
  pirateLaughSound = loadSound("./assets/pirate_laugh.mp3");
  cannonExplosion = loadSound("./assets/cannon_explosion.mp3");
  towerImage = loadImage("./assets/tower.png");
  boatSpritedata = loadJSON("./assets/boat/boat.json");
  boatSpritesheet = loadImage("./assets/boat/boat.png");
  brokenBoatSpritedata = loadJSON("./assets/boat/broken_boat.json");
  brokenBoatSpritesheet = loadImage("./assets/boat/broken_boat.png");
  waterSplashSpritedata = loadJSON("./assets/water_splash/water_splash.json");
  waterSplashSpritesheet = loadImage("./assets/water_splash/water_splash.png");
}

function setup() {
  canvas = createCanvas(1200,600);
  engine = Engine.create();
  world = engine.world;
  angleMode(DEGREES);
  angle = 15;


  ground = Bodies.rectangle(0, height - 1, width * 2, 1, { isStatic: true });
  World.add(world, ground);

  tower = Bodies.rectangle(160, 350, 160, 310, { isStatic: true });
  World.add(world, tower);

  cannon = new Cannon(180, 110, 100, 100, angle);

  let boatFrames = boatSpritedata.frames;
  for (let i = 0; i < boatFrames.length; i++) {
    let pos = boatFrames[i].position;
    let img = boatSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    boatAnimation.push(img);
  }

  let brokenBoatFrames = brokenBoatSpritedata.frames;
  for (let i = 0; i < brokenBoatFrames.length; i++) {
    let pos = brokenBoatFrames[i].position;
    let img = brokenBoatSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    brokenBoatAnimation.push(img);
  }

  let waterSplashFrames = waterSplashSpritedata.frames;
  for (let i = 0; i < waterSplashFrames.length; i++) {
    let pos = waterSplashFrames[i].position;
    let img = waterSplashSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    waterSplashAnimation.push(img);
  }
}

function draw() {
  background(189);
  image(backgroundImg, 0, 0, width, height);

  //Colocar música de fundo


  Engine.update(engine);
 
  push();
  translate(ground.position.x, ground.position.y);
  fill("brown");
  rectMode(CENTER);
  rect(0, 0, width * 2, 1);
  pop();

  push();
  translate(tower.position.x, tower.position.y);
  rotate(tower.angle);
  imageMode(CENTER);
  image(towerImage, 0, 0, 160, 310);
  pop();

  showBoats();

   for (let i = 0; i < balls.length; i++) {
    showCannonBalls(balls[i], i);
    collisionWithBoat(i);
  }

  cannon.display();
  
  //Colocar pontuação

}

function collisionWithBoat(index) {
  for (let i = 0; i < boats.length; i++) {
    if (balls[index] !== undefined && boats[i] !== undefined) {
      let collision = Matter.SAT.collides(balls[index].body, boats[i].body);

      if (collision.collided) {
        //Configurar colisão

      }
    }
  }
}

function keyPressed() {
  if (keyCode === DOWN_ARROW) {
    let cannonBall = new CannonBall(cannon.x, cannon.y);
    cannonBall.trajectory = [];
    Matter.Body.setAngle(cannonBall.body, cannon.angle);
    balls.push(cannonBall);
  }
}

function showCannonBalls(ball, index) {
  if (ball) {
    ball.display();
    ball.animate();
    if (ball.body.position.y >= height - 50) {
      waterSound.play()  
      ball.remove(index);      
    }    
  }
}

function showBoats() {
  if (boats.length > 0) {
    if (
      boats.length < 4 &&
      boats[boats.length - 1].body.position.x < width - 300
    ) {
      let positions = [-40, -60, -70, -20];
      let position = random(positions);
      let boat = new Boat(
        width,
        height - 100,
        170,
        170,
        position,
        boatAnimation
      );

      boats.push(boat);
    }

    for (let i = 0; i < boats.length; i++) {
      Matter.Body.setVelocity(boats[i].body, {
        x: -0.9,
        y: 0
      });

      boats[i].display();
      boats[i].animate();
      let collision = Matter.SAT.collides(this.tower, boats[i].body);
      if (collision.collided && !boats[i].isBroken) {
          if(!isLaughing && !pirateLaughSound.isPlaying()){
            pirateLaughSound.play();
            isLaughing = true
          }
        isGameOver = true;
        gameOver();
      }
    }
  } else {
    let boat = new Boat(width, height - 60, 170, 170, -60, boatAnimation);
    boats.push(boat);
  }
}

function keyReleased() {
  if (keyCode === DOWN_ARROW && !isGameOver) {
    cannonExplosion.play();
    balls[balls.length - 1].shoot();
  }
}

//Criar função gameOver()

