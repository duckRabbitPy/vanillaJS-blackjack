//get DOM elements
const root = document.querySelector(":root") as HTMLElement;
const landingForm = document.querySelector(".landing-form") as HTMLFormElement;
const userSubmitBtn = document.querySelector(
  "#username_submit"
) as HTMLFormElement;
const displaycurrUser = document.querySelector("#curr_user") as HTMLElement;
const userInput = document.querySelector("#username_input") as HTMLFormElement;
const playerResult = document.querySelector(".playerList") as HTMLElement;
const houseResult = document.querySelector(".houseList") as HTMLElement;
const face = document.getElementById("face") as HTMLElement;
const userMessage = document.getElementById("user-message") as HTMLElement;

let help = document.getElementById("help") as HTMLElement;
let helpDisplay = document.getElementById("help_info") as HTMLElement;
let scoreboard = document.getElementById("scoreboard") as HTMLElement;
let scoreboardDisplay = document.getElementById(
  "scoreboard_info"
) as HTMLElement;
let localLeaderboard = document.getElementById(
  "localLeaderboard"
) as HTMLElement;
let publicLeaderboard = document.getElementById(
  "publicLeaderboard"
) as HTMLElement;
let backBtn = document.getElementById("back_btn") as HTMLElement;

let displayChips = document.getElementById("chips") as HTMLElement;
let displayPot = document.getElementById("pot") as HTMLElement;
let displayScore = document.getElementById("score") as HTMLElement;
let displayHouseScore = document.getElementById("houseScore") as HTMLElement;
let displayRemaining = document.getElementById("hands") as HTMLElement;

const firstDraw = document.querySelector(".draw2") as HTMLButtonElement;
const hit = document.querySelector(".draw1") as HTMLButtonElement;
const stand = document.querySelector(".stand") as HTMLButtonElement;
const doubleD = document.querySelector(".doubleD") as HTMLButtonElement;
const nxtGame = document.querySelector(".replay") as HTMLButtonElement;
const restart = document.querySelector(".restart") as HTMLButtonElement;

const bet10P = document.querySelector(".bet10P") as HTMLButtonElement;
const bet20P = document.querySelector(".bet20P") as HTMLButtonElement;
const bet33P = document.querySelector(".bet33P") as HTMLButtonElement;
const betAllP = document.querySelector(".betAllP") as HTMLButtonElement;

const drawSound = document.querySelector(".drawCardSound") as HTMLAudioElement;
const newCardSound = document.querySelector(
  ".newCardSound"
) as HTMLAudioElement;
const standSound = document.querySelector(".standSound") as HTMLAudioElement;
const chipSound = document.querySelector(".chipSound") as HTMLAudioElement;
const winSound = document.querySelector(".winSound") as HTMLAudioElement;
const loseSound = document.querySelector(".loseSound") as HTMLAudioElement;
const gameOverSound = document.querySelector(
  ".gameOverSound"
) as HTMLAudioElement;
const applauseSound = document.querySelector(
  ".applauseSound"
) as HTMLAudioElement;
const clickSound = document.querySelector(".clickSound") as HTMLAudioElement;
const hideableSection = document.querySelector(
  ".toggle-section"
) as HTMLElement;

/*
|--------------------------------------------------------------------------
| Game setup
|--------------------------------------------------------------------------
|
|
*/

//retrieve top scores and usernames from local
retrieveUserName();
retrieveScores();
collectPublicScores();

//set up global variables
let deck: { suit: string; value: string | number }[] = [];
let playerHand: (string | number)[] = [];
let houseHand: (string | number)[] = [];
let chips: number = 500;
let pot: number = 0;
let hands: number = 10;

//display starter chips and hands
//non-null assertion operator to suppress TS concerns that element might be null
displayChips!.textContent = String(chips);
displayRemaining!.textContent = String(hands);

//disable all but betting buttons, initiate button pulse animation
hit!.disabled = true;
stand!.disabled = true;
nxtGame!.disabled = true;
doubleD!.disabled = true;
firstDraw!.disabled = true;
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

function placeBet(amount: string) {
  //default is bet 10
  let divisor = 10;
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
  displayChips!.textContent = String(chips);
  displayPot!.textContent = String(pot);
}

function doubleDown() {
  newCardSoundFunc();

  if (pot > chips) {
    alertUser("You do not have enough chips to double down");
  } else {
    let bet = pot;
    chips -= bet;
    pot += bet;
    displayChips!.textContent = String(chips);
    displayPot!.textContent = String(pot);
    hitFunc();
    standFunc();
  }
}

