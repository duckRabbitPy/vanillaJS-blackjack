function standResult(
  playerHand: (number | string)[],
  houseHand: (number | string)[]
) {
  const houseHighAceScore = sumHand(houseHand);
  const houseLowAceScore = sumHandLowAce(houseHand);
  const playerHighAceScore = sumHand(playerHand);
  const playerLowAceScore = sumHandLowAce(playerHand);

  //house gets blackJack
  if (
    houseHighAceScore === 21 &&
    houseHand.length === 2 &&
    playerHand.length !== 2
  ) {
    return "House got blackJack!";
  }

  if (playerLowAceScore > 21) {
    return "BUST!";
  }

  if (playerHighAceScore > 21 && !playerHand.includes("A")) {
    return "BUST!";
  }

  if (houseLowAceScore > 21) {
    return "House bust, you win!";
  }

  if (houseHighAceScore > 21 && !houseHand.includes("A")) {
    return "House bust, you win!";
  }

  //houseLowAce and playerLowAce score are below 21

  if (
    houseHighAceScore === playerHighAceScore ||
    houseLowAceScore === playerLowAceScore ||
    houseHighAceScore === playerLowAceScore ||
    houseLowAceScore === playerHighAceScore
  ) {
    return "Draw";
  }

  if (houseLowAceScore > playerHighAceScore) {
    return "House wins";
  }
  if (houseHighAceScore < playerHighAceScore && playerHighAceScore < 21) {
    return "You win";
  }

  if (houseHighAceScore < playerLowAceScore) {
    return "You win";
  }

  if (houseHighAceScore > playerHighAceScore) {
    return "House wins";
  }

  if (houseLowAceScore > playerLowAceScore) {
    return "House wins";
  }

  if (houseHighAceScore < playerHighAceScore) {
    return "You win";
  } else {
    throw new Error("Unexpected result");
  }
}

function hitResult(playerHand: (number | string)[]) {
  let score = sumHand(playerHand);

  if (score > 21 && !playerHand.includes("A")) {
    return "BUST!";
  } else {
    let Ascore = sumHandLowAce(playerHand);
    if (Ascore > 21) {
      return "BUST!";
    } else if (playerHand.length > 4) {
      return "Holy moly! Five card trick!";
    } else {
      return "Hit, stand or double down?";
    }
  }
}

function sumHandLowAce(hand: (number | string)[]) {
  let total: number = 0;

  for (let x = 0; x < hand.length; x++) {
    let currCard = hand[x];
    if (typeof currCard === "number") {
      total += currCard;
    } else {
      switch (currCard) {
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

function sumHand(hand: (number | string)[]) {
  let total: number = 0;

  for (let x = 0; x < hand.length; x++) {
    let currCard = hand[x];
    if (typeof currCard === "number") {
      total += currCard;
    } else {
      switch (currCard) {
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
