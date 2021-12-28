"use strict";
//get DOM elements
const root = document.querySelector(":root");
const landingForm = document.querySelector(".landing-form");
const userSubmitBtn = document.querySelector("#username_submit");
const displaycurrUser = document.querySelector("#curr_user");
const userInput = document.querySelector("#username_input");
const playerResult = document.querySelector(".playerList");
const houseResult = document.querySelector(".houseList");
const face = document.getElementById("face");
const userMessage = document.getElementById("user-message");
let help = document.getElementById("help");
let helpDisplay = document.getElementById("help_info");
let scoreboard = document.getElementById("scoreboard");
let scoreboardDisplay = document.getElementById("scoreboard_info");
let localLeaderboard = document.getElementById("localLeaderboard");
let publicLeaderboard = document.getElementById("publicLeaderboard");
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
const hideableSection = document.querySelector(".toggle-section");
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
let deck = [];
let playerHand = [];
let houseHand = [];
let chips = 500;
let pot = 0;
let hands = 10;
//display starter chips and hands
//non-null assertion operator to suppress TS concerns that element might be null
displayChips.textContent = String(chips);
displayRemaining.textContent = String(hands);
//disable all but betting buttons, initiate button pulse animation
hit.disabled = true;
stand.disabled = true;
nxtGame.disabled = true;
doubleD.disabled = true;
firstDraw.disabled = true;
betPulseOn();
/*
|--------------------------------------------------------------------------
| Event Listeners
|--------------------------------------------------------------------------
|
|
*/
//accepts string input for username
userSubmitBtn.addEventListener("click", (event) => {
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
    displayScore.textContent = String(score);
    let houseCards = getCards(deck, 2, "house");
    revealCard(houseCards, "house");
    face.textContent = houseCards[0];
    let houseScore = sumHand(houseHand);
    displayHouseScore.textContent = String(houseScore);
    firstDraw.disabled = true;
    if (score === 21 && houseScore === 21) {
        alertUser("Both House and player have BlackJack!");
        draw();
        playOver();
    }
    else if (score === 21) {
        alertUser("You got BlackJack!");
        win();
        playOver();
    }
    else if (playerHand.includes("A") && sumHand(playerHand) === 22) {
        //player has foolishly chosen to stand on pocket Aces
        let pocketAces = sumHandLowAce(playerHand);
        displayScore.textContent = String(pocketAces);
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
    displayRemaining.textContent = String(hands);
    playerResult.innerHTML = "";
    houseResult.style.visibility = "hidden";
    face.textContent = "";
    houseResult.innerHTML = "";
    playerHand = [];
    houseHand = [];
    displayScore.textContent = "0";
    displayHouseScore.textContent = "0";
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
    window.location.reload();
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
    let hotBtn;
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
        }
        catch (_a) {
            console.log("invalid key press");
        }
    }
});
