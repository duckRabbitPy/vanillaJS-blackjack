"use strict";
//call runTests() in console
/*----------------------------------------------------*\
 TEST HELPERS
\*----------------------------------------------------*/
function equal(actual, expected) {
    if (actual === expected) {
        const defaultMessage = `Expected: ${expected} and received: ${actual}`;
        console.info("%cPass: " + defaultMessage + " ✅", "background: white; color: green; padding: 3px");
    }
    else {
        const defaultMessage = `Expected: ${expected} but received: ${actual} instead`;
        console.error("%cFail: " + defaultMessage + " ❌", "background: white; color: red; padding: 3px");
    }
}
function notEqual(actual, expected) {
    if (actual !== expected) {
        const defaultMessage = `${expected} is different to ${actual}`;
        console.info("%cPass: " + defaultMessage + " ✅", "background: white; color: green; padding: 3px");
    }
    else {
        const defaultMessage = `${expected} is the same as ${actual}`;
        console.error("%cFail: " + defaultMessage + " ❌", "background: white; color: red; padding: 3px");
    }
}
function test(name, testFunction) {
    console.group(name);
    testFunction();
    console.groupEnd();
}
/*----------------------------------------------------*\
 Unit tests
\*----------------------------------------------------*/
function runTests() {
    test("Player wins with higher than House (no aces involved)", () => {
        equal(standResult([9, 10], [10, 7]), "You win");
    });
    test("Player wins with high ace higher than House score (house no aces)", () => {
        equal(standResult([9, 10, "A"], [10, 9]), "You win");
    });
    test("Player wins with high ace score, both have aces", () => {
        equal(standResult([9, "A"], [10, 4, 3, "A"]), "You win");
    });
    test("Player wins with low ace higher than House score (house no aces)", () => {
        equal(standResult([10, 7, 3, "A"], [10, 2, 6]), "You win");
    });
    test("Player wins with low ace higher than House score (house has aces)", () => {
        equal(standResult([10, 7, 3, "A"], [10, 2, 6, "A"]), "You win");
    });
    test("Player loses with lower than House (no aces involved)", () => {
        equal(standResult([10, 7], [10, 9]), "House wins");
    });
    test("Players loses without aces, house has high ace", () => {
        equal(standResult([10, 9], [9, 10, "A"]), "House wins");
    });
    test("Player loses with high ace score, both have aces", () => {
        equal(standResult([7, 2, "A"], ["A", 7, 3]), "House wins");
    });
    test("Player loses without aces, house has low ace", () => {
        equal(standResult([10, 7, 3], [10, 7, 3, "A"]), "House wins");
    });
    test("Player stands and loses on pocket aces", () => {
        equal(standResult(["A", "A"], ["K", 8]), "House wins");
    });
    test("House gets blackJack", () => {
        equal(standResult([10, 7, 4], ["A", 10]), "House got blackJack!");
    });
    test("Player and house score equal (no aces involved)", () => {
        equal(standResult([10, 7, 2], [10, 9]), "Draw");
    });
    test("Player and house score equal (house has low ace)", () => {
        equal(standResult([10, 6, 2], [10, "A", 7]), "Draw");
    });
    test("Player and house score equal (player has low ace)", () => {
        equal(standResult([10, "A", 7], [4, "K", 4]), "Draw");
    });
    test("Player and house both draw with low aces", () => {
        equal(standResult([7, 3, "A"], ["A", 7, 3]), "Draw");
    });
    test("Player goes bust without aces", () => {
        equal(standResult([7, 9, 9], [10, 5, 10]), "BUST!");
    });
    test("Player goes bust with low aces", () => {
        equal(standResult([10, "A", "A", 10], ["A", 2, 6]), "BUST!");
    });
    test("House goes bust without aces", () => {
        equal(standResult([10, 7], [10, 10, 5]), "House bust, you win!");
    });
    test("House goes bust with low aces", () => {
        equal(standResult([10, 7], [10, "A", "A", 10]), "House bust, you win!");
    });
    test("Hit and not bust", () => {
        equal(hitResult([10, 7, 2]), "Hit, stand or double down?");
    });
    test("Hit and bust", () => {
        equal(hitResult([10, 10, 5]), "BUST!");
    });
    test("Hit and acheive 5 card trick without bust", () => {
        equal(hitResult(["K", 3, 2, 2, 3]), "Holy moly! Five card trick!");
    });
    test("Hit and narrowly bust on 5 cards", () => {
        equal(hitResult(["K", 3, 2, 2, 5]), "BUST!");
    });
    test("Hit and bust on low aces", () => {
        equal(hitResult([10, 10, "A", "A"]), "BUST!");
    });
    test("Invalid string input should result in draw", () => {
        equal(standResult(["invalid", "data"], ["incorrect", "strings"]), "Draw");
    });
    /*----------------------------------------------------*\
   Integration tests
  \*----------------------------------------------------*/
    test("House should hit again if score (no aces) is less than 17", () => {
        houseHand = [5, 10];
        let originalLen = houseHand.length;
        standFunc();
        notEqual(houseHand.length, originalLen);
        testReset();
    });
    test("House should hit again if normal score is greater than 21 and lowAce score is less than 21", () => {
        houseHand = [5, 7, "A"];
        let originalLen = houseHand.length;
        standFunc();
        notEqual(houseHand.length, originalLen);
        testReset();
    });
    test("House should lose if bust on 5 cards", () => {
        houseHand = ["A", "A", "A", 10, 10];
        standFunc();
        equal(userMessage.innerHTML, "House bust, you win!");
        testReset();
    });
    test("House should lose and go bust on greater than 21", () => {
        houseHand = [2, 10, 10];
        standFunc();
        equal(userMessage.innerHTML, "House bust, you win!");
        testReset();
    });
    test("House should not hit if (no ace) score is above 16", () => {
        houseHand = [6, 17];
        let originalLen = houseHand.length;
        standFunc();
        equal(houseHand.length, originalLen);
        testReset();
    });
    test("House should not hit if lowAce score is above 16", () => {
        houseHand = [6, 10, "A"];
        let originalLen = houseHand.length;
        standFunc();
        equal(houseHand.length, originalLen);
        testReset();
    });
    test("Bust house hand should be summed low if aces in hand", () => {
        houseHand = [10, 10, 2, "A"];
        standFunc();
        equal(Number(displayHouseScore.innerHTML) === 23, true);
        testReset();
    });
    test("Bet 10%", () => {
        let starting = displayChips.innerHTML;
        bet10P.click();
        let expected = String(Number(starting) / 10);
        let result = displayPot.innerHTML;
        equal(result, expected);
        testReset();
    });
    test("Bet 20%", () => {
        let starting = displayChips.innerHTML;
        bet20P.click();
        let expected = String(Number(starting) / 5);
        let result = displayPot.innerHTML;
        equal(result, expected);
        testReset();
    });
    test("Bet 33%", () => {
        let starting = displayChips.innerHTML;
        bet33P.click();
        let expected = String(Number(starting) / 3);
        let result = displayPot.innerHTML;
        equal(result, expected);
        testReset();
    });
    test("Bet it all", () => {
        let starting = displayChips.innerHTML;
        betAllP.click();
        let expected = starting;
        let result = displayPot.innerHTML;
        equal(result, expected);
        displayPot.innerHTML = "0";
        testReset();
    });
    test("Two cards drawn", () => {
        betAllP.click();
        firstDraw.click();
        let resultLen = playerHand.length;
        equal(resultLen, 2);
        //reset pot to 0 for other tests
        displayPot.innerHTML = "0";
        testReset();
    });
    chips = 500;
    displayChips.innerHTML = "500";
}
function testReset() {
    pot = 0;
    displayScore.textContent = "0";
    displayHouseScore.textContent = "0";
    displayPot.innerHTML = "0";
    playerResult.innerHTML = "";
    houseResult.style.visibility = "hidden";
    face.textContent = "";
    houseResult.innerHTML = "";
    playerHand = [];
    houseHand = [];
    root.style.setProperty("--main-bg-color", "#bfdff6");
    firstDraw.disabled = true;
    hit.disabled = true;
    stand.disabled = true;
    bet10P.disabled = false;
    bet20P.disabled = false;
    bet33P.disabled = false;
    betAllP.disabled = false;
    nxtGame.disabled = true;
    doubleD.disabled = true;
    alertUser("Place your bet to start");
}
