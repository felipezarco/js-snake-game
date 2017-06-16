$(document).ready(function(){
  startGame();
});

var BOARD;
var CENTER;
var snake = {};
var level = {};
var food;
var blink;

function startGame() {
  startPressKeyScreenText();
  setInitialValues();
  createBoardMatrix();
  createSnake();
}

function resetGame() {
  stopPreviousMovement();
  clearBoard();
  startGame();
}

function setInitialValues() {
  BOARD = { WIDTH: 50, HEIGHT: 50 }
  CENTER  = { x: BOARD.WIDTH/2,  y: BOARD.HEIGHT/2 }
  game = { start: true, over: false, score: 0 }
  setInitialScore(0);
  setGameLevel("easy");
}

function setInitialScore(points) {
  game.score = points;
  $(".score").html(game.score);
}

function setGameLevel(name) {
  setLevel(name);
  switch (level.name) {
    case "easy":   setLevelSpeed(200); setSnakeSize(3);  break;
    case "normal": setLevelSpeed(100); setSnakeSize(4);  break;
    case "hard":   setLevelSpeed(50); setSnakeSize(5);  break;
    case "master": setLevelSpeed(25);  setSnakeSize(10);  break;
  }
}

function setLevel(name) {
  level.name = name;
  $(".level").html(level.name);
}

function setLevelSpeed(speed) {
  level.initialSpeed = speed;
  level.speed = speed;
  $(".speed").html("0");
}

function setSnakeSize(size) {
  snake.size = size;
  $(".size").html(snake.size);
}

function createBoardMatrix() {
  for(var pixelX=0;pixelX<BOARD.WIDTH;pixelX++)
    for(var pixelY=0;pixelY<BOARD.HEIGHT;pixelY++)
      $(".board").append("<div id='"+pixelX+"-"+pixelY+"' class='pixel' align='center'></div>");
}

function createSnake() {
  snake.body = [ {posX: CENTER.x, posY:CENTER.y} ];
}

function getHead() {
  return snake.body[0];
}

function getTail() {
  return snake.body[snake.body.length-1];
}

function drawFoodOnBoard() {
  food = {};
  food.posX = generateRandomFromInterval(0,BOARD.WIDTH-1);
  food.posY = generateRandomFromInterval(0,BOARD.HEIGHT-1);
  paintFood(food);
}

function generateRandomFromInterval(min,max) {
  return Math.floor(Math.random()*max + min);
}

document.addEventListener('keydown', function(event) {
  if(game.start) {
    drawFoodOnBoard();
    removeScreenText();
    game.start = false;
  }
  switch (event.keyCode) {
    case 38: changeDirectionIfValid("up");    break;
    case 40: changeDirectionIfValid("down");  break;
    case 39: changeDirectionIfValid("right"); break;
    case 37: changeDirectionIfValid("left");  break;
  }
  continueMoving();
});

function changeDirectionIfValid(inputDirection) {
  switch (inputDirection) {
    case "up":    if(game.direction != "down")  game.direction = "up";    break;
    case "down":  if(game.direction != "up")    game.direction = "down";  break;
    case "right": if(game.direction != "left")  game.direction = "right"; break;
    case "left":  if(game.direction != "right") game.direction = "left";  break;
  }
  moveSnake();
}

function continueMoving() {
  stopPreviousMovement();
  moveToAtSpeed(level.speed);
}

function stopPreviousMovement() {
  clearInterval(game.movement);
}

function moveToAtSpeed(speed) {
  game.movement = setInterval(function(){ moveSnake(); }, speed);
}

function moveSnake() {
  var nextSnakeHead = new Object();
  snake.head = getHead();

  nextSnakeHead.posX = snake.head.posX;
  nextSnakeHead.posY = snake.head.posY;

  switch (game.direction) {
    case "up":    nextSnakeHead.posX--; break;
    case "down":  nextSnakeHead.posX++; break;
    case "right": nextSnakeHead.posY++; break;
    case "left":  nextSnakeHead.posY--; break;
  }

  computeSnakeMovement(nextSnakeHead);

  if(isPixelSnakeBody(nextSnakeHead)) resetGame();
  else if(isPixelWall(nextSnakeHead)) resetGame();
  else if(isPixelFood(nextSnakeHead)) eatFood();
}

