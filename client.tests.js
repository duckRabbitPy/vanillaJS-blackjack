test("exampleA1", () => {
  equal(standResult([10, 7], [10, 9]), "House wins");
});
test("exampleA2", () => {
  equal(standResult([10, 7, 2], [10, 9]), "Draw");
});
test("exampleA3", () => {
  equal(standResult([10, 7, 4], ["A", 10]), "House got blackJack!");
});
test("exampleA4", () => {
  equal(standResult([10, 7], [10, 10, 5]), "You win");
});
test("exampleA5", () => {
  equal(standResult([9, "A"], ["K", 4, 3]), "You win");
});

test("exampleA6", () => {
  equal(standResult(["A", "A"], ["K", 8]), "House wins");
});
test("exampleA7", () => {
  equal(standResult(["A", "A"], [10, 6]), "House wins");
});
test("exampleA8", () => {
  equal(standResult(["K", 8], [9, 9]), "Draw");
});
test("exampleA9", () => {
  equal(standResult([7, 3, "A"], ["A", 2, 6]), "You win");
});
test("exampleA10", () => {
  equal(standResult([7, 3, "A"], ["A", 7, 3]), "Draw");
});
test("exampleA11", () => {
  equal(standResult([7, 2, "A"], ["A", 7, 3]), "House wins");
});
test("exampleA12", () => {
  equal(standResult([7, 9, 9], [10, 5, 10]), "BUST!");
});
test("exampleB1", () => {
  equal(hitResult([10, 7, 2]), "Hit, stand or double down?");
});
test("exampleB2", () => {
  equal(hitResult([10, 10, 5]), "BUST!");
});
test("exampleB3", () => {
  equal(hitResult(["K", 3, 2, 2, 3]), "Holy moly! Five card trick!");
});
test("exampleB4", () => {
  equal(hitResult([10, 10, "A", "A"]), "BUST!");
});
