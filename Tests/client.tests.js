//call runTests() in console

function runTests() {
  test("Player score lower than House (no aces involved)", () => {
    equal(standResult([10, 7], [10, 9]), "House wins");
  });
  test("Player and house score equal (no aces involved)", () => {
    equal(standResult([10, 7, 2], [10, 9]), "Draw");
  });
  test("Player and house score equal (house has low ace)", () => {
    equal(standResult([10, 6, 2], [10, "A", 7]), "Draw");
  });

  test("Player and house score equal (no aces involved)", () => {
    equal(standResult(["K", 8], [9, 9]), "Draw");
  });
  test("House get blackJack", () => {
    equal(standResult([10, 7, 4], ["A", 10]), "House got blackJack!");
  });
  test("House goes bust (no aces involved)", () => {
    equal(standResult([10, 7], [10, 10, 5]), "You win");
  });
  test("Player wins with high ace score", () => {
    equal(standResult([9, "A"], ["K", 4, 3]), "You win");
  });

  test("Player stands on pocket aces", () => {
    equal(standResult(["A", "A"], ["K", 8]), "House wins");
  });

  test("Player has superior high ace hand", () => {
    equal(standResult([7, 3, "A"], ["A", 2, 6]), "You win");
  });

  test("House has superior high aces", () => {
    equal(standResult([7, 2, "A"], ["A", 7, 3]), "House wins");
  });
  test("Player and house both draw with low aces", () => {
    equal(standResult([7, 3, "A"], ["A", 7, 3]), "Draw");
  });
  test("Player goes bust on double down", () => {
    equal(standResult([7, 9, 9], [10, 5, 10]), "BUST!");
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

  test("Bet 10%", () => {
    let starting = displayChips.innerHTML;
    bet10P.click();
    let expected = String(Number(starting / 10));
    let result = displayPot.innerHTML;
    equal(result, expected);
    //reset pot to 0 for other tests
    displayPot.innerHTML = "0";
    pot = 0;
  });

  test("Bet 20%", () => {
    let starting = displayChips.innerHTML;
    bet20P.click();
    let expected = String(Number(starting / 5));
    let result = displayPot.innerHTML;
    equal(result, expected);
    //reset pot to 0 for other tests
    displayPot.innerHTML = "0";
    pot = 0;
  });

  test("Bet 33%", () => {
    let starting = displayChips.innerHTML;
    bet33P.click();
    let expected = String(Number(starting / 3));
    let result = displayPot.innerHTML;
    equal(result, expected);
    //reset pot to 0 for other tests
    displayPot.innerHTML = "0";
    pot = 0;
  });

  test("Bet it all", () => {
    let starting = displayChips.innerHTML;
    betAllP.click();
    let expected = starting;
    let result = displayPot.innerHTML;
    equal(result, expected);
    //reset pot to 0 for other tests
    displayPot.innerHTML = "0";
    pot = 0;
  });

  test("Two cards drawn", () => {
    betAllP.click();
    firstDraw.click();
    let resultLen = playerHand.length;
    equal(resultLen, 2);
    //reset pot to 0 for other tests
    displayPot.innerHTML = "0";
    pot = 0;
  });

  test("Bet all and Win", () => {
    //TODO
    betAllP.click();
    playerHand = ["A", "K"];
    houseHand = [10, 6];
    standFunc();
    showResult(playerHand);
    showResult(houseHand);
    //reset pot to 0 for other tests
    displayPot.innerHTML = "0";
    pot = 0;
  });
}