//pulls n num of cards out of deck and adds to hand
function getCards(
  deck: { suit: string; value: string | number }[],
  numOfCards: number,
  reciever: "player" | "house"
) {
  let result = [];

  for (let x = 0; x < numOfCards; x++) {
    let index = Math.floor(Math.random() * Math.floor(deck.length));
    //push card at chosen index to newHand and remove from deck

    if (reciever === "player") {
      let newHand = playerHand.concat(deck[index].value);
      playerHand = newHand;
    } else if (reciever === "house") {
      let newHouseHand = houseHand.concat(deck[index].value);
      houseHand = newHouseHand;
    }

    result.push(String(deck[index].value) + deck[index].suit);

    //remove card from deck
    deck.splice(index, 1);
  }
  return result;
}

//define function that when called adds new card to player/house innerHMTL
function revealCard(
  newCard: string | number | (string | number)[],
  reciever: "player" | "house"
) {
  const html = `

     ${newCard}
    
    `;

  if (reciever === "player") {
    playerResult!.innerHTML += html;
  } else if (reciever === "house") {
    houseResult!.innerHTML += html;
  }
}

//adds new card to player hand
function hitFunc() {
  newCardSoundFunc();

  let card = getCards(deck, 1, "player");
  revealCard(card, "player");

  let score = sumHand(playerHand);
  doubleD!.disabled = true;

  let result = hitResult(playerHand);
  showResult(result);

  if (score > 21 && !playerHand.includes("A")) {
    displayScore!.textContent = String(score);
  } else {
    let Ascore = sumHandLowAce(playerHand);
    displayScore!.textContent = String(Ascore);
  }
  if (playerHand.length > 4) {
    displayHouseScore!.style.visibility = "visible";
  }
}

//this is where the winner is decided, the house will keep drawing until they have a score of 17 or more
function standFunc() {
  standSoundFunc();
  doubleD!.disabled = true;

  while (
    sumHand(houseHand) < 17 ||
    (sumHand(houseHand) > 21 &&
      sumHandLowAce(houseHand) < 17 &&
      (sumHand(houseHand) < 21 || sumHandLowAce(houseHand) < 21))
  ) {
    let card = getCards(deck, 1, "house");
    revealCard(card, "house");
  }
  let houseScore = sumHand(houseHand);
  if (houseScore > 21 && !houseHand.includes("A")) {
    displayScore!.textContent = String(houseScore);
  } else {
    let Ascore = sumHandLowAce(houseHand);
    displayScore!.textContent = String(Ascore);
  }

  let result = standResult(playerHand, houseHand);
  showResult(result);
}

function playOver() {
  if (chips > 0) {
    firstDraw!.disabled = true;
    hit!.disabled = true;
    stand!.disabled = true;
    doubleD!.disabled = true;
    nxtGame!.disabled = false;
    houseResult!.style.visibility = "visible";
    displayHouseScore!.style.visibility = "visible";
  } else {
    houseResult!.style.visibility = "visible";
    displayHouseScore!.style.visibility = "visible";
    restart!.classList.remove("hide");
  }

  if (hands <= 1) {
    applauseSoundFunc();
    alertUser(`Game over! You leave with $${chips}`);
    writeScoreToMemory(chips);
    savePublicScore(chips);
    disableAll();
    restart!.classList.remove("hide");
  }
}

function win() {
  chips += pot * 2;
  playOver();
  winSoundFunc();
  root!.style.setProperty("--main-bg-color", "#90EE90");
  firstDraw!.disabled = true;
  displayChips!.textContent = String(chips);
  pot = 0;
  displayPot!.textContent = String(pot);
}

function lose() {
  playOver();
  loseSoundFunc();
  root!.style.setProperty("--main-bg-color", "#f48a8a");
  if (chips === 0) {
    alertUser("Game over! Click restart to play again");
    disableAll();
    gameOverSoundFunc();
  }
  displayChips!.textContent = String(chips);
  pot = 0;
  displayPot!.textContent = String(pot);
}

function draw() {
  chips += pot;
  pot = 0;
  playOver();
  loseSoundFunc();
  root!.style.setProperty("--main-bg-color", "##d9d9d9");
  displayChips!.textContent = String(chips);
  displayPot!.textContent = String(pot);
  firstDraw!.disabled = true;
}

function betPulseOn() {
  bet10P!.classList.add("pulse");
  bet20P!.classList.add("pulse");
  bet33P!.classList.add("pulse");
  betAllP!.classList.add("pulse");
}

