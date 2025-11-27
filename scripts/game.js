// scripts/game.js
let WORD_BANK = {};
let activeTopics = [];
let ACTIVE_WORDS = [];

// 讀取字庫 + 決定要用哪些主題
async function loadWordBank() {
  try {
    const res = await fetch('word-bank.json');
    WORD_BANK = await res.json();
    console.log('game 字庫載入完成：', WORD_BANK);

    // 讀取首頁選擇的主題
    const saved = localStorage.getItem('selectedTopics');
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        // 過濾掉不存在於字庫的主題
        activeTopics = arr.filter(t => WORD_BANK[t]);
      } catch (e) {
        console.warn('解析 selectedTopics 失敗', e);
        activeTopics = [];
      }
    }

    // 如果沒有選到主題，就預設全部主題
    if (!activeTopics || activeTopics.length === 0) {
      activeTopics = Object.keys(WORD_BANK);
    }

    // 根據 activeTopics 合併單字清單
    ACTIVE_WORDS = buildActiveWordList();

    renderGameIntro();
  } catch (err) {
    console.error('無法讀取 word-bank.json：', err);
    const stage = document.getElementById('stage-section');
    if (stage) {
      stage.innerHTML = '<p>載入字庫失敗。</p>';
    }
  }
}

// 合併所有選擇主題的單字
function buildActiveWordList() {
  let all = [];
  activeTopics.forEach(topic => {
    const list = WORD_BANK[topic] || [];
    all = all.concat(list);
  });
  return all;
}

// 目前先顯示簡單的說明，之後再接四個小遊戲畫面
function renderGameIntro() {
  const stage = document.getElementById('stage-section');
  if (!stage) return;

  const topicText = activeTopics.join('、') || '（無主題）';
  const wordCount = ACTIVE_WORDS.length;

  stage.innerHTML = `
    <div class="game-intro">
      <h2>準備開始遊戲！</h2>
      <p>你目前選擇的主題：<strong>${topicText}</strong></p>
      <p>合計單字數：<strong>${wordCount}</strong> 個</p>
      <p>接下來這些單字會用在 4 個小遊戲裡。</p>
      <p class="game-intro-note">（之後這裡會換成：第一階段、第二階段、第三階段、第四階段的遊戲畫面切換區。）</p>
      <p><a href="index.html">↩ 回到主題選擇</a></p>
    </div>
  `;
}

window.addEventListener('DOMContentLoaded', loadWordBank);
