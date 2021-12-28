"use strict";
function standResult(playerHand, houseHand) {
    const houseHighAceScore = sumHand(houseHand);
    const houseLowAceScore = sumHandLowAce(houseHand);
    const playerHighAceScore = sumHand(playerHand);
    const playerLowAceScore = sumHandLowAce(playerHand);
    //house gets blackJack
    if (houseHighAceScore === 21 &&
        houseHand.length === 2 &&
        playerHand.length !== 2) {
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
    if (houseHighAceScore === playerHighAceScore ||
        houseLowAceScore === playerLowAceScore ||
        houseHighAceScore === playerLowAceScore ||
        houseLowAceScore === playerHighAceScore) {
        return "Draw";
    }
    if (houseLowAceScore > playerHighAceScore) {
        return "House wins";
    }
    if (houseHighAceScore < playerLowAceScore) {
        return "You win";
    }
    if (houseHighAceScore < playerHighAceScore && playerHighAceScore < 22) {
        return "You win";
    }
    if (houseHighAceScore > playerHighAceScore && houseHighAceScore < 22) {
        return "House wins";
    }
    if (playerHighAceScore > houseLowAceScore && playerHighAceScore < 22) {
        return "You win";
    }
    if (houseLowAceScore > playerLowAceScore && houseHighAceScore < 22) {
        return "House wins";
    }
    if (houseHighAceScore < playerHighAceScore) {
        return "You win";
    }
    if (playerHighAceScore < houseHighAceScore) {
        return "House wins";
    }
    else {
        //default if the function fails to return
        return "Draw";
    }
}
function hitResult(playerHand) {
    let score = sumHand(playerHand);
    if (score > 21 && !playerHand.includes("A")) {
        return "BUST!";
    }
    else {
        let Ascore = sumHandLowAce(playerHand);
        if (Ascore > 21) {
            return "BUST!";
        }
        else if (playerHand.length > 4) {
            return "Holy moly! Five card trick!";
        }
        else {
            return "Hit, stand or double down?";
        }
    }
}
function sumHandLowAce(hand) {
    let total = 0;
    for (let x = 0; x < hand.length; x++) {
        let currCard = hand[x];
        if (typeof currCard === "number") {
            total += currCard;
        }
        else {
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
function sumHand(hand) {
    let total = 0;
    for (let x = 0; x < hand.length; x++) {
        let currCard = hand[x];
        if (typeof currCard === "number") {
            total += currCard;
        }
        else {
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
