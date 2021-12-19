//get DOM elements
var root = document.querySelector(":root");
var playerResult = document.querySelector(".playerList");
var houseResult = document.querySelector(".houseList");
var face = document.getElementById("face");
var userMessage = document.getElementById("user-message");
var help = document.getElementById("help");
var helpDisplay = document.getElementById("help_info");
var scoreboard = document.getElementById("scoreboard");
var scoreboardDisplay = document.getElementById("scoreboard_info");
var leaderboard = document.getElementById("leaderboard");
var backBtn = document.getElementById("back_btn");
var displayChips = document.getElementById("chips");
var displayPot = document.getElementById("pot");
var displayScore = document.getElementById("score");
var displayHouseScore = document.getElementById("houseScore");
var displayRemaining = document.getElementById("hands");
var firstDraw = document.querySelector(".draw2");
var hit = document.querySelector(".draw1");
var stand = document.querySelector(".stand");
var doubleD = document.querySelector(".doubleD");
var nxtGame = document.querySelector(".replay");
var restart = document.querySelector(".restart");
var bet10P = document.querySelector(".bet10P");
var bet20P = document.querySelector(".bet20P");
var bet33P = document.querySelector(".bet33P");
var betAllP = document.querySelector(".betAllP");
var drawSound = document.querySelector(".drawCardSound");
var newCardSound = document.querySelector(".newCardSound");
var standSound = document.querySelector(".standSound");
var chipSound = document.querySelector(".chipSound");
var winSound = document.querySelector(".winSound");
var loseSound = document.querySelector(".loseSound");
var gameOverSound = document.querySelector(".gameOverSound");
var applauseSound = document.querySelector(".applauseSound");
var clickSound = document.querySelector(".clickSound");
var stylebox = document.querySelector("body");
var hideableSection = document.querySelector(".toggle-section");
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
var deck = [];
var playerHand = [];
var houseHand = [];
var chips = 500;
var pot = 0;
var hands = 10;
var playIsOver = false;
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
| Function declarations
|--------------------------------------------------------------------------
|
|
*/
//init gets JSON Deck of cards out of local to creates/resets the deck
function init() {
    fetch("/deck.json")
        .then(function (response) { return response.json(); })
        .then(function (cards) {
        deck = cards;
    });
}
function placeBet(amount) {
    //default is bet 10
    var divisor = 10;
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
    var bet = Math.floor(chips / divisor);
    chipSoundFunc();
    chips -= bet;
    pot += bet;
    displayChips.textContent = String(chips);
    displayPot.textContent = String(pot);
}
function doubleDown() {
    newCardSoundFunc();
    if (pot > chips) {
        alertUser("You do not have enough chips to double down");
    }
    else {
        var bet = pot;
        chips -= bet;
        pot += bet;
        displayChips.textContent = String(chips);
        displayPot.textContent = String(pot);
        hitFunc();
        standFunc();
    }
}
//pulls n num of cards out of deck and adds to hand
function getCards(deck, numOfCards, reciever) {
    var result = [];
    for (var x = 0; x < numOfCards; x++) {
        var index = Math.floor(Math.random() * Math.floor(deck.length));
        //push card at chosen index to newHand and remove from deck
        if (reciever === "player") {
            var newHand = playerHand.concat(deck[index].value);
            playerHand = newHand;
        }
        else if (reciever === "house") {
            var newHouseHand = houseHand.concat(deck[index].value);
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
    var html = "\n\n     ".concat(newCard, "\n    \n    ");
    if (reciever === "player") {
        playerResult.innerHTML += html;
    }
    else if (reciever === "house") {
        houseResult.innerHTML += html;
    }
}
//adds new card to player hand
function hitFunc() {
    newCardSoundFunc();
    var card = getCards(deck, 1, "player");
    revealCard(card, "player");
    var score = sumHand(playerHand);
    doubleD.disabled = true;
    var result = hitResult(playerHand);
    showResult(result);
    if (score > 21 && !playerHand.includes("A")) {
        displayScore.textContent = String(score);
    }
    else {
        var Ascore = sumHandLowAce(playerHand);
        displayScore.textContent = String(Ascore);
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
        var card = getCards(deck, 1, "house");
        revealCard(card, "house");
        var houseScore = sumHand(houseHand);
        displayHouseScore.textContent = String(houseScore);
    }
    var result = standResult(playerHand, houseHand);
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
    }
    else {
        restart.classList.remove("hide");
    }
    if (hands <= 1) {
        applauseSoundFunc();
        alertUser("Game over! You leave with $".concat(chips));
        writeScoreToMemory(chips);
        disableAll();
        restart.classList.remove("hide");
    }
}
function win() {
    playOver();
    winSoundFunc();
    root.style.setProperty("--main-bg-color", "#90EE90");
    firstDraw.disabled = true;
    chips += pot * 2;
    displayChips.textContent = String(chips);
    pot = 0;
    displayPot.textContent = String(pot);
}
function lose() {
    playOver();
    loseSoundFunc();
    root.style.setProperty("--main-bg-color", "#f48a8a");
    if (chips === 0) {
        alertUser("Game over! Click restart to play again");
        disableAll();
        gameOverSoundFunc();
    }
    displayChips.textContent = String(chips);
    pot = 0;
    displayPot.textContent = String(pot);
}
function draw() {
    playOver();
    loseSoundFunc();
    root.style.setProperty("--main-bg-color", "##d9d9d9");
    chips += pot;
    displayChips.textContent = String(chips);
    pot = 0;
    displayPot.textContent = String(pot);
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
    }
    else if (btnType === "help") {
        hideableSection.classList.add("hide");
        scoreboardDisplay.classList.add("hide");
        helpDisplay.classList.remove("hide");
    }
    else if (btnType === "back") {
        backBtn.classList.add("hide");
        scoreboardDisplay.classList.add("hide");
        helpDisplay.classList.add("hide");
        hideableSection.classList.remove("hide");
    }
}
function writeScoreToMemory(score) {
    var currentHistory = [];
    var stored = localStorage.getItem("storedHistory");
    if (stored) {
        currentHistory = JSON.parse(stored);
        console.log(currentHistory);
    }
    if (currentHistory.length > 0) {
        currentHistory.push(score);
        localStorage.setItem("storedHistory", JSON.stringify(currentHistory));
        retrieveScores();
    }
    else {
        localStorage.setItem("storedHistory", JSON.stringify([score]));
        retrieveScores();
    }
}
function retrieveScores() {
    var currentHistory = [];
    var stored = localStorage.getItem("storedHistory");
    if (stored) {
        currentHistory = JSON.parse(stored);
    }
    while (leaderboard.firstChild) {
        leaderboard.firstChild.remove();
    }
    if (currentHistory.length > 0) {
        var sortedHistory = currentHistory.sort(function (a, b) { return b - a; });
        sortedHistory.forEach(function (score, index) {
            var li = document.createElement("li");
            if (index === 0) {
                li.appendChild(document.createTextNode("".concat(score, " (Personal best! \uD83D\uDD25)")));
            }
            else {
                li.appendChild(document.createTextNode(String(score)));
            }
            leaderboard.appendChild(li);
        });
    }
    else {
        leaderboard.appendChild(document.createTextNode("Complete 10 rounds of BlackJack with a score above 0 to record your score"));
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
firstDraw.addEventListener("click", function () {
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
    var cards = getCards(deck, 2, "player");
    revealCard(cards, "player");
    var score = sumHand(playerHand);
    displayScore.textContent = String(score);
    var houseCards = getCards(deck, 2, "house");
    revealCard(houseCards, "house");
    face.textContent = houseCards[0];
    var houseScore = sumHand(houseHand);
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
        var pocketAces = sumHandLowAce(playerHand);
        displayScore.textContent = String(pocketAces);
    }
});
//draws one card for player
hit.addEventListener("click", function () {
    hitFunc();
});
//make a stand, house must draw unless over 17
stand.addEventListener("click", function () {
    standFunc();
});
//clears and resets for next game
nxtGame.addEventListener("click", function () {
    //resets deck
    init();
    hands -= 1;
    displayRemaining.textContent = String(hands);
    playIsOver = false;
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
restart.addEventListener("click", function () {
    location.reload();
});
scoreboard.addEventListener("click", function () {
    clickSoundFunc();
    toggleSection("scoreboard");
});
help.addEventListener("click", function () {
    clickSoundFunc();
    toggleSection("help");
});
backBtn.addEventListener("click", function () {
    clickSoundFunc();
    toggleSection("back");
});
//betting buttons
bet10P.addEventListener("click", function () {
    // bet10();
    placeBet("bet10");
    firstDraw.disabled = false;
});
bet20P.addEventListener("click", function () {
    placeBet("bet20");
    firstDraw.disabled = false;
});
bet33P.addEventListener("click", function () {
    placeBet("bet33");
    firstDraw.disabled = false;
});
betAllP.addEventListener("click", function () {
    placeBet("betAll");
    firstDraw.disabled = false;
});
doubleD.addEventListener("click", function () {
    firstDraw.disabled = false;
    doubleDown();
});
document.addEventListener("keydown", function (event) {
    var hotBtn = bet10P;
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
            window.setTimeout(function () {
                hotBtn.classList.remove("flash");
            }, 200);
        }
        catch (_a) {
            console.log("invalid key press");
        }
    }
});
