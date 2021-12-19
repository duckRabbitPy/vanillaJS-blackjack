function standResult(playerHand, houseHand) {
    if (sumHandLowAce(playerHand) > 21) {
        return "BUST!";
    }
    if (playerHand.includes("A") && sumHand(playerHand) === 22) {
        //player has foolishly chosen to stand on pocket Aces
        return "House wins";
    }
    else {
        //set low ace score
        var lowScore = sumHandLowAce(houseHand);
        //if house hand is over 21
        if (sumHand(houseHand) > 21) {
            //if hand has an ace
            if (houseHand.includes("A")) {
                if (lowScore > 21) {
                    return "House bust, you win!";
                }
                //if ace low house hand higher than player hand, house wins
                else if (lowScore > sumHand(playerHand)) {
                    return "House wins";
                    //if ace low house hand lower than player hand, player wins
                }
                else if (lowScore < sumHand(playerHand)) {
                    return "You win";
                }
            }
            else {
                //no aces and over 21 so house bust
                return "You win";
            }
        }
        //if house has higher hand than player (and house is under 21)
        else if (sumHand(houseHand) > sumHand(playerHand)) {
            return "House wins";
        }
        //else if house has lower hand than player:
        else if (sumHand(houseHand) < sumHand(playerHand)) {
            var score = sumHand(playerHand);
            var Ascore = sumHandLowAce(playerHand);
            //player is bust if over 21 without aces
            if (score > 21 && !playerHand.includes("A")) {
                return "Bust, house wins";
            }
            //player hand wins if not bust and greater than house hand
            if (score <= 21 && score > sumHand(houseHand)) {
                return "You win";
            }
            //player hand wins if has low aces and greater than househand
            else if (Ascore < 22 && Ascore > sumHand(houseHand)) {
                return "You win";
            }
            //player loses if has low aces and lower than househand
            else if (Ascore < 22 && Ascore < sumHand(houseHand)) {
                return "House wins";
            }
            // if there is a draw but house has blackJack
        }
        else if (sumHand(houseHand) === 21 &&
            houseHand.length === 2 &&
            playerHand.length !== 2) {
            return "House got blackJack!";
            //else must be a draw
        }
        else {
            return "Draw";
        }
    }
}
function hitResult(playerHand) {
    var score = sumHand(playerHand);
    if (score > 21 && !playerHand.includes("A")) {
        return "BUST!";
    }
    else {
        var Ascore = sumHandLowAce(playerHand);
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
    var total = 0;
    for (var x = 0; x < hand.length; x++) {
        var currCard = hand[x];
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
    var total = 0;
    for (var x = 0; x < hand.length; x++) {
        var currCard = hand[x];
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
