// scripts/common.js
// 共用：WORD_BANK / activeTopics / ACTIVE_WORDS
let WORD_BANK = {};
let activeTopics = [];
let ACTIVE_WORDS = [];

// --- 語音相關 ---
let allVoices = [];
let voicesLoaded = false;

function loadVoices() {
  allVoices = window.speechSynthesis ? window.speechSynthesis.getVoices() || [] : [];
  voicesLoaded = true;
}

if ("speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

/**
 * 依語系挑選一個 voice，優先女性
 */
function pickVoice(langPrefix) {
  if (!voicesLoaded || !allVoices.length) return null;
  const candidates = allVoices.filter(v => v.lang && v.lang.toLowerCase().startsWith(langPrefix.toLowerCase()));
  if (!candidates.length) return null;

  // 優先挑名字看起來像女聲的
  const femaleKeywords = ["female", "woman", "女", "Samantha", "Karen", "Susan", "Zira", "Joana", "Shelley"];
  const female = candidates.find(v =>
    femaleKeywords.some(k => v.name.toLowerCase().includes(k.toLowerCase()))
  );
  return female || candidates[0];
}

/**
 * 朗讀文字
 * lang: "en-US" / "zh-TW" 等
 */
function speak(text, lang = "en-US") {
  if (!("speechSynthesis" in window)) return;
  if (!text) return;

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;

  // 嘗試挑一個適合的 voice
  let voice = null;
  if (lang.toLowerCase().startsWith("en")) {
    voice = pickVoice("en"); // 英文女聲
  } else if (lang.toLowerCase().startsWith("zh")) {
    // 台灣中文優先 zh-TW，其次 zh
    voice = pickVoice("zh-TW") || pickVoice("zh");
  }
  if (voice) utter.voice = voice;

  window.speechSynthesis.speak(utter);
}

/**
 * 讀取 word-bank.json，組出 activeTopics & ACTIVE_WORDS 後呼叫 callback
 */
async function loadWordBankCommon(callback) {
  try {
    const res = await fetch("word-bank.json");
    WORD_BANK = await res.json();
    console.log("字庫載入完成", WORD_BANK);

    const saved = localStorage.getItem("selectedTopics");
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        activeTopics = arr.filter((t) => WORD_BANK[t]);
      } catch (e) {
        console.warn("解析 selectedTopics 失敗", e);
        activeTopics = [];
      }
    }

    if (!activeTopics || activeTopics.length === 0) {
      activeTopics = Object.keys(WORD_BANK);
    }

    ACTIVE_WORDS = [];
    activeTopics.forEach((topic) => {
      const list = WORD_BANK[topic] || [];
      ACTIVE_WORDS = ACTIVE_WORDS.concat(list);
    });

    if (typeof callback === "function") callback();
  } catch (err) {
    console.error("讀取字庫失敗", err);
    if (typeof callback === "function") callback(err);
  }
}

/** 顯示主題與單字數（如果該頁有這兩個元素的話） */
function renderGameInfoCommon() {
  const topicText = activeTopics.join("、") || "（無主題）";
  const wordCount = ACTIVE_WORDS.length;

  const topicEl = document.getElementById("game-topics");
  const countEl = document.getElementById("game-word-count");

  if (topicEl) topicEl.textContent = topicText;
  if (countEl) countEl.textContent = String(wordCount);
}

/** 打亂陣列 */
function shuffleArray(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** 取得單字的視覺（優先 img，再來 emoji） */
function getWordVisual(word) {
  if (word.img && word.img.trim()) {
    return `<img src="${word.img}" alt="" />`;
  }
  if (word.emoji && word.emoji.trim()) {
    const firstEmoji = word.emoji.toString().split(/\s+/)[0];
    return `<span>${firstEmoji}</span>`;
  }
  return `<span>📘</span>`;
}

/** 共用煙火效果（若頁面有 fireworks-overlay 元素的話） */
function showFireworks(message = "恭喜完成！", duration = 2500) {
  const overlay = document.getElementById("fireworks-overlay");
  const textEl = document.getElementById("fireworks-text");
  if (!overlay || !textEl) return;
  textEl.textContent = message;
  overlay.classList.remove("hidden");
  setTimeout(() => {
    overlay.classList.add("hidden");
  }, duration);
}
