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
let restartWithSameTextButtonElement;

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
  restartWithSameTextButtonElement = document.getElementById('restartWithSameText');

  startButtonElement.onclick = play;
  quitButtonElement.onclick = start;
  restartButtonElement.onclick = start;
  restartWithSameTextButtonElement.onclick = () => start(false);

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

function start(clearInput = true) {
  state = 'start';

  startPageElement.style.display = 'block';
  playPageElement.style.display = 'none';
  endPageElement.style.display = 'none';

  textLength = 0;
  symbolCount = 0;
  mistakeCount = 0;
  if (clearInput)
    inputElement.value = '';

  inputElement.focus();
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
    const { filteredText, symbolCount: lineSymbolCount } = processText(texts[i].trim());
    texts[i] = filteredText;
    if (texts[i] === '') {
      texts.splice(i, 1);
    } else {
      symbolCount += lineSymbolCount;
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
  const accuracy = (textLength - mistakeCount) / textLength * 100;
  const score = Math.floor(textLength / time * 1000) - (accuracy + 100) / 2;

  scoreElement.textContent = 'Score: ' + score;

  let savedHighScore = localStorage.getItem('highScore') || 0;
  const isNewHighScore = score > savedHighScore;
  if (isNewHighScore) {
    localStorage.setItem('highScore', score);
    savedHighScore = score;
    isNewHighScoreElement.style.visibility = 'visible';
  } else {
    isNewHighScoreElement.style.visibility = 'hidden';
  }
  highScoreElement.textContent = 'HighScore: ' + savedHighScore;

  const charPerSec = textLength / time;
  charPerSecElement.textContent = 'CharPerSec: ' + charPerSec.toFixed(2);

  accuracyElement.textContent = 'Accuracy: ' + accuracy.toFixed(2);

  timeElement.textContent = 'Time: ' + time.toFixed(2);

  textLengthElement.textContent = 'TextLength: ' + textLength;
  symbolLengthElement.textContent = 'SymbolCount: ' + symbolCount;
  mistakeCountElement.textContent = 'MistakeCount: ' + mistakeCount;
}

function nextLine() {
  currentLine++;
  currentIndex = 0;

  if (currentLine >= texts.length) {
    end();
    return;
  }

  let lineText = texts[currentLine];
  inputtedTextElement.innerHTML = '';
  currentTextElement.innerHTML = lineText[0].replace(/ /g, '&nbsp;');
  notInputtedTextElement.innerHTML = escapeHTML(lineText.slice(1));
  textLength += lineText.length;
}


window.onkeydown = (event) => {
  if (state === 'start') {
    if (event.key === 'Enter' && event.shiftKey) {
      play();
    }
    return;
  } else if (state === 'end') {
    if (event.key === ' ') {
      if (event.shiftKey) {
        start(false);
      } else {
        start(true);
      }
    }
    return;
  }

  const key = event.key;
  if (key === texts[currentLine][currentIndex]) {
    currentIndex++;
    if (currentIndex === texts[currentLine].length) {
      nextLine();
      return;
    }

    inputtedTextElement.innerHTML = escapeHTML(texts[currentLine].slice(0, currentIndex));
    currentTextElement.innerHTML = texts[currentLine][currentIndex].replace(/ /g, '&nbsp;');
    notInputtedTextElement.innerHTML = escapeHTML(texts[currentLine].slice(currentIndex + 1));
  } else {
    if (key.length === 1)
      mistakeCount++;
  }
};

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")   // & を &amp; に
    .replace(/</g, "&lt;")    // < を &lt; に
    .replace(/>/g, "&gt;")    // > を &gt; に
    .replace(/"/g, "&quot;")  // " を &quot; に
    .replace(/'/g, "&#039;")  // ' を &#039; に
    .replace(/ /g, '&nbsp;'); // スペースを &nbsp; に
}

function processText(text) {
  let filteredText = '';  // ASCII範囲内の文字だけを保持
  let symbolCount = 0;    // 記号のカウント

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);

    // 半角スペース (U+0020) からチルダ (~, U+007E) までの文字を保持
    if (code >= 32 && code <= 126) {
      filteredText += text[i];
    } else {
      continue;
    }

    if (!((code >= 65 && code <= 90) ||  // 大文字
      (code >= 97 && code <= 122) || // 小文字
      (code >= 48 && code <= 57) ||  // 数字
      code === 32)) {                // スペース
      symbolCount++;
    }
  }

  return {
    filteredText: filteredText,
    symbolCount: symbolCount
  };
}
