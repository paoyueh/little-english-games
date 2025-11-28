/* --------------------------
   第 4 階段 – 火車載貨遊戲
--------------------------- */

let stage4Words = [];
let stage4Index = 0;
let stage4Correct = 0;
let currentWord4 = null;

let stage4Audio = new Audio();  // 🔊 用來播放英文題目

window.onload = async () => {
  const params = loadGameParams();
  stage4Words = params.words;
  document.getElementById("game-topics").textContent = params.topicNames;
  document.getElementById("game-word-count").textContent = stage4Words.length;

  shuffle(stage4Words);
  loadStage4Question();
  bindStage4Events();
};

/* --------------------------
   載入題目
--------------------------- */
function loadStage4Question() {
  currentWord4 = stage4Words[stage4Index];

  document.getElementById("stage4-img").innerHTML =
    currentWord4.icon || `<span style="font-size:40px;">❔</span>`;

  document.getElementById("stage4-zh").textContent = currentWord4.zh;
  document.getElementById("stage4-progress").textContent =
    `第 ${stage4Index + 1} 題 / ${stage4Words.length} 題`;

  // 🔊 更新音訊
  if (currentWord4.enAudio) {
    stage4Audio.src = currentWord4.enAudio;
    stage4Audio.play(); // 題目剛出來播放一次
  }

  setupTrainSlots(currentWord4.en);
  setupLetterPool(currentWord4.en);
}

/* --------------------------
   建立火車車廂
--------------------------- */
function setupTrainSlots(word) {
  const area = document.getElementById("stage4-train-cars");
  area.innerHTML = "";

  [...word].forEach(() => {
    const slot = document.createElement("div");
    slot.className = "letter-slot";
    slot.onclick = () => {
      if (slot.textContent !== "") {
        const letter = slot.textContent;
        slot.textContent = "";
        addLetterToPool(letter);
      }
    };
    area.appendChild(slot);
  });
}

/* --------------------------
   字母庫
--------------------------- */
function setupLetterPool(word) {
  const pool = document.getElementById("stage4-letter-pool");
  pool.innerHTML = "";

  let letters = shuffle([...word.split("")]);

  letters.forEach((L) => {
    addLetterToPool(L);
  });
}

function addLetterToPool(letter) {
  const pool = document.getElementById("stage4-letter-pool");

  const div = document.createElement("div");
  div.className = "letter-slot big-letter";
  div.textContent = letter;

  div.onclick = () => addLetterToTrain(div);

  pool.appendChild(div);
}

function addLetterToTrain(tile) {
  const slots = document.querySelectorAll("#stage4-train-cars .letter-slot");

  for (let slot of slots) {
    if (slot.textContent === "") {
      slot.textContent = tile.textContent;
      tile.remove();
      break;
    }
  }
}

/* --------------------------
   綁定按鈕
--------------------------- */
function bindStage4Events() {
  document.getElementById("stage4-start").onclick = checkTrainWord;
  document.getElementById("stage4-reset").onclick = resetStage4;

  // 🔊 喇叭播放英文
  document.getElementById("stage4-speak-btn").onclick = () => {
    if (currentWord4?.enAudio) {
      stage4Audio.currentTime = 0;
      stage4Audio.play();
    }
  };
}

/* --------------------------
   檢查答案
--------------------------- */
function checkTrainWord() {
  const slots = [...document.querySelectorAll("#stage4-train-cars .letter-slot")];
  const answer = slots.map((s) => s.textContent).join("");

  if (answer.toLowerCase() === currentWord4.en.toLowerCase()) {
    stage4Correct++;
    document.getElementById("stage4-done").textContent = stage4Correct;

    moveTrainAway();
    nextStage4Question();
  } else {
    flashTrain();
    setTimeout(nextStage4Question, 1500);
  }
}

/* --------------------------
   火車動畫
--------------------------- */
function moveTrainAway() {
  const train = document.getElementById("stage4-train");
  train.classList.add("train-move");

  setTimeout(() => {
    train.classList.remove("train-move");
  }, 900);
}

function flashTrain() {
  const train = document.getElementById("stage4-train");
  train.classList.add("train-flash");
  setTimeout(() => train.classList.remove("train-flash"), 600);
}

/* --------------------------
   下一題
--------------------------- */
function nextStage4Question() {
  stage4Index++;
  if (stage4Index >= stage4Words.length || stage4Correct >= 10) {
    setTimeout(showFireworks, 300);
    return;
  }
  loadStage4Question();
}

/* --------------------------
   重置
--------------------------- */
function resetStage4() {
  stage4Index = 0;
  stage4Correct = 0;
  document.getElementById("stage4-done").textContent = 0;
  loadStage4Question();
}

/* --------------------------
   煙火
--------------------------- */
function showFireworks() {
  document.getElementById("fireworks-overlay").classList.remove("hidden");
  setTimeout(() => {
    document.getElementById("fireworks-overlay").classList.add("hidden");
    resetStage4();
  }, 2500);
}
