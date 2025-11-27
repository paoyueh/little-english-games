// scripts/stage2.js

let stage2CurrentPairs = [];
let stage2FirstCard = null;
let stage2MatchedCount = 0;

function initStage2Page() {
  renderGameInfoCommon();
  document
    .getElementById("stage2-restart")
    .addEventListener("click", () => startStage2Round());
  startStage2Round();
}

function startStage2Round() {
  const statusEl = document.getElementById("stage2-status");
  const feedbackEl = document.getElementById("stage2-feedback");
  const grid = document.getElementById("stage2-grid");

  stage2FirstCard = null;
  stage2MatchedCount = 0;
  feedbackEl.textContent = "";
  statusEl.textContent = "本局共有 6 組中英配對，試著全部配對成功！";

  const shuffled = shuffleArray(ACTIVE_WORDS);
  stage2CurrentPairs = shuffled.slice(0, Math.min(6, shuffled.length));

  // 生成 12 張卡片（6 中文＋6 英文）
  grid.innerHTML = "";
  const cards = [];

  stage2CurrentPairs.forEach((w, idx) => {
    const zhCard = {
      id: `w${idx}`,
      type: "zh",
      word: w
    };
    const enCard = {
      id: `w${idx}`,
      type: "en",
      word: w
    };
    cards.push(zhCard, enCard);
  });

  const finalCards = shuffleArray(cards);

  finalCards.forEach((c) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "match-card " + (c.type === "zh" ? "match-card-zh" : "match-card-en");
    btn.dataset.wordId = c.id;
    btn.dataset.cardType = c.type;

    if (c.type === "zh") {
      // 中文：保留配圖，無「中文」標籤
      const emojiVisual = getWordVisual(c.word);
      btn.innerHTML = `
        <div class="match-card-inner">
          <div class="match-icon">${emojiVisual}</div>
          <div><strong>${c.word.zh}</strong></div>
        </div>
      `;
    } else {
      // 英文：只有英文，不配圖、不標示「英文」
      btn.innerHTML = `
        <div class="match-card-inner">
          <div><strong>${c.word.en}</strong></div>
        </div>
      `;
    }

    btn.addEventListener("click", () => onStage2CardClick(btn, c.word));
    grid.appendChild(btn);
  });
}

function onStage2CardClick(btn, word) {
  if (btn.classList.contains("matched")) return;

  // 朗讀
  const type = btn.dataset.cardType;
  if (type === "en") {
    speak(word.en, "en-US");
  } else {
    speak(word.zh, "zh-TW");
  }

  const feedbackEl = document.getElementById("stage2-feedback");

  if (!stage2FirstCard) {
    stage2FirstCard = btn;
    btn.classList.add("selected");
    feedbackEl.textContent = "再選一張來試試是否能成功配對。";
    feedbackEl.classList.remove("error");
    feedbackEl.classList.remove("ok");
    return;
  }

  if (btn === stage2FirstCard) {
    btn.classList.remove("selected");
    stage2FirstCard = null;
    feedbackEl.textContent = "";
    return;
  }

  const firstWordId = stage2FirstCard.dataset.wordId;
  const firstType = stage2FirstCard.dataset.cardType;
  const secondWordId = btn.dataset.wordId;
  const secondType = btn.dataset.cardType;

  if (firstWordId === secondWordId && firstType !== secondType) {
    // 配對成功
    stage2FirstCard.classList.remove("selected");
    stage2FirstCard.classList.add("matched");
    btn.classList.add("matched");
    btn.classList.remove("selected");

    stage2MatchedCount++;
    feedbackEl.textContent = "配對成功！繼續努力！";
    feedbackEl.classList.remove("error");
    feedbackEl.classList.add("ok");
    speak("Great job!", "en-US");

    stage2FirstCard = null;

    if (stage2MatchedCount === stage2CurrentPairs.length) {
      const statusEl = document.getElementById("stage2-status");
      statusEl.textContent = "本局全部配對完成！太厲害了～";
      showFireworks("🎆 太厲害了！本局配對完成！", 2800);
    }
  } else {
    // 配對錯誤
    stage2FirstCard.classList.remove("selected");
    btn.classList.add("selected");
    feedbackEl.textContent = "這兩張不是同一組，再試一次喔～";
    feedbackEl.classList.remove("ok");
    feedbackEl.classList.add("error");
    speak("Try again! 再試一次！", "en-US");
    const prev = stage2FirstCard;
    stage2FirstCard = null;
    setTimeout(() => {
      prev.classList.remove("selected");
      btn.classList.remove("selected");
    }, 600);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadWordBankCommon(() => {
    initStage2Page();
  });
});
