const playerResult = document.querySelector(".playerList");
const houseResult = document.querySelector(".houseList");
const face = document.getElementById("face");

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

const stylebox = document.querySelector("body");

let deck = [];

let playerHand = [];
let houseHand = [];
let chips = 500;
let pot = 0;
let hands = 10;
let playIsOver = false;

//starter chips and hands
displayChips.textContent = chips;
displayRemaining.textContent = hands;

//disable all but betting buttons
hit.disabled = true;
stand.disabled = true;
nxtGame.disabled = true;
doubleD.disabled = true;
firstDraw.disabled = true;

//by default house cards and score hidden
houseResult.style.visibility = "hidden";
displayHouseScore.style.visibility = "hidden";

//Get the JSON out of local and into a nice format
function loadJSON(callback) {
  let xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open("GET", "/deck.json", true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
}

//fire off the loadJSON function and set/reset the Deck
function init() {
  loadJSON(function (response) {
    const actual_JSON = JSON.parse(response);
    deck = actual_JSON;
  });
}

//adds new card to player/house innerHMTL
const revealCard = function (newCard, reciever) {
  const html = `

     ${newCard}
    
    `;

  if (reciever === "player") {
    playerResult.innerHTML += html;
  } else if (reciever === "house") {
    houseResult.innerHTML += html;
  }
};

//draws two cards for each
firstDraw.addEventListener("click", () => {
  drawSoundFunc();
  hit.disabled = false;
  stand.disabled = false;
  bet10P.disabled = true;
  bet20P.disabled = true;
  bet33P.disabled = true;
  betAllP.disabled = true;
  nxtGame.disabled = true;
  doubleD.disabled = false;

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
    alert("Both House and player have BlackJack!");
    draw();
    playOver();
  } else if (score === 21) {
    alert("You got BlackJack!");
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
  stylebox.style.backgroundColor = "aliceblue";

  firstDraw.disabled = true;
  hit.disabled = true;
  stand.disabled = true;
  bet10P.disabled = false;
  bet20P.disabled = false;
  bet33P.disabled = false;
  betAllP.disabled = false;
  nxtGame.disabled = true;
});

//betting buttons
bet10P.addEventListener("click", () => {
  bet10();
  firstDraw.disabled = false;
});

bet20P.addEventListener("click", () => {
  bet20();
  firstDraw.disabled = false;
});

bet33P.addEventListener("click", () => {
  bet33();
  firstDraw.disabled = false;
});

betAllP.addEventListener("click", () => {
  betAll();
  firstDraw.disabled = false;
});

doubleD.addEventListener("click", () => {
  firstDraw.disabled = false;
  doubleDown();
});

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

//adds up value of hand
function sumHand(hand) {
  total = 0;

  for (x = 0; x < hand.length; x++) {
    if (typeof hand[x] === "number") {
      total += hand[x];
    } else {
      switch (hand[x]) {
        case "A":
          total += 11;
          break;
        case "K":
          total += 10;
          break;
        case "Q":
          total += 10;
          break;
        case "J":
          total += 10;
          break;
      }
    }
  }
  return total;
}

function sumHandLowAce(hand) {
  total = 0;

  for (x = 0; x < hand.length; x++) {
    if (typeof hand[x] === "number") {
      total += hand[x];
    } else {
      switch (hand[x]) {
        case "A":
          total += 1;
          break;
        case "K":
          total += 10;
          break;
        case "Q":
          total += 10;
          break;
        case "J":
          total += 10;
          break;
      }
    }
  }
  return total;
}

function hitFunc() {
  newCardSoundFunc();

  let card = getCards(deck, 1, "player");
  revealCard(card, "player");

  let score = sumHand(playerHand);
  doubleD.disabled = true;

  if (score > 21 && !playerHand.includes("A")) {
    displayScore.textContent = score;
    alert("BUST!");
    lose();
    playOver();
  } else {
    let Ascore = sumHandLowAce(playerHand);
    displayScore.textContent = Ascore;
    if (Ascore > 21) {
      alert("BUST!");
      lose();
      playOver();
    } else if (playerHand.length > 4) {
      displayHouseScore.style.visibility = "visible";
      alert("Holy moly! Five card trick!");
      win();
      playOver();
    }
  }
}

function standFunc() {
  standSoundFunc();
  displayScore.style.backgroundColor = "lightgreen";
  displayHouseScore.style.backgroundColor = "lightyellow";
  doubleD.disabled = true;

  if (playerHand.includes("A") && sumHand(playerHand) === 22) {
    //player has foolishly chosen to stand on pocket Aces
    lose();
    playOver();
    alert("House Wins");
  } else {
    while (sumHand(houseHand) < 17 && sumHand(houseHand) < 21) {
      let card = getCards(deck, 1, "house");
      revealCard(card, "house");

      let houseScore = sumHand(houseHand);
      displayHouseScore.textContent = houseScore;
    }

    //set low ace score
    let lowScore = sumHandLowAce(houseHand);

    //if house hand is over 21
    if (sumHand(houseHand) > 21) {
      //if hand has an ace
      if (houseHand.includes("A")) {
        //keep drawing till 17 or above and lower than 22
        while (lowScore < 17 && lowScore < 22) {
          let card = getCards(deck, 1, "house");
          revealCard(card, "house");
          lowScore = sumHandLowAce(houseHand);
        }

        if (lowScore > 21) {
          let lowhouseScore = sumHandLowAce(houseHand);
          displayHouseScore.textContent = lowhouseScore;
          alert("House bust, you win!");
          win();
          playOver();
        }

        //if ace low house hand higher than player hand, house wins
        else if (lowScore > sumHand(playerHand)) {
          let lowhouseScore = sumHandLowAce(houseHand);
          displayHouseScore.textContent = lowhouseScore;
          alert("House Wins");
          lose();
          playOver();

          //if ace low house hand lower than player hand, player wins
        } else if (lowScore < sumHand(playerHand)) {
          let lowhouseScore = sumHandLowAce(houseHand);
          displayHouseScore.textContent = lowhouseScore;
          alert("Player Wins!");
          win();
          playOver();
        }
      } else {
        //no aces and over 21 so house bust
        alert("House bust, you win!");
        win();
        playOver();
      }
    }

    //if house has higher hand than player (and house is under 21)
    else if (sumHand(houseHand) > sumHand(playerHand)) {
      alert("House Wins!");
      lose();
      playOver();
    }
    //else if house has lower hand than player:
    else if (sumHand(houseHand) < sumHand(playerHand)) {
      let score = sumHand(playerHand);
      let Ascore = sumHandLowAce(playerHand);

      //failsafe check to make sure player is bust if over 21 without aces
      if (score > 21 && !playerHand.includes("A")) {
        displayScore.textContent = score;
        alert("BUST!");
        lose();
        playOver();
      }
      //player hand wins if has low aces and greater than househand
      else if (Ascore < 22 && Ascore > sumHand(houseHand)) {
        alert("You Win!");
        win();
        playOver();
      }
      //player loses if has low aces and lower than househand
      else if (Ascore < 22 && Ascore < sumHand(houseHand)) {
        alert("House Wins!");
        lose();
        playOver();
      }
      // if there is a draw but house has blackJack
    } else if (
      sumHand(houseHand) === 21 &&
      houseHand.length === 2 &&
      playerHand.length !== 2
    ) {
      alert("House got blackJack!");
      lose();
      playOver();
      //else must be a draw
    } else {
      alert("draw");
      draw();
      playOver();
    }
  }
}

function bet10() {
  chipSoundFunc();
  let bet = Math.floor(chips / 10);
  chips -= bet;
  pot += bet;
  displayChips.textContent = chips;
  displayPot.textContent = pot;
}

function bet20() {
  chipSoundFunc();
  let bet = Math.floor(chips / 5);
  chips -= bet;
  pot += bet;
  displayChips.textContent = chips;
  displayPot.textContent = pot;
}

function bet33() {
  chipSoundFunc();
  let bet = Math.floor(chips / 3);
  chips -= bet;
  pot += bet;
  displayChips.textContent = chips;
  displayPot.textContent = pot;
}

function betAll() {
  chipSoundFunc();
  let bet = chips;
  chips -= bet;
  pot += bet;
  displayChips.textContent = chips;
  displayPot.textContent = pot;
}

function doubleDown() {
  newCardSoundFunc();

  if (pot > chips) {
    alert("You do not have enough chips to double down");
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

function playOver() {
  firstDraw.disabled = true;
  hit.disabled = true;
  stand.disabled = true;
  doubleD.disabled = true;
  nxtGame.disabled = false;
  houseResult.style.visibility = "visible";
  displayHouseScore.style.visibility = "visible";
  playIsOver = true;

  if (hands <= 1) {
    applauseSoundFunc();
    alert(`Game over! You leave with $${chips}`);
    disableAll();
  }
}

function win() {
  winSoundFunc();
  stylebox.style.backgroundColor = "#e6ffcc";
  firstDraw.disabled = true;
  chips += pot * 2;
  displayChips.textContent = chips;
  pot = 0;
  displayPot.textContent = pot;
}

function lose() {
  loseSoundFunc();
  stylebox.style.backgroundColor = "#ffcccc";
  if (chips === 0) {
    alert("Game over! Refresh page to play again");
    gameOverSoundFunc();
    disableAll();
  }
  displayChips.textContent = chips;
  pot = 0;
  displayPot.textContent = pot;
}

function draw() {
  loseSoundFunc();
  stylebox.style.backgroundColor = " #d9d9d9";
  chips += pot;
  displayChips.textContent = chips;
  pot = 0;
  displayPot.textContent = pot;
  firstDraw.disabled = true;
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

function disableAll() {
  firstDraw.disabled = true;
  hit.disabled = true;
  stand.disabled = true;
  bet10P.disabled = true;
  bet20P.disabled = true;
  bet33P.disabled = true;
  betAllP.disabled = true;
  nxtGame.disabled = true;
}
