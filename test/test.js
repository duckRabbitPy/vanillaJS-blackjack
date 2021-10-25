// Run: ./node_modules/mocha/bin/mocha

const mocha = require("mocha");
const describe = mocha.describe;
const it = mocha.it;
const chai = require("chai");
const assert = chai.assert;

describe("Fixed tests", () => {
  it("example1", () => {
    assert.strictEqual(standFunc([10, 7], [10, 9]), "House Wins");
  });
  it("example2", () => {
    assert.strictEqual(standFunc([10, 7, 2], [10, 9]), "Draw");
  });
  it("example3", () => {
    assert.strictEqual(
      standFunc([10, 7, 4], ["A", 10]),
      "House got blackJack!"
    );
  });
  it("example4", () => {
    assert.strictEqual(standFunc([10, 7], [10, 10, 5]), "You win");
  });
  it("example5", () => {
    assert.strictEqual(hitFunc([10, 7, 2]), undefined);
  });
  it("example6", () => {
    assert.strictEqual(hitFunc([10, 10, 5]), "BUST!");
  });
});

//purefunction version of standFunc used in production, accepts final playerHand and houseHand values instead of using getCards function (to avoid side effects)

function standFunc(playerHand, houseHand) {
  if (playerHand.includes("A") && sumHand(playerHand) === 22) {
    //player has foolishly chosen to stand on pocket Aces
    return "House Wins";
  } else {
    //set low ace score
    let lowScore = sumHandLowAce(houseHand);

    //if house hand is over 21
    if (sumHand(houseHand) > 21) {
      //if hand has an ace
      if (houseHand.includes("A")) {
        if (lowScore > 21) {
          return "House bust, you win!";
        }
        //if ace low house hand higher than player hand, house wins
        else if (lowScore > sumHand(playerHand)) {
          return "House Wins";
          //if ace low house hand lower than player hand, player wins
        } else if (lowScore < sumHand(playerHand)) {
          return "You Win";
        }
      } else {
        //no aces and over 21 so house bust
        return "You win";
      }
    }
    //if house has higher hand than player (and house is under 21)
    else if (sumHand(houseHand) > sumHand(playerHand)) {
      return "House Wins";
    }
    //else if house has lower hand than player:
    else if (sumHand(houseHand) < sumHand(playerHand)) {
      let score = sumHand(playerHand);
      let Ascore = sumHandLowAce(playerHand);

      //failsafe check to make sure player is bust if over 21 without aces
      if (score > 21 && !playerHand.includes("A")) {
        return "Bust, house wins";
      }
      //player hand wins if has low aces and greater than househand
      else if (Ascore < 22 && Ascore > sumHand(houseHand)) {
        return "You win";
      }
      //player loses if has low aces and lower than househand
      else if (Ascore < 22 && Ascore < sumHand(houseHand)) {
        return "House Wins!";
      }
      // if there is a draw but house has blackJack
    } else if (
      sumHand(houseHand) === 21 &&
      houseHand.length === 2 &&
      playerHand.length !== 2
    ) {
      return "House got blackJack!";

      //else must be a draw
    } else {
      return "Draw";
    }
  }
}

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

function hitFunc(playerHand) {
  let score = sumHand(playerHand);

  if (score > 21 && !playerHand.includes("A")) {
    return "BUST!";
  } else {
    let Ascore = sumHandLowAce(playerHand);
    if (Ascore > 21) {
      return "BUST!";
    } else if (playerHand.length > 4) {
      return "Holy moly! Five card trick!";
    }
  }
}