function betPulseOff() {
  bet10P!.classList.remove("pulse");
  bet20P!.classList.remove("pulse");
  bet33P!.classList.remove("pulse");
  betAllP!.classList.remove("pulse");
}

function showResult(result: string) {
  alertUser(result);
  switch (result) {
    case "House wins":
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
}

function alertUser(str: string) {
  userMessage!.innerHTML = str;
}

function drawSoundFunc() {
  drawSound!.play();
}

function newCardSoundFunc() {
  newCardSound!.play();
}

function standSoundFunc() {
  standSound!.play();
}

function chipSoundFunc() {
  chipSound!.currentTime = 0;
  chipSound!.play();
}

function winSoundFunc() {
  winSound!.play();
}

function loseSoundFunc() {
  loseSound!.play();
}

function gameOverSoundFunc() {
  gameOverSound!.play();
}

function applauseSoundFunc() {
  applauseSound!.play();
}

function clickSoundFunc() {
  clickSound!.currentTime = 0;
  clickSound!.play();
}

function disableAll() {
  betPulseOff();
  firstDraw!.disabled = true;
  hit!.disabled = true;
  stand!.disabled = true;
  bet10P!.disabled = true;
  bet20P!.disabled = true;
  bet33P!.disabled = true;
  betAllP!.disabled = true;
  nxtGame!.disabled = true;
}

function toggleSection(btnType: string) {
  backBtn!.classList.remove("hide");
  if (btnType === "scoreboard") {
    hideableSection!.classList.add("hide");
    scoreboardDisplay!.classList.remove("hide");
    helpDisplay!.classList.add("hide");
  } else if (btnType === "help") {
    hideableSection!.classList.add("hide");
    scoreboardDisplay!.classList.add("hide");
    helpDisplay!.classList.remove("hide");
  } else if (btnType === "back") {
    backBtn!.classList.add("hide");
    scoreboardDisplay!.classList.add("hide");
    helpDisplay!.classList.add("hide");
    hideableSection!.classList.remove("hide");
  }
}

function retrieveUserName() {
  let storedUser = localStorage.getItem("storedUser");
  if (storedUser) {
    landingForm.classList.add("hide");
    toggleSection("back");
    displaycurrUser.innerHTML = `User: ${storedUser}`;
  }
}

function writeScoreToMemory(score: number) {
  let currentHistory: number[] = [];
  let stored = localStorage.getItem("storedHistory");
  if (stored) {
    currentHistory = JSON.parse(stored);
  }
  if (currentHistory.length > 0) {
    currentHistory.push(score);
    localStorage.setItem("storedHistory", JSON.stringify(currentHistory));
    retrieveScores();
  } else {
    localStorage.setItem("storedHistory", JSON.stringify([score]));
    retrieveScores();
  }
}

function retrieveScores() {
  let currentHistory: number[] = [];
  let stored = localStorage.getItem("storedHistory");
  if (stored) {
    currentHistory = JSON.parse(stored);
  }
  while (localLeaderboard!.firstChild) {
    localLeaderboard!.firstChild.remove();
  }

  if (currentHistory.length > 0) {
    let sortedHistory = currentHistory.sort((a: number, b: number) => b - a);
    sortedHistory = sortedHistory.slice(0, 10);
    sortedHistory.forEach((score: number, index: number) => {
      let li = document.createElement("li");
      if (index === 0) {
        li.appendChild(document.createTextNode(`${score} (Personal best! 🔥)`));
      } else {
        li.appendChild(document.createTextNode(String(score)));
      }
      localLeaderboard!.appendChild(li);
    });
  } else {
    localLeaderboard!.appendChild(
      document.createTextNode(
        "Complete 10 rounds of BlackJack with a score above 0 to record your score"
      )
    );
  }
}

function savePublicScore(finalChips: number) {
  let storedUser = localStorage.getItem("storedUser");
  if (storedUser === null) {
    storedUser = "Anon;";
  }
  let newObj = { username: storedUser, score: finalChips };
  fetch(
    `https://fir-backend-a73fc-default-rtdb.firebaseio.com/Blackjack.json`,
    {
      method: "POST",
      body: JSON.stringify(newObj),
      headers: { "Content-Type": "application/json" },
    }
  )
    .then((res) => {
      if (!res.ok) {
        throw new Error("Put request failed");
      }
      collectPublicScores();
    })
    .catch((err) => {
      console.log(err);
    });
}

function collectPublicScores() {
  //GET is default if not specified
  interface ScoreObj {
    score: number;
    username: string;
  }
  while (publicLeaderboard!.firstChild) {
    publicLeaderboard!.firstChild.remove();
  }
  fetch(`https://fir-backend-a73fc-default-rtdb.firebaseio.com/Blackjack.json`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Get request failed");
      }
      return res.json();
    })
    .then((data: { uid: ScoreObj }) => {
      let savedScores = Object.values(data);

      let orderedScores = savedScores.sort((a, b) =>
        a.score > b.score ? -1 : 1
      );
      orderedScores = orderedScores.slice(0, 10);
      orderedScores.forEach((obj, index) => {
        let li = document.createElement("li");
        if (index === 0) {
          li.appendChild(
            document.createTextNode(
              `${obj.score}: ${obj.username} (the GOAT! 🐐👑)`
            )
          );
        } else {
          li.appendChild(
            document.createTextNode(`${String(obj.score)}: ${obj.username}`)
          );
        }
        publicLeaderboard!.appendChild(li);
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

/*
|--------------------------------------------------------------------------
| Event Listeners
|--------------------------------------------------------------------------
|
|
*/

userSubmitBtn!.addEventListener("click", (event) => {
  event.preventDefault();
  const currentUser = userInput.value;
  if (currentUser.length > 0) {
    landingForm.classList.add("hide");
    toggleSection("back");
    displaycurrUser.innerHTML = `User: ${currentUser}`;
    localStorage.setItem("storedUser", currentUser);
  }
});

//draws two cards for player and house and acts if blackjack present
firstDraw!.addEventListener("click", () => {
  drawSoundFunc();
  alertUser("Hit, stand or double down?");
  hit!.disabled = false;
  stand!.disabled = false;
  bet10P!.disabled = true;
  bet20P!.disabled = true;
  bet33P!.disabled = true;
  betAllP!.disabled = true;
  nxtGame!.disabled = true;
  doubleD!.disabled = false;

  //turn off betting pulse
  betPulseOff();

  let cards = getCards(deck, 2, "player");
  revealCard(cards, "player");

  let score = sumHand(playerHand);
  displayScore!.textContent = String(score);

  let houseCards = getCards(deck, 2, "house");
  revealCard(houseCards, "house");
  face!.textContent = houseCards[0];

  let houseScore = sumHand(houseHand);
  displayHouseScore!.textContent = String(houseScore);

  firstDraw!.disabled = true;

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
    displayScore!.textContent = String(pocketAces);
  }
});

//draws one card for player
hit!.addEventListener("click", () => {
  hitFunc();
});

//make a stand, house must draw unless over 17
stand!.addEventListener("click", () => {
  standFunc();
});

//clears and resets for next game
nxtGame!.addEventListener("click", () => {
  //resets deck
  init();

  hands -= 1;
  displayRemaining!.textContent = String(hands);

  playerResult!.innerHTML = "";
  houseResult!.style.visibility = "hidden";
  face!.textContent = "";
  houseResult!.innerHTML = "";

  playerHand = [];
  houseHand = [];

  displayScore!.textContent = "0";
  displayHouseScore!.textContent = "0";
  displayHouseScore!.style.visibility = "hidden";
  root!.style.setProperty("--main-bg-color", "#bfdff6");

  firstDraw!.disabled = true;
  hit!.disabled = true;
  stand!.disabled = true;
  bet10P!.disabled = false;
  bet20P!.disabled = false;
  bet33P!.disabled = false;
  betAllP!.disabled = false;
  nxtGame!.disabled = true;
  betPulseOn();
  alertUser("Place your bet to start");
});

restart!.addEventListener("click", () => {
  window.location.reload();
});

scoreboard!.addEventListener("click", () => {
  clickSoundFunc();
  toggleSection("scoreboard");
});

help!.addEventListener("click", () => {
  clickSoundFunc();
  toggleSection("help");
});

backBtn!.addEventListener("click", () => {
  clickSoundFunc();
  toggleSection("back");
});

//betting buttons
bet10P!.addEventListener("click", () => {
  // bet10();
  placeBet("bet10");
  firstDraw!.disabled = false;
});

bet20P!.addEventListener("click", () => {
  placeBet("bet20");
  firstDraw!.disabled = false;
});

bet33P!.addEventListener("click", () => {
  placeBet("bet33");
  firstDraw!.disabled = false;
});

betAllP!.addEventListener("click", () => {
  placeBet("betAll");
  firstDraw!.disabled = false;
});

doubleD!.addEventListener("click", () => {
  firstDraw!.disabled = false;
  doubleDown();
});

document.addEventListener("keydown", (event) => {
  let hotBtn: HTMLElement = bet10P;

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

  if (event.ctrlKey && hotBtn) {
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
