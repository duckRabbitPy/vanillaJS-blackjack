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
| Event Listeners
|--------------------------------------------------------------------------
|
|
*/

//accepts string input for username
userSubmitBtn!.addEventListener("click", (event) => {
  event.preventDefault();
  const currentUser = userInput.value.trim();
  if (currentUser.length > 0) {
    landingForm.classList.add("hide");
    backBtn.style.display = "inline";
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
  let hotBtn: any;

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
