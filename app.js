//get DOM elements
var root = document.querySelector(":root");
const playerResult = document.querySelector(".playerList");
const houseResult = document.querySelector(".houseList");
const face = document.getElementById("face");
const userMessage = document.getElementById("user-message");

let help = document.getElementById("help");
let helpDisplay = document.getElementById("help_info");
let scoreboard = document.getElementById("scoreboard");
let scoreboardDisplay = document.getElementById("scoreboard_info");
let leaderboard = document.getElementById("leaderboard");
let backBtn = document.getElementById("back_btn");

let displayChips = document.getElementById("chips");
let displayPot = document.getElementById("pot");
let displayScore = document.getElementById("score");
let displayHouseScore = document.getElementById("houseScore");
let displayRemaining = document.getElementById("hands");

const firstDraw = document.querySelector(".draw2");
const hit = document.querySelector(".draw1");
const stand = document.querySelector(".stand");
const doubleD = document.querySelector(".doubleD");
const nxtGame = document.querySelector(".replay");
const restart = document.querySelector(".restart");

const bet10P = document.querySelector(".bet10P");
const bet20P = document.querySelector(".bet20P");
const bet33P = document.querySelector(".bet33P");
const betAllP = document.querySelector(".betAllP");

const drawSound = document.querySelector(".drawCardSound");
const newCardSound = document.querySelector(".newCardSound");
const standSound = document.querySelector(".standSound");
const chipSound = document.querySelector(".chipSound");
const winSound = document.querySelector(".winSound");
const loseSound = document.querySelector(".loseSound");
const gameOverSound = document.querySelector(".gameOverSound");
const applauseSound = document.querySelector(".applauseSound");
const clickSound = document.querySelector(".clickSound");

const stylebox = document.querySelector("body");
const hideableSection = document.querySelector(".toggle-section");

/*
|--------------------------------------------------------------------------
| Game setup
|--------------------------------------------------------------------------
|
|
*/

//retrieve top scores from local
retrieveScores();

//set up global variables
let deck = [];
let playerHand = [];
let houseHand = [];
let chips = 500;
let pot = 0;
let hands = 10;
let playIsOver = false;

//display starter chips and hands
displayChips.textContent = chips;
displayRemaining.textContent = hands;

//disable all but betting buttons, initiate button pulse animation
hit.disabled = true;
stand.disabled = true;
nxtGame.disabled = true;
doubleD.disabled = true;
firstDraw.disabled = true;
betPulseOn();

/*
|--------------------------------------------------------------------------
| Function declarations
|--------------------------------------------------------------------------
|
|
*/

//init gets JSON Deck of cards out of local to creates/resets the deck
function init() {
  fetch("/deck.json")
    .then((response) => response.json())
    .then((cards) => {
      deck = cards;
    });
}

function placeBet(amount = "bet10") {
  let divisor;
  switch (amount) {
    case "bet10":
      divisor = 10;
      break;
    case "bet20":
      divisor = 5;
      break;
    case "bet33":
      divisor = 3;
      break;
    case "betAll":
      divisor = 1;
      break;
  }

  let bet = Math.floor(chips / divisor);
  chipSoundFunc();
  chips -= bet;
  pot += bet;
  displayChips.textContent = chips;
  displayPot.textContent = pot;
}

function doubleDown() {
  newCardSoundFunc();

  if (pot > chips) {
    alertUser("You do not have enough chips to double down");
  } else {
    let bet = pot;
    chips -= bet;
    pot += bet;
    displayChips.textContent = chips;
    displayPot.textContent = pot;
    hitFunc();
    if (playIsOver === false) {
      standFunc();
    }
  }
}

//pulls n num of cards out of deck and adds to hand
function getCards(deck, numOfCards, reciever) {
  let result = [];

  for (x = 0; x < numOfCards; x++) {
    let index = Math.floor(Math.random() * Math.floor(deck.length));
    //push card at chosen index to newHand and remove from deck

    if (reciever === "player") {
      newHand = playerHand.concat(deck[index].value);
      playerHand = newHand;
    } else if (reciever === "house") {
      newHouseHand = houseHand.concat(deck[index].value);
      houseHand = newHouseHand;
    }

    result.push(String(deck[index].value) + deck[index].suit);

    //remove card from deck
    deck.splice(index, 1);
  }
  return result;
}

//define function that when called adds new card to player/house innerHMTL
function revealCard(newCard, reciever) {
  const html = `

     ${newCard}
    
    `;

  if (reciever === "player") {
    playerResult.innerHTML += html;
  } else if (reciever === "house") {
    houseResult.innerHTML += html;
  }
}

//adds new card to player hand
function hitFunc() {
  newCardSoundFunc();

  let card = getCards(deck, 1, "player");
  revealCard(card, "player");

  let score = sumHand(playerHand);
  doubleD.disabled = true;

  let result = hitResult(playerHand);
  showResult(result);

  if (score > 21 && !playerHand.includes("A")) {
    displayScore.textContent = score;
  } else {
    let Ascore = sumHandLowAce(playerHand);
    displayScore.textContent = Ascore;
  }
  if (playerHand.length > 4) {
    displayHouseScore.style.visibility = "visible";
  }
}