function computeSnakeMovement(snakeHead) {
  advanceSnakePosition(snakeHead);
  paintSnake();
}

function advanceSnakePosition(snakeHead) {
  snake.body.unshift(snakeHead);
}

function eatFood() {
  removeFood(food);
  levelUpIfHitScore();
  computeGameBonuses();
  drawFoodOnBoard();
}

function levelUpIfHitScore() {
  switch (level.name) {
    case "easy":   if(snake.size >= 10)  { setGameLevel("normal"); }  break;
    case "normal": if(snake.size >= 25)  { setGameLevel("hard");   }  break;
    case "hard":   if(snake.size >= 100) { setGameLevel("master"); }  break;
    case "master": if(snake.size >= 666) { changeScreenText("YOU F*****G WON THE GAME. WOW."); } break;
  }
}

function computeGameBonuses() {
  addSizeToSnake();
  addPointsToScore();
  addSpeedToSnake();
}

function isPixelSnakeBody(snakeHead) {
  for(var i=1; i<snake.body.length;++i)
    if(snakeHead.posX == snake.body[i].posX &&
       snakeHead.posY == snake.body[i].posY)
       return true;
  return false;
}

function isPixelWall(snakeHead) {
  if(snakeHead.posX < 0 || snakeHead.posX > 49 ||
     snakeHead.posY < 0 || snakeHead.posY > 49)
    return true;
  return false;
}

function isPixelFood(snakeHead) {
  if(snakeHead.posX == food.posX &&
     snakeHead.posY == food.posY)
     return true;
  return false;
}

function addSizeToSnake() {
  switch(level.name) {
    case "easy":   snake.size+=1; break;
    case "normal": snake.size+=1; break;
    case "hard":   snake.size+=1; break;
    case "master": snake.size+=10; break;
  }
  $(".size").html(snake.size);
}

function addPointsToScore() {
  switch(level.name) {
    case "easy":   game.score += 25;  break;
    case "normal": game.score += 50;  break;
    case "hard":   game.score += 100; break;
    case "master": game.score += 275; break;
  }
  $(".score").html(game.score);
}

function addSpeedToSnake() {
  switch (level.name) {
    case "easy":   level.speed*=0.999; break;
    case "normal": level.speed*=0.995; break;
    case "hard":   level.speed*=0.980; break;
    case "master": level.speed*=0.800; break;
  }
  var invertedSpeedValue = 1 + (level.initialSpeed - level.speed)*10;
  $(".speed").html(parseInt(invertedSpeedValue));
}

function paintSnake() {
  paintNewSnakeSkin();
  removeOldSnakeSkin();
}

function paintNewSnakeSkin() {
  for(var i=0;i<snake.body.length;i++)
    $("#"+snake.body[i].posX+"-"+snake.body[i].posY).addClass("snake");
}

function removeOldSnakeSkin() {
  while(snake.body.length>snake.size) {
    var removedSkin = snake.body.pop();
    $("#"+removedSkin.posX+"-"+removedSkin.posY).removeClass("snake");
  }
}

function paintFood(object) {
  $("#"+object.posX+"-"+object.posY).addClass("food");
}

function removeFood(object) {
  $("#"+object.posX+"-"+object.posY).removeClass("food");
}

function clearBoard() {
  for(var pixelX=0;pixelX<BOARD.WIDTH;pixelX++)
    for(var pixelY=0;pixelY<BOARD.HEIGHT;pixelY++) {
      $("#"+pixelX+"-"+pixelY).removeClass("snake");
      $("#"+pixelX+"-"+pixelY).removeClass("food");
    }
}

function startPressKeyScreenText() {
  changeScreenText("PRESS ARROW KEY TO START");
}

function removeScreenText() {
  changeScreenText("");
}

function changeScreenText(text) {
  $(".screen-text").html(text);
}
