let startPageElement;
let playPageElement;
let endPageElement;
let inputElement;
let startButtonElement;
let inputtedTextElement;
let currentTextElement;
let notInputtedTextElement;
let quitButtonElement;
let scoreElement;
let isNewHighScoreElement;
let highScoreElement;
let charPerSecElement;
let accuracyElement;
let timeElement;
let textLengthElement;
let symbolLengthElement;
let mistakeCountElement;
let restartButtonElement;

window.onload = () => {
  startPageElement = document.getElementById('startPage');
  playPageElement = document.getElementById('playPage');
  endPageElement = document.getElementById('endPage');
  inputElement = document.getElementById('input');
  startButtonElement = document.getElementById('start');
  inputtedTextElement = document.getElementById('inputtedText');
  currentTextElement = document.getElementById('currentText');
  notInputtedTextElement = document.getElementById('notInputtedText');
  quitButtonElement = document.getElementById('quit');
  scoreElement = document.getElementById('score');
  isNewHighScoreElement = document.getElementById('isNewHighScore');
  highScoreElement = document.getElementById('highScore');
  charPerSecElement = document.getElementById('charPerSec');
  accuracyElement = document.getElementById('accuracy');
  timeElement = document.getElementById('time');
  textLengthElement = document.getElementById('textLength');
  symbolLengthElement = document.getElementById('symbolLength');
  mistakeCountElement = document.getElementById('mistakeCount');
  restartButtonElement = document.getElementById('restart');

  startButtonElement.onclick = play;
  quitButtonElement.onclick = start;
  restartButtonElement.onclick = start;

  start();
};

let state = 'start';
let startDate;
let text = '';
let texts = [];
let currentLine = 0;
let currentIndex = 0;
let textLength = 0;
let symbolCount = 0;
let mistakeCount = 0;

function start() {
  state = 'start';

  startPageElement.style.display = 'block';
  playPageElement.style.display = 'none';
  endPageElement.style.display = 'none';

  symbolCount = 0;
  mistakeCount = 0;
  inputElement.value = '';
}

const newlineRegex = /\r?\n/;
function play() {
  state = 'play';

  startPageElement.style.display = 'none';
  playPageElement.style.display = 'block';
  endPageElement.style.display = 'none';

  text = inputElement.value;
  texts = text.split(newlineRegex);
  for (let i = texts.length - 1; i >= 0; i--) {
    texts[i] = texts[i].trim();
    // 日本語を削除
    if (texts[i] === '') {
      texts.splice(i, 1);
    }
  }
  if (texts.length === 0) {
    start();
    return;
  }
  startDate = new Date();

  currentLine = -1;
  nextLine();
}

function end() {
  state = 'end';

  startPageElement.style.display = 'none';
  playPageElement.style.display = 'none';
  endPageElement.style.display = 'block';

  const time = (new Date() - startDate) / 1000;
  const score = Math.floor(textLength / time * 100) - mistakeCount * 10;

  scoreElement.textContent = score;

  let savedHighScore = localStorage.getItem('highScore') || 0;
  const isNewHighScore = score > savedHighScore;
  if (isNewHighScore) {
    localStorage.setItem('highScore', score);
    savedHighScore = score;
    isNewHighScoreElement.style.visibility = 'visible';
  } else {
    isNewHighScoreElement.style.visibility = 'hidden';
  }
  highScoreElement.textContent = savedHighScore;

  const charPerSec = textLength / time;
  charPerSecElement.textContent = charPerSec.toFixed(2);

  const accuracy = (textLength - mistakeCount) / textLength * 100;
  accuracyElement.textContent = accuracy.toFixed(2);

  timeElement.textContent = time.toFixed(2);

  textLengthElement.textContent = textLength;
  symbolLengthElement.textContent = symbolCount;
  mistakeCountElement.textContent = mistakeCount;
}

function nextLine() {
  currentLine++;
  currentIndex = 0;

  if (currentLine >= texts.length) {
    end();
    return;
  }

  // TODO: 入力されたテキストをエスケープする
  let lineText = texts[currentLine];
  inputtedTextElement.innerHTML = '';
  currentTextElement.innerHTML = lineText[0].replace(/ /g, '&nbsp;')
  notInputtedTextElement.innerHTML = lineText.slice(1);
  textLength += lineText.length;
  symbolCount += countSymbols(lineText);
}


window.onkeydown = (event) => {
  if (state !== 'play')
    return;

  const key = event.key;
  if (key === texts[currentLine][currentIndex]) {
    currentIndex++;
    if (currentIndex === texts[currentLine].length) {
      nextLine();
    }

    inputtedTextElement.innerHTML = texts[currentLine].slice(0, currentIndex).replace(/ /g, '&nbsp;')
    currentTextElement.innerHTML = texts[currentLine][currentIndex].replace(/ /g, '&nbsp;')
    notInputtedTextElement.innerHTML = texts[currentLine].slice(currentIndex + 1).replace(/ /g, '&nbsp;')
  } else {
    mistakeCount++;
  }
};

function countSymbols(text) {
  let count = 0;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);

    if (!((code >= 65 && code <= 90) ||  // 大文字
      (code >= 97 && code <= 122) || // 小文字
      (code >= 48 && code <= 57) ||  // 数字
      code === 32)) {                // スペース
      count++;
    }
  }

  return count;
}
