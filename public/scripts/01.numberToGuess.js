const guess = document.querySelector("#guess-input");
const guessButton = document.querySelector("#guess-button");
const resultArea = document.querySelector("#result-area");
const replay = document.querySelector("#replay");
let answerDom = document.querySelector("#answer");
let times = document.querySelector("#times");
let answer = parseInt(Math.floor(Math.random() * 100) + 1);
answerDom.textContent = `正確答案是🤫：${answer}`;
let addTimes = 0;
const resultDescription = [
  `猜的到嗎？ 提示會在哪裡🤫`,
  `你一定猜不到的啦~ 提示會下面嗎🤫`,
  `不可能猜的到吧？ 偷偷跟你說有提示喔🤫`,
  `懂猜嗎？ 才不會告訴你有提示呢🤫`,
  `來玩一場嘛~ 找找看提示吧🤫`,
];

let randomDescription = parseInt(Math.floor(Math.random() * 5));
resultArea.textContent = resultDescription[randomDescription];

console.log(`隨機說話排序：${randomDescription}`);
console.log(`答案：${answer}`);

guessButton.addEventListener("click", () => {
  if (answer == guess.value) {
    const correctDescription = [
      `猜對了，答案是：${answer}`,
      `運氣好，答案是：${answer}`,
      `恭喜答對，答案是：${answer}`,
      `厲害喔，答案是：${answer}`,
      `沒錯!答案是：${answer}`,
    ];
    resultArea.innerHTML = correctDescription[randomDescription];
    addTimes++;
    times.innerHTML = `答對次數：${addTimes}`;
    guess.disabled = true;
    guessButton.disabled = true;
  } else if (guess.value.length == 0) {
    resultArea.innerHTML = `請輸入正確內容。`;
  } else if (answer < guess.value) {
    resultArea.innerHTML = `答錯，請再猜小一點`;
  } else if (answer > guess.value) {
    resultArea.innerHTML = `答錯，請再猜大一點`;
  }
});

replay.addEventListener("click", () => {
  answer = parseInt(Math.floor(Math.random() * 100) + 1);
  randomDescription = parseInt(Math.floor(Math.random() * 5));
  resultArea.textContent = resultDescription[randomDescription];
  guess.value = "";
  guess.disabled = false;
  guessButton.disabled = false;
  answerDom.textContent = `正確答案是🤫：${answer}`;
  console.log(`隨機說話排序：${randomDescription}`);
  console.log(`答案：${answer}`);
});
