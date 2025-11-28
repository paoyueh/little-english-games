// scripts/stage4.js
// 第 4 階段：火車載貨拼單字遊戲

// 會用到 common.js 裡的：
// - loadWordBankCommon(callback)
// - renderGameInfoCommon()
// - shuffleArray(arr)
// - getWordVisual(word)
// - speak(text, lang)
// - showFireworks(message, duration)
// - ACTIVE_WORDS （依主題過濾後的單字清單）

let STAGE4_QUESTIONS = [];
let STAGE4_CURRENT_INDEX = 0;
let STAGE4_CORRECT_COUNT = 0;
let STAGE4_CURRENT_WORD = null;
let STAGE4_TARGET_EN = "";

// DOM 元素快取
let elImg;
let elZh;
let elTrain;
let elTrainCars;
let elLetterPool;
let elBtnStart;
let elBtnReset;
let elProgress;
let elDone;
let elAudioBtn;

/** 初始化整個第四階段（在字庫載入完成後呼叫） */
function initStage4Game() {
  // 抓 DOM
  elImg = document.getElementById("stage4-img");
  elZh = document.getElementById("stage4-zh");
  elTrain = document.getElementById("stage4-train");
  elTrainCars = document.getElementById("stage4-train-cars");
  elLetterPool = document.getElementById("stage4-letter-pool");
  elBtnStart = document.getElementById("stage4-start");
  elBtnReset = document.getElementById("stage4-reset");
  elProgress = document.getElementById("stage4-progress");
  elDone = document.getElementById("stage4-done");
  elAudioBtn = document.getElementById("stage4-audio-btn");

  if (!ACTIVE_WORDS || !ACTIVE_WORDS.length) {
    console.error("ACTIVE_WORDS 為空，無法進行遊戲");
    elProgress.textContent = "目前沒有可玩的單字，請先在首頁勾選主題。";
    elBtnStart.disabled = true;
    elBtnReset.disabled = true;
    if (elAudioBtn) elAudioBtn.disabled = true;
    return;
  }

  // 建立題庫：打亂後取前 10 題
  STAGE4_QUESTIONS = shuffleArray(ACTIVE_WORDS).slice(0, 10);
  STAGE4_CURRENT_INDEX = 0;
  STAGE4_CORRECT_COUNT = 0;

  updateDoneDisplay();
  bindStage4Events();
  loadNextStage4Question();
}

/** 題目右上角「已裝滿的火車」顯示 */
function updateDoneDisplay() {
  if (elDone) {
    elDone.textContent = `${STAGE4_CORRECT_COUNT} / ${STAGE4_QUESTIONS.length}`;
  }
}

/** 綁定按鈕與喇叭事件 */
function bindStage4Events() {
  if (elBtnStart) {
    elBtnStart.addEventListener("click", handleStage4Start);
  }
  if (elBtnReset) {
    elBtnReset.addEventListener("click", resetStage4Game);
  }
  if (elAudioBtn) {
    elAudioBtn.addEventListener("click", (e) => {
      e.preventDefault();
      playStage4QuestionAudio();
    });
  }
}

/** 重新開始本階段（重新抽題目） */
function resetStage4Game() {
  STAGE4_QUESTIONS = shuffleArray(ACTIVE_WORDS).slice(0, 10);
  STAGE4_CURRENT_INDEX = 0;
  STAGE4_CORRECT_COUNT = 0;
  updateDoneDisplay();
  loadNextStage4Question();
}

/** 讀取下一題，如果結束就放煙火 */
function loadNextStage4Question() {
  // 清除火車動畫狀態
  elTrain.classList.remove("train-move", "train-flash");

  if (STAGE4_CURRENT_INDEX >= STAGE4_QUESTIONS.length) {
    // 全部答完
    showFireworks("今天的火車載貨完成啦！", 3000);
    elProgress.textContent = "全部題目都完成囉，可以按「重新開始」再玩一次！";
    return;
  }

  const word = STAGE4_QUESTIONS[STAGE4_CURRENT_INDEX];
  STAGE4_CURRENT_WORD = word;
  STAGE4_CURRENT_INDEX += 1;

  // 題目進度顯示
  elProgress.textContent = `第 ${STAGE4_CURRENT_INDEX} 題 / 共 ${STAGE4_QUESTIONS.length} 題`;

  // 顯示圖片 / emoji
  elImg.innerHTML = getWordVisual(word);

  // 顯示中文（盡量支援不同欄位名稱）
  const zh =
    word.zh ||
    word.zhTW ||
    word.cn ||
    word.chinese ||
    word["中文"] ||
    "——";
  elZh.textContent = zh;

  // 目標英文單字（轉大寫，只留下 A-Z）
  const rawEn =
    word.en || word.english || word.word || word["英文"] || word["English"];
  const target = (rawEn || "").toString().toUpperCase().replace(/[^A-Z]/g, "");
  STAGE4_TARGET_EN = target;

  // 建車廂 & 字母卡
  buildTrainAndLetters(target);

  // 自動播放一次題目發音
  playStage4QuestionAudio();
}

