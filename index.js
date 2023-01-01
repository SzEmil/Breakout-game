'use strict';

const grid = document.querySelector('.grid');
const scoreDisplay = document.querySelector('#score');
const startBtn = document.querySelector('#startBtn');
const easyBtn = document.querySelector('#easy');
const mediumBtn = document.querySelector('#medium');
const hardBtn = document.querySelector('#hard');
const gui = document.querySelector('.gui');
const scoreboard = document.querySelector('.scoreboard');
const random = document.querySelector('#randomix');
const information = document.querySelector('.information');
const userLives = document.querySelector('#user-lives');
const blockWidth = 100;
const blokcHeight = 20;
const boardWidth = 560;
const ballDiamater = 20;
const boardHeight = 300;

let score = 0;

let lvl = 30;

let xDirection = -2;
let yDirection = 2;
let timerId = null;
let resumeGameTimer = null;

const userStart = [230, 10];
let currentPosition = userStart;

const ballStart = [270, 80];
let ballCurrentPosition = ballStart;

let hearts = [];

startBtn.disabled = true;
random.disabled = true;
//creating block out from class
class Block {
  constructor(xAxis, yAxis) {
    this.bottomLeft = [xAxis, yAxis];
    this.bottomRight = [xAxis + blockWidth, yAxis];
    this.topLeft = [xAxis, yAxis + blokcHeight];
    this.topRight = [xAxis + blockWidth, yAxis + blokcHeight];
  }
}
//table of blocks
let blocks = [];
//random color
function getRandomHexColor() {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, 0)}`;
}

//addin new block from block table
function addBlocks() {
  for (let i = 0; i < blocks.length; i++) {
    const block = document.createElement('div');
    block.classList.add('block');
    block.style.left = blocks[i].bottomLeft[0] + 'px';
    block.style.bottom = blocks[i].bottomLeft[1] + 'px';
    block.style.backgroundColor = getRandomHexColor();
    grid.appendChild(block);
    console.log('utworzono obiekt');
  }
}

function removeBlocks() {
  const allDivsBlocks = Array.from(grid.querySelectorAll('div .block'));
  allDivsBlocks.forEach((element, index) => {
    element.remove();
  });
  blocks.innerHTML = '';
}
//user
const user = document.createElement('div');
user.classList.add('user');
drawUser();
grid.appendChild(user);

//drawUser
function drawUser() {
  user.style.left = currentPosition[0] + 'px';
  user.style.bottom = currentPosition[1] + 'px';
}

//draw ball
function drawBall() {
  ball.style.left = ballCurrentPosition[0] + 'px';
  ball.style.bottom = ballCurrentPosition[1] + 'px';
}

//move user
function moveUser(e) {
  switch (e.key) {
    case 'ArrowLeft':
      if (currentPosition[0] > 0) {
        currentPosition[0] -= 10;
        drawUser();
      }
      break;
    case 'ArrowRight':
      if (currentPosition[0] < boardWidth - blockWidth) {
        currentPosition[0] += 10;
        drawUser();
      }
  }
}
document.addEventListener('keydown', moveUser);

//add ball
const ball = document.createElement('div');
ball.classList.add('ball');
drawBall();
grid.appendChild(ball);

//move ball
function moveBall() {
  ballCurrentPosition[0] += xDirection;
  ballCurrentPosition[1] += yDirection;
  drawBall();
  checkForCollisions();
}

//colisions
function checkForCollisions() {
  //check for block collisions
  for (let i = 0; i < blocks.length; i++) {
    if (
      ballCurrentPosition[0] > blocks[i].bottomLeft[0] &&
      ballCurrentPosition[0] < blocks[i].bottomRight[0] &&
      ballCurrentPosition[1] + ballDiamater > blocks[i].bottomLeft[1] &&
      ballCurrentPosition[1] < blocks[i].topLeft[1]
    ) {
      const allBlocks = Array.from(document.querySelectorAll('.block'));
      allBlocks[i].classList.remove('block');
      blocks.splice(i, 1);
      changeDirection();
      score++;
      scoreDisplay.innerHTML = score;

      //check for win
      if (blocks.length === 0) {
        scoreDisplay.innerHTML = 'WYGRANKO';
        clearInterval(timerId);
        document.removeEventListener('keydown', moveUser);

        startBtn.disabled = true;
        random.disabled = false;
        easyBtn.style.backgroundColor = 'white';
        easyBtn.style.color = 'black';
        mediumBtn.style.backgroundColor = 'white';
        mediumBtn.style.color = 'black';
        hardBtn.style.backgroundColor = 'white';
        hardBtn.style.color = 'black';

        const actualscore = localStorage.getItem(LocalStorageKey);
        const parsedScore = JSON.parse(actualscore);
        parsedScore.push(score);
        localStorage.setItem(LocalStorageKey, JSON.stringify(parsedScore));
        getScore();
      }
    }
  }

  //check for wall collisions
  if (
    ballCurrentPosition[0] >= boardWidth - ballDiamater ||
    ballCurrentPosition[1] >= boardHeight - ballDiamater ||
    ballCurrentPosition[0] <= 0
  ) {
    changeDirection();
  }

  //check for user collisions
  if (
    ballCurrentPosition[0] > currentPosition[0] &&
    ballCurrentPosition[0] < currentPosition[0] + blockWidth &&
    ballCurrentPosition[1] > currentPosition[1] &&
    ballCurrentPosition[1] < currentPosition[1] + blokcHeight
  ) {
    changeDirection();
  }

  //check for game over
  if (ballCurrentPosition[1] <= 0) {
    ballCurrentPosition[0] = 270;
    ballCurrentPosition[1] = 80;
    drawBall();

    if (hearts.length > 0) {
      console.log(`pozostały Ci ${hearts.length - 1} życia`);
      startBtn.disabled = false;
      startBtn.textContent = 'Resume';
    }

    const allHearts = Array.from(document.querySelectorAll('.heart'));
    allHearts[0].classList.remove('heart');
    hearts.pop();
    console.log(hearts);

    clearInterval(timerId);

    let n = 3;
    information.textContent = ' ';
    if (hearts.length > 0) {
      resumeGameTimer = setInterval(() => {
        if (n < 0 && hearts.length > 0) {
          timerId = setInterval(moveBall, lvl);
          startBtn.disabled = true;
          clearInterval(resumeGameTimer);
          return;
        }
        information.textContent = `Do wznowienia gry pozostało: ${n}`;
        n--;
      }, 1000);
    }
    if (hearts.length <= 0) {
      scoreDisplay.innerHTML = 'PRZEGRANKO';
      startBtn.textContent = 'TRY AGAIN';
      startBtn.disabled = true;
      random.disabled = false;
      easyBtn.style.backgroundColor = 'white';
      easyBtn.style.color = 'black';
      mediumBtn.style.backgroundColor = 'white';
      mediumBtn.style.color = 'black';
      hardBtn.style.backgroundColor = 'white';
      hardBtn.style.color = 'black';
      try {
        const actualscore = localStorage.getItem(LocalStorageKey);
        const parsedScore = JSON.parse(actualscore);
        parsedScore.push(score);
        localStorage.setItem(LocalStorageKey, JSON.stringify(parsedScore));
        getScore();
      } catch (error) {
        console.error(error);
      }

      document.removeEventListener('keydown', moveUser);
    }
  }
}

function changeDirection() {
  if (xDirection === 2 && yDirection === 2) {
    yDirection = -2;
    return;
  }
  if (xDirection === 2 && yDirection === -2) {
    xDirection = -2;
    return;
  }
  if (xDirection === -2 && yDirection === -2) {
    yDirection = 2;
    return;
  }
  if (xDirection === -2 && yDirection === 2) {
    xDirection = 2;
    return;
  }
}

function startGame() {
  blocks = [
    new Block(10, 270),
    new Block(120, 270),
    new Block(230, 270),
    new Block(340, 270),
    new Block(450, 270),

    new Block(10, 240),
    new Block(120, 240),
    new Block(230, 240),
    new Block(340, 240),
    new Block(450, 240),

    new Block(10, 210),
    new Block(120, 210),
    new Block(230, 210),
    new Block(340, 210),
    new Block(450, 210),
  ];
  addBlocks();
  timerId = setInterval(moveBall, lvl);
  console.log(lvl);
  startBtn.disabled = true;
  console.log(hearts);
}

startBtn.addEventListener('click', startGame);
hardBtn.addEventListener('click', () => {
  lvl = 5;
  generateLives(1);
  easyBtn.disabled = true;
  mediumBtn.disabled = true;
  startBtn.disabled = false;
  hardBtn.disabled = true;
  hardBtn.style.backgroundColor = 'transparent';
  hardBtn.style.color = 'red';
});
mediumBtn.addEventListener('click', () => {
  lvl = 10;
  generateLives(2);
  hardBtn.disabled = true;
  mediumBtn.disabled = true;
  easyBtn.disabled = true;
  startBtn.disabled = false;
  mediumBtn.style.backgroundColor = 'transparent';
  mediumBtn.style.color = 'orange';
});
easyBtn.addEventListener('click', () => {
  lvl = 20;
  generateLives(3);
  easyBtn.disabled = true;
  hardBtn.disabled = true;
  mediumBtn.disabled = true;
  startBtn.disabled = false;
  easyBtn.style.backgroundColor = 'transparent';
  easyBtn.style.color = 'green';
});

//lives generated
function generateLives(numberOfLives) {
  for (let i = 0; i < numberOfLives; i++) {
    const heart = document.createElement('div');
    heart.classList.add('heart');
    hearts.push(heart);
    userLives.appendChild(heart);
  }
}

//scoreboard local storage
const LocalStorageKey = 'playerScore';

const savescore = () => {
  let scoreStorage = [];
  localStorage.setItem(LocalStorageKey, JSON.stringify(scoreStorage));
};

const getScore = () => {
  try {
    scoreboard.innerHTML = '';
    let approach = 1;
    const activscore = localStorage.getItem(LocalStorageKey);
    const parsedScore = JSON.parse(activscore);

    parsedScore.forEach((element, index) => {
      const scoreLine = document.createElement('a');
      scoreLine.style.color = 'white';
      scoreLine.textContent = `Wynik próba ${approach} : ${parsedScore[index]}`;
      scoreboard.appendChild(scoreLine);
      approach++;
    });
  } catch (error) {
    console.error(error);
  }
};

//creating scoreboard from local storage
savescore();
// getScore();

//seting storage

//RESET GAME
const resetGame = () => {
  removeBlocks();
  easyBtn.disabled = false;
  hardBtn.disabled = false;
  mediumBtn.disabled = false;
  startBtn.disabled = true;
  document.addEventListener('keydown', moveUser);
  random.disabled = true;
  score = 0;
  scoreDisplay.textContent = 0;
};

random.addEventListener('click', resetGame);