//this is where the winner is decided, the house will keep drawing until they have a score of 17 or more
function standFunc() {
  standSoundFunc();
  doubleD.disabled = true;

  while (sumHand(houseHand) < 17 && sumHand(houseHand) < 21) {
    let card = getCards(deck, 1, "house");
    revealCard(card, "house");

    let houseScore = sumHand(houseHand);
    displayHouseScore.textContent = houseScore;
  }

  let result = standResult(playerHand, houseHand);
  showResult(result);
}

function playOver() {
  if (chips > 0) {
    firstDraw.disabled = true;
    hit.disabled = true;
    stand.disabled = true;
    doubleD.disabled = true;
    nxtGame.disabled = false;
    houseResult.style.visibility = "visible";
    displayHouseScore.style.visibility = "visible";
    playIsOver = true;
  } else {
    restart.classList.remove("hide");
  }

  if (hands <= 1) {
    applauseSoundFunc();
    alertUser(`Game over! You leave with $${chips}`);
    writeScoreToMemory(chips);
    disableAll();
    restart.classList.remove("hide");
  }
}

function win() {
  winSoundFunc();
  root.style.setProperty("--main-bg-color", "#90EE90");
  firstDraw.disabled = true;
  chips += pot * 2;
  displayChips.textContent = chips;
  pot = 0;
  displayPot.textContent = pot;
}

function lose() {
  loseSoundFunc();
  root.style.setProperty("--main-bg-color", "#f48a8a");
  if (chips === 0) {
    alertUser("Game over! Click restart to play again");
    disableAll();
    gameOverSoundFunc();
  }
  displayChips.textContent = chips;
  pot = 0;
  displayPot.textContent = pot;
}

function draw() {
  loseSoundFunc();
  root.style.setProperty("--main-bg-color", "##d9d9d9");
  chips += pot;
  displayChips.textContent = chips;
  pot = 0;
  displayPot.textContent = pot;
  firstDraw.disabled = true;
}

function betPulseOn() {
  bet10P.classList.add("pulse");
  bet20P.classList.add("pulse");
  bet33P.classList.add("pulse");
  betAllP.classList.add("pulse");
}

function betPulseOff() {
  bet10P.classList.remove("pulse");
  bet20P.classList.remove("pulse");
  bet33P.classList.remove("pulse");
  betAllP.classList.remove("pulse");
}

function showResult(result) {
  switch (result) {
    case "House Wins":
      lose();
      break;
    case "Draw":
      draw();
      break;
    case "You win":
      win();
      break;
    case "BUST!":
      lose();
      break;
    case "House got blackJack!":
      lose();
      break;
    case "Holy moly! Five card trick!":
      win();
      break;
  }
  playOver();
  alertUser(result);
}

function alertUser(str) {
  userMessage.innerHTML = str;
}

function drawSoundFunc() {
  drawSound.play();
}

function newCardSoundFunc() {
  newCardSound.play();
}

function standSoundFunc() {
  standSound.play();
}

function chipSoundFunc() {
  chipSound.currentTime = 0;
  chipSound.play();
}

function winSoundFunc() {
  winSound.play();
}

function loseSoundFunc() {
  loseSound.play();
}

function gameOverSoundFunc() {
  gameOverSound.play();
}

function applauseSoundFunc() {
  applauseSound.play();
}

function clickSoundFunc() {
  clickSound.currentTime = 0;
  clickSound.play();
}

function disableAll() {
  betPulseOff();
  firstDraw.disabled = true;
  hit.disabled = true;
  stand.disabled = true;
  bet10P.disabled = true;
  bet20P.disabled = true;
  bet33P.disabled = true;
  betAllP.disabled = true;
  nxtGame.disabled = true;
}

function toggleSection(btnType) {
  backBtn.classList.remove("hide");
  if (btnType === "scoreboard") {
    hideableSection.classList.add("hide");
    scoreboardDisplay.classList.remove("hide");
    helpDisplay.classList.add("hide");
  } else if (btnType === "help") {
    hideableSection.classList.add("hide");
    scoreboardDisplay.classList.add("hide");
    helpDisplay.classList.remove("hide");
  } else if (btnType === "back") {
    backBtn.classList.add("hide");
    scoreboardDisplay.classList.add("hide");
    helpDisplay.classList.add("hide");
    hideableSection.classList.remove("hide");
  }
}

function writeScoreToMemory(score) {
  let currentHistory = JSON.parse(localStorage.getItem("storedHistory"));
  if (currentHistory) {
    currentHistory.push(score);
    localStorage.setItem("storedHistory", JSON.stringify(currentHistory));
    retrieveScores();
  } else {
    localStorage.setItem("storedHistory", JSON.stringify([score]));
    retrieveScores();
  }
}

