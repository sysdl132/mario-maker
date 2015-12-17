function MarioGame() {
  var canvas = document.getElementsByClassName('game-screen')[0];
  var ctx = canvas.getContext('2d');
  var maxWidth = 1280 * 3; //width of the game world
  var height = 480;
  var viewport = maxWidth / 3; //width of canvas, viewport that can be seen
  var tileSize = 32;

  var translatedDist = 0; //distance translated(side scrolled) as mario moves to the right
  var centerPos; //center position of the Viewport, viewable screen

  var mario; // Mario instance
  var element; // Element instance
  var gameSound; //GameSound instance

  var powerUps = []; //all powerUps
  var keys = []; //all key presses
  
  var tickCounter = 0; //for animating mario
  var maxTick = 25; //max number for ticks to show mario sprite

  var that = this;

  this.init = function() {
    canvas.width = viewport;
    canvas.height = height;
    mario = new Mario(canvas, ctx);
    mario.init();

    element = new Element();

    gameSound = new GameSound();
    gameSound.init();

    //key binding
    document.body.addEventListener('keydown', function(e) {
      keys[e.keyCode] = true;
    });

    document.body.addEventListener('keyup', function(e) {
      keys[e.keyCode] = false;
    });

    that.startGame();
  }

  //Main Game Loop
  this.startGame = function() {
    ctx.clearRect(0, 0, maxWidth, height);
    that.renderMap();

    mario.draw();

    that.updateMario();
    that.wallCollision();

    for (var i = 0; i < powerUps.length; i++) {
      powerUps[i].draw(ctx);
      powerUps[i].update();
    }

    window.requestAnimationFrame(that.startGame);
  }

  this.renderMap = function() {

    mario.grounded = false;

    for (var i = 0; i < powerUps.length; i++) {
      powerUps[i].grounded = false;
    }

    for (var row = 0; row < map.length; row++) {
      for (var column = 0; column < map[0].length; column++) {
        switch (map[row][column]) {
          case 1:
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.platform();
            element.draw(ctx);

            var collisionDirection = that.collisionCheck(mario, element);
            that.onCollision(element, collisionDirection, row, column);
            
            that.checkPowerUpCollision(element);
            break;

          case 2:
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.coinBox();
            element.draw(ctx);

            var collisionDirection = that.collisionCheck(mario, element);
            that.onCollision(element, collisionDirection, row, column);
           
            that.checkPowerUpCollision(element);
            break;

          case 3:
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.mushroomBox();
            element.draw(ctx);

            var collisionDirection = that.collisionCheck(mario, element);
            that.onCollision(element, collisionDirection, row, column);
           
            that.checkPowerUpCollision(element);
            break;

          case 4:
            element.x = column * tileSize;
            element.y = row * tileSize;
            element.uselessBox();
            element.draw(ctx);

            var collisionDirection = that.collisionCheck(mario, element);
            that.onCollision(element, collisionDirection, row, column);
            
            that.checkPowerUpCollision(element);
            break;
        }

      }
    }
  }

  this.collisionCheck = function(objA, objB) {
    // get the vectors to check against
    var vX = (objA.x + (objA.width / 2)) - (objB.x + (objB.width / 2));
    var vY = (objA.y + (objA.height / 2)) - (objB.y + (objB.height / 2));

    // add the half widths and half heights of the objects
    var hWidths = (objA.width / 2) + (objB.width / 2);
    var hHeights = (objA.height / 2) + (objB.height / 2);
    var collisionDirection = null;

    // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
      // figures out on which side we are colliding (top, bottom, left, or right)
      var offsetX = hWidths - Math.abs(vX),
        offsetY = hHeights - Math.abs(vY);

      if (offsetX >= offsetY) {
        if (vY > 0) {
          collisionDirection = 't';
          objA.y += offsetY;
        } else {
          collisionDirection = 'b';
          objA.y -= offsetY;
        }
      } else {
        if (vX > 0) {
          collisionDirection = 'l';
          objA.x += offsetX;
        } else {
          collisionDirection = 'r';
          objA.x -= offsetX;
        }
      }
    }
    return collisionDirection;
  }


  this.onCollision = function(element, collisionDirection, row, column) {
    if (collisionDirection == 'l' || collisionDirection == 'r') {
      mario.velX = 0;
      mario.jumping = false;
    } else if (collisionDirection == 'b') {
      mario.grounded = true;
      mario.jumping = false;
    } else if (collisionDirection == 't') {
      mario.velY *= -1;

      if (element.type == 3) { //Mushroom Box
        var powerUp = new PowerUp();
        powerUp.mushroom(element.x, element.y);
        powerUps.push(powerUp);

        map[row][column] = 4;

        //sound when mushroom appears
        gameSound.powerUpAppear.pause();
        gameSound.powerUpAppear.currentTime = 0;
        gameSound.powerUpAppear.play();
      }

      if (element.type == 2) { //Coin Box
        map[row][column] = 4;

        //sound when coin block is hit
        gameSound.coin.pause();
        gameSound.coin.currentTime = 0;
        gameSound.coin.play();
      }

    }
  }

  this.checkPowerUpCollision = function(element) {
    for (var i = 0; i < powerUps.length; i++) {
      var collisionDirection = that.collisionCheck(powerUps[i], element);
      var collWithMario = that.collisionCheck(powerUps[i], mario);

      that.onPowerUpCollision(powerUps[i], collisionDirection);
      if (collWithMario) {
        mario.type = 'big';
        powerUps.splice(i, 1);

        //sound when mushroom appears
        gameSound.powerUp.pause();
        gameSound.powerUp.currentTime = 0;
        gameSound.powerUp.play();
      }
    }

  }

  this.onPowerUpCollision = function(powerUp, collisionDirection) {
    if (collisionDirection == 'l' || collisionDirection == 'r') {
      powerUp.velX *= -1;
    } else if (collisionDirection == 'b') {
      powerUp.grounded = true;
    } else if (collisionDirection == 't') {

    }

  }

  this.wallCollision = function() {
    //for walls
    if (mario.x >= maxWidth - mario.width) {
      mario.x = maxWidth - mario.width;
    } else if (mario.x <= translatedDist) {
      mario.x = 1;
    }

    //for ground
    if (mario.y >= height) {
      setTimeout(function() {
        that.resetGame();
      }, 1000); 
    }
  }

  //controlling mario with key events
  this.updateMario = function() {
    var friction = 0.9;
    var gravity = 0.2;

    mario.checkMarioType();

    if (keys[38] || keys[32]) {
      //up arrow
      if (!mario.jumping && mario.grounded) {
        mario.jumping = true;
        mario.grounded = false;
        mario.velY = -((mario.speed) + 3);

        // mario sprite position
        if (mario.frame == 0 || mario.frame == 1) {
          mario.frame = 3; //right jump
        } else if (mario.frame == 8 || mario.frame == 9) {
          mario.frame = 2; //left jump
        }
      }
    }

    if (keys[39]) {
      //right arrow
      that.checkMarioPos(maxWidth);

      if (mario.velX < mario.speed && mario.x) {
        mario.velX++;
      }

      //mario sprite position
      if (!mario.jumping) {
        tickCounter += 1;

        if (tickCounter > maxTick / mario.speed) {
          tickCounter = 0;

          if (mario.frame != 1) {
            mario.frame = 1;
          } else {
            mario.frame = 0;
          }
        }
      }

    }

    if (keys[37]) {
      //left arrow
      if (mario.velX > -mario.speed) {
        mario.velX--;
      }

      //mario sprite position
      if (!mario.jumping) {
        tickCounter += 1;

        if (tickCounter > maxTick / mario.speed) {
          tickCounter = 0;

          if (mario.frame != 9) {
            mario.frame = 9;
          } else {
            mario.frame = 8;
          }
        }
      }

    }

    if (keys[16]) {
      //shift key
      mario.speed = 5;
    } else {
      mario.speed = 3;
    }


    //velocity 0 sprite position
    if (mario.velX > 0 && mario.velX < 1 && !mario.jumping) {
      mario.frame = 0;
    } else if (mario.velX > -1 && mario.velX < 0 && !mario.jumping) {
      mario.frame = 8;
    }

    if (mario.grounded) {
      mario.velY = 0;
    }

    //change mario position
    mario.velX *= friction;
    mario.velY += gravity;

    mario.x += mario.velX;
    mario.y += mario.velY;
  }

  this.checkMarioPos = function(maxWidth) {
    centerPos = (translatedDist) + (canvas.width / 2);
   
    //side scrolling as mario reaches center of the viewport
    if (mario.x > centerPos && (centerPos + canvas.width / 2) < maxWidth) {
      ctx.translate(-mario.speed, 0);
      translatedDist += mario.speed;
    }
  }

  this.resetGame = function() {
   
    ctx.translate(translatedDist, 0);
    translatedDist = 0;

    mario.type = 'small';
    mario.resetPos();
  }
}

var marioGame = new MarioGame();
marioGame.init();