/** 產生車廂格子與下方字母卡 */
function buildTrainAndLetters(target) {
  elTrainCars.innerHTML = "";
  elLetterPool.innerHTML = "";

  const letters = target.split("");
  // 這個陣列記錄每個車廂目前放哪個字母按鈕
  const slotLetters = new Array(letters.length).fill(null);

  // 建立車廂格
  letters.forEach((_, idx) => {
    const slot = document.createElement("button");
    slot.className = "letter-slot";
    slot.dataset.index = String(idx);
    slot.textContent = ""; // 一開始是空的
    slot.addEventListener("click", () => {
      const btn = slotLetters[idx];
      if (!btn) return;
      slotLetters[idx] = null;
      slot.textContent = "";
      btn.dataset.inSlot = "false";
      elLetterPool.appendChild(btn);
    });
    elTrainCars.appendChild(slot);
  });

  // 下方字母先打亂
  const shuffledLetters = shuffleArray(letters);

  shuffledLetters.forEach((ch) => {
    const btn = document.createElement("button");
    btn.className = "letter-tile big-letter";
    btn.textContent = ch;
    btn.dataset.inSlot = "false";

    btn.addEventListener("click", () => {
      if (btn.dataset.inSlot === "true") return;
      const idx = slotLetters.findIndex((v) => v === null);
      if (idx === -1) {
        // 車廂已滿就不處理
        return;
      }
      slotLetters[idx] = btn;
      btn.dataset.inSlot = "true";
      const slot = elTrainCars.querySelector(
        `.letter-slot[data-index="${idx}"]`
      );
      if (slot) {
        slot.textContent = ch;
      }
      elLetterPool.removeChild(btn);
    });

    elLetterPool.appendChild(btn);
  });

  // 把這兩個陣列存在 train DOM 上，出發時方便計算答案
  elTrain.dataset.slotLetters = JSON.stringify(
    new Array(letters.length).fill("")
  );
  // 因為上面直接存 element 不好序列化，我們改在判斷答案時從 DOM 讀
}

/** 出發按鈕：判斷正確 / 錯誤並觸發動畫 */
function handleStage4Start() {
  if (!STAGE4_CURRENT_WORD || !STAGE4_TARGET_EN) return;

  // 從車廂讀取目前拼出的字
  const slots = Array.from(
    elTrainCars.querySelectorAll(".letter-slot")
  );
  const userAnswer = slots
    .map((s) => s.textContent || "")
    .join("")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

  const isCorrect =
    userAnswer.length === STAGE4_TARGET_EN.length &&
    userAnswer === STAGE4_TARGET_EN;

  if (isCorrect) {
    STAGE4_CORRECT_COUNT += 1;
    updateDoneDisplay();
    animateTrainSuccess();
  } else {
    animateTrainFail();
  }
}

/** 答對：火車往左開到畫面外，然後換下一題 */
function animateTrainSuccess() {
  elTrain.classList.remove("train-flash");
  elTrain.classList.add("train-move");

  // 動畫在 CSS 設定 0.8s，這邊抓 900ms 再換題
  setTimeout(() => {
    elTrain.classList.remove("train-move");
    loadNextStage4Question();
  }, 900);
}

/** 答錯：整列火車閃一下，兩秒後換下一題 */
function animateTrainFail() {
  elTrain.classList.remove("train-move");
  elTrain.classList.add("train-flash");

  setTimeout(() => {
    elTrain.classList.remove("train-flash");
    loadNextStage4Question();
  }, 2000);
}

/** 播放目前題目的英文發音（給喇叭按鈕與出題時使用） */
function playStage4QuestionAudio() {
  if (!STAGE4_CURRENT_WORD) return;
  const rawEn =
    STAGE4_CURRENT_WORD.en ||
    STAGE4_CURRENT_WORD.english ||
    STAGE4_CURRENT_WORD.word ||
    STAGE4_CURRENT_WORD["英文"] ||
    STAGE4_CURRENT_WORD["English"];
  if (!rawEn) return;
  speak(rawEn.toString(), "en-US");
}

// ---- 進入點：載入字庫後啟動本關 ----

window.addEventListener("DOMContentLoaded", () => {
  // 先載入字庫 & 主題，成功後會填好 ACTIVE_WORDS / activeTopics
  loadWordBankCommon((err) => {
    if (err) {
      console.error("載入字庫失敗", err);
      const p = document.getElementById("stage4-progress");
      if (p) p.textContent = "字庫載入失敗，請重新整理頁面。";
      return;
    }

    // 顯示左側「主題 / 單字數」資訊
    renderGameInfoCommon();

    // 啟動第四階段主程式
    initStage4Game();
  });
});
