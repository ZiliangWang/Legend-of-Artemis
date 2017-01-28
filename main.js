var AM = new AssetManager();

function Animation(spriteSheet, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale) {
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.sheetWidth = sheetWidth;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.scale = scale;
    this.iterations = 0;
    this.currFrame = 0;
    this.pressed = false;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, row, animating) {
    this.animating = animating;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    }

    if(animating) {
      this.currFrame = this.currentFrame();
    } else {
      this.currFrame = 0;
    }

    var xindex = 0;
    var yindex = 0;
    this.row = row;
    xindex = this.currFrame % this.sheetWidth;
    yindex = Math.floor(this.currFrame / this.sheetWidth);
    if(this.pressed) {
      console.log(xindex);
      console.log("y" + yindex);
    }
    ctx.drawImage(this.spriteSheet,
                 xindex * this.frameWidth, yindex * this.frameHeight + this.row * this.frameHeight,  // source from sheet
                 this.frameWidth, this.frameHeight,
                 x, y,
                 this.frameWidth * this.scale,
                 this.frameHeight * this.scale);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

Animation.prototype.setFrame = function (theFrame) {
  this.currFrame = theFrame;
}

Animation.prototype.drawSpecifcFrame = function(ctx, x, y, row, col) {
  ctx.drawImage(this.spriteSheet,
               row * this.frameWidth,
               col* this.frameHeight,  // source from sheet
               this.frameWidth, this.frameHeight,
               x, y,
               this.frameWidth * this.scale,
               this.frameHeight * this.scale);
}


// no inheritance
function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
};

Background.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet,
                   this.x, this.y);
};

Background.prototype.update = function () {
};

function Chest(game, spritesheet) {
  this.animation = new Animation(spritesheet, 47, 38, 3.5, 0.2, 3.5, false, 1.5);
  this.x = 100;
  this.y = 480;
  this.ctx = game.ctx;
  this.game = game;
}

Chest.prototype.draw = function() {
  if(this.open && !this.wasOpened) {
      this.animation.currFrame = 0;
      this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 0, true);
  } else if(this.wasOpened) {
    this.animation.drawSpecifcFrame(this.ctx, this.x, this.y, 3, 0);
  }else {
      this.animation.drawSpecifcFrame(this.ctx, this.x, this.y, 0, 0);
  }
}

Chest.prototype.update = function() {
  if(this.game.interract) {
    this.open = true;

  }
  if (this.animation.isDone()) {
      this.open = false;
      this.animation.elapsedTime = 0;
      this.wasOpened = true;
  }
}

function OrcBowman(game, spritesheet) {
  this.walkAnimation = new Animation(spritesheet, 64, 64, 9, 0.1, 9, true, 1.5);
  this.magicAnimation = new Animation(spritesheet, 64, 64, 7, 0.5, 7, false, 1.5);
  this.shootRightAnimation = new Animation(spritesheet, 64, 64, 12.5, 0.5, 12.5, false, 1.5);
  this.shootLeftAnimation = new Animation(spritesheet, 64, 64, 12.5, 0.5, 12.5, false, 1.5);
  this.spritesheet = spritesheet;
  this.x = 0;
  this.y = 480;
  this.speed = 100;
  this.ctx = game.ctx;
  this.game = game;
  this.currDirection = 11;
}

OrcBowman.prototype.draw = function () {
  if(this.right) {
    this.walkAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 11, true);
    this.right = false;
  } else if(this.left) {
    this.walkAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 9, true);
    this.left = false;
  } else if(this.down) {
      this.magicAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 2, true);

  } else if(this.melee) {
    if (this.shootRightAnimation.isDone()) {
      this.shootRightAnimation.elapsedTime = 0;
      this.melee = false;
      this.shootRightAnimation.drawSpecifcFrame(this.ctx, this.x, this.y, 13, 19);

    } else if(this.shootLeftAnimation.isDone()) {
      this.shootLeftAnimation.elapsedTime = 0;
      this.melee = false;
    } else {
      if(this.currDirection === 11) {
        this.shootRightAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 19, true);
      } else {
        this.shootRightAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 17, true);
      }
    }
  }
  else {
    if(this.lastPressed === "right") {
      this.walkAnimation.drawFrame(0, this.ctx, this.x, this.y, this.currDirection, false);
    } else if(this.lastPressed === "left"){
      this.walkAnimation.drawFrame(0, this.ctx, this.x, this.y, this.currDirection, false);
    } else if(this.lastPressed === "down") {
      this.magicAnimation.drawSpecifcFrame(this.ctx, this.x, this.y, 0, 2);
    } else if(this.lastPressed === "melee" && this.currDirection === "right") {
      this.shootRightAnimation.drawSpecifcFrame(this.ctx, this.x, this.y, 13, 19);
    }else {
      this.walkAnimation.drawFrame(0, this.ctx, this.x, this.y, this.currDirection, false);
    }
  }



}

