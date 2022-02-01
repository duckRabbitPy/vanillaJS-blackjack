//init gets JSON Deck of cards out of local to creates/resets the deck
function init() {
  fetch("/deck.json")
    .then((response) => response.json())
    .then((cards) => {
      deck = cards;
    });
}

//player adds their chips to the pot
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

//player doubles their bet, draws a single card and stands
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

//function that when called adds new card to player/house innerHMTL
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
    (sumHand(houseHand) < 17 && sumHand(houseHand) < 21) ||
    (sumHand(houseHand) > 21 &&
      sumHandLowAce(houseHand) < 21 &&
      sumHandLowAce(houseHand) < 17)
  ) {
    let card = getCards(deck, 1, "house");
    revealCard(card, "house");
  }

  let houseScore = sumHand(houseHand);

  if (houseScore > 21 && !houseHand.includes("A")) {
    displayHouseScore!.textContent = String(houseScore);
  } else {
    let Ascore = sumHandLowAce(houseHand);
    displayHouseScore!.textContent = String(Ascore);
  }

  let result = standResult(playerHand, houseHand);
  showResult(result);
}

//resets buttons and html display in preparation for next hand
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

//displays result of standfunction call
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
    case "House bust, you win!":
      win();
      break;
    case "House got blackJack!":
      lose();
      break;
    case "Holy moly! Five card trick!":
      win();
      break;
    case "House got Five card trick!":
      lose();
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

//controls toggling with menu buttons
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

//displays username if found in local storage
function retrieveUserName() {
  let storedUser = localStorage.getItem("storedUser");
  if (storedUser) {
    landingForm.classList.add("hide");
    backBtn.style.display = "inline";
    toggleSection("back");
    displaycurrUser.innerHTML = `🤠 ${storedUser}`;
  }
}

//stores new username in local storage
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

//retrieves personal best scores from local storage
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

//saves score to firebase database
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

//retrieves score from firebase database
function collectPublicScores() {
  //GET is default if not specified
  interface ScoreObj {
    score: number;
    username: string;
  }
  while (publicLeaderboard!.firstChild) {
    publicLeaderboard!.firstChild.remove();
  }
  fetch(`https://vanilla-js-blackjack.vercel.app/api/database?name=Oli`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Get request failed");
      }
      console.log(res);
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