function retrieveScores() {
  let currentHistory = JSON.parse(localStorage.getItem("storedHistory"));
  while (leaderboard.firstChild) {
    leaderboard.firstChild.remove();
  }

  if (currentHistory) {
    let sortedHistory = currentHistory.sort((a, b) => b - a);
    sortedHistory.forEach((score, index) => {
      let li = document.createElement("li");
      if (index === 0) {
        li.appendChild(document.createTextNode(`${score} (Personal best! 🔥)`));
      } else {
        li.appendChild(document.createTextNode(score));
      }
      leaderboard.appendChild(li);
    });
  } else {
    leaderboard.appendChild(
      document.createTextNode(
        "Complete 10 rounds of BlackJack with a score above 0 to record your score"
      )
    );
  }
}

/*
|--------------------------------------------------------------------------
| Event Listeners
|--------------------------------------------------------------------------
|
|
*/

//draws two cards for player and house and acts if blackjack present
firstDraw.addEventListener("click", () => {
  drawSoundFunc();
  alertUser("Hit, stand or double down?");
  hit.disabled = false;
  stand.disabled = false;
  bet10P.disabled = true;
  bet20P.disabled = true;
  bet33P.disabled = true;
  betAllP.disabled = true;
  nxtGame.disabled = true;
  doubleD.disabled = false;

  //turn off betting pulse
  betPulseOff();

  let cards = getCards(deck, 2, "player");
  revealCard(cards, "player");

  let score = sumHand(playerHand);
  displayScore.textContent = score;

  let houseCards = getCards(deck, 2, "house");
  revealCard(houseCards, "house");
  face.textContent = houseCards[0];

  let houseScore = sumHand(houseHand);
  displayHouseScore.textContent = houseScore;

  firstDraw.disabled = true;

  if (score === 21 && houseScore === 21) {
    alertUser("Both House and player have BlackJack!");
    draw();
    playOver();
  } else if (score === 21) {
    alertUser("You got BlackJack!");
    win();
    playOver();
  } else if (playerHand.includes("A") && sumHand(playerHand) === 22) {
    //player has foolishly chosen to stand on pocket Aces
    let pocketAces = sumHandLowAce(playerHand);
    displayScore.textContent = pocketAces;
  }
});

//draws one card for player
hit.addEventListener("click", () => {
  hitFunc();
});

//make a stand, house must draw unless over 17
stand.addEventListener("click", () => {
  standFunc();
});

//clears and resets for next game
nxtGame.addEventListener("click", () => {
  //resets deck
  init();

  hands -= 1;
  displayRemaining.textContent = hands;
  playIsOver = false;

  playerResult.innerHTML = "";
  houseResult.style.visibility = "hidden";
  face.textContent = "";
  houseResult.innerHTML = "";

  playerHand = [];
  houseHand = [];

  displayScore.textContent = 0;
  displayHouseScore.textContent = 0;
  displayHouseScore.style.visibility = "hidden";
  root.style.setProperty("--main-bg-color", "#bfdff6");

  firstDraw.disabled = true;
  hit.disabled = true;
  stand.disabled = true;
  bet10P.disabled = false;
  bet20P.disabled = false;
  bet33P.disabled = false;
  betAllP.disabled = false;
  nxtGame.disabled = true;
  betPulseOn();
  alertUser("Place your bet to start");
});

restart.addEventListener("click", () => {
  location.reload();
});

scoreboard.addEventListener("click", () => {
  clickSoundFunc();
  toggleSection("scoreboard");
});

help.addEventListener("click", () => {
  clickSoundFunc();
  toggleSection("help");
});

backBtn.addEventListener("click", () => {
  clickSoundFunc();
  toggleSection("back");
});

//betting buttons
bet10P.addEventListener("click", () => {
  // bet10();
  placeBet("bet10");
  firstDraw.disabled = false;
});

bet20P.addEventListener("click", () => {
  placeBet("bet20");
  firstDraw.disabled = false;
});

bet33P.addEventListener("click", () => {
  placeBet("bet33");
  firstDraw.disabled = false;
});

betAllP.addEventListener("click", () => {
  placeBet("betAll");
  firstDraw.disabled = false;
});

doubleD.addEventListener("click", () => {
  firstDraw.disabled = false;
  doubleDown();
});

document.addEventListener("keydown", (event) => {
  let hotBtn = "";

  switch (event.key) {
    case "1":
      hotBtn = bet10P;
      break;
    case "2":
      hotBtn = bet20P;
      break;
    case "3":
      hotBtn = bet33P;
      break;
    case "4":
      hotBtn = betAllP;
      break;
    case "5":
      hotBtn = doubleD;
      break;
    case "d":
      hotBtn = firstDraw;
      break;
    case "h":
      hotBtn = hit;
      break;
    case "s":
      hotBtn = stand;
      break;
    case "n":
      hotBtn = nxtGame;
      break;
  }

  if (event.ctrlKey) {
    try {
      hotBtn.click();
      hotBtn.classList.add("flash");
      window.setTimeout(() => {
        hotBtn.classList.remove("flash");
      }, 200);
    } catch {
      console.log("invalid key press");
    }
  }
});