OrcBowman.prototype.update = function () {
  if(this.game.right) {
    this.right = true;
    this.currDirection = 11;
    this.lastPressed = "right";
  } else if(this.game.left) {
    this.left = true;
    this.currDirection = 9;
    this.lastPressed = "left";
  } else if(this.game.down) {
    this.lastPressed = "down";
    this.down = true;
  } else if(this.game.melee) {
    this.lastPressed = "melee";
    this.melee = true;
  }
  if (this.magicAnimation.isDone()) {
      this.magicAnimation.elapsedTime = 0;
      this.down = false;
  }

  if(this.right) {
    this.x += this.game.clockTick * this.speed;
  } else if(this.left) {
    this.x -= this.game.clockTick * this.speed;
  } else {

  }
  if(this.x > 1650) this.x = -230;
}

// OrcBowman.prototype.shootBow = function() {
//   this.animation.setFrames(13);
//   console.log(Key.getLastKey());
//   if(Key.getLastKey() === 39) {
//     this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 19, true);
//   } else if(Key.getLastKey() === 37){
//     this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 17, true);
//   }
// }
//
// OrcBowman.prototype.castRadialMagic = function() {
//   this.animation.setFrames(7);
//   this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 2, true);
// }
//
// function MushroomDude(game, spritesheet) {
//     this.animation = new Animation(spritesheet, 189, 230, 5, 0.10, 14, true, 1);
//     this.x = 0;
//     this.y = 0;
//     this.speed = 100;
//     this.game = game;
//     this.ctx = game.ctx;
// }
//
// MushroomDude.prototype.draw = function () {
//     this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
// }
//
// MushroomDude.prototype.update = function () {
//     if (this.animation.elapsedTime < this.animation.totalTime * 8 / 14)
//         this.x += this.game.clockTick * this.speed;
//     if (this.x > 800) this.x = -230;
// }
//
//
// // inheritance
// function Cheetah(game, spritesheet) {
//     this.animation = new Animation(spritesheet, 512, 256, 2, 0.05, 8, true, 0.5);
//     this.speed = 350;
//     this.ctx = game.ctx;
//     Entity.call(this, game, 0, 250);
// }
//
// Cheetah.prototype = new Entity();
// Cheetah.prototype.constructor = Cheetah;
//
// Cheetah.prototype.update = function () {
//     this.x += this.game.clockTick * this.speed;
//     if (this.x > 800) this.x = -230;
//     Entity.prototype.update.call(this);
// }
//
// Cheetah.prototype.draw = function () {
//     this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
//     Entity.prototype.draw.call(this);
// }
//
// // inheritance
// function Guy(game, spritesheet) {
//     this.animation = new Animation(spritesheet, 154, 215, 4, 0.15, 8, true, 0.5);
//     this.speed = 100;
//     this.ctx = game.ctx;
//     Entity.call(this, game, 0, 450);
// }
//
// Guy.prototype = new Entity();
// Guy.prototype.constructor = Guy;
//
// Guy.prototype.update = function () {
//     this.x += this.game.clockTick * this.speed;
//     if (this.x > 800) this.x = -230;
//     Entity.prototype.update.call(this);
// }
//
// Guy.prototype.draw = function () {
//     this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
//     Entity.prototype.draw.call(this);
// }


// AM.queueDownload("./img/RobotUnicorn.png");
// AM.queueDownload("./img/guy.jpg");
// AM.queueDownload("./img/mushroomdude.png");
// AM.queueDownload("./img/runningcat.png");
AM.queueDownload("./img/forestBackground.jpg");
AM.queueDownload("./img/Orc.png");
AM.queueDownload("./img/Chest.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/forestBackground.jpg")));
    gameEngine.addEntity(new Chest(gameEngine, AM.getAsset("./img/Chest.png")));
    gameEngine.addEntity(new OrcBowman(gameEngine, AM.getAsset("./img/Orc.png")));


    // gameEngine.addEntity(new MushroomDude(gameEngine, AM.getAsset("./img/mushroomdude.png")));
    // gameEngine.addEntity(new Cheetah(gameEngine, AM.getAsset("./img/runningcat.png")));
    // gameEngine.addEntity(new Guy(gameEngine, AM.getAsset("./img/guy.jpg")));

    console.log("All Done!");
});
