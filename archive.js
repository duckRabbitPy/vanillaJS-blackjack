const show = document.querySelector(".peek");

//Show cards remaining in deck
const showDeck = function () {
    mapD = deck.map((elem) => elem.value + elem.suit);
    const html = `
      ${mapD}
      
      `;
  
    cardsLeft.innerHTML = html;
  };
  

//show button
show.addEventListener("click", () => {
    showDeck(deck);
  });