// scripts/home.js
let WORD_BANK = {};
let selectedTopics = new Set();

// 初始化：讀取字庫 + 畫出主題卡片
async function loadWordBankForHome() {
  try {
    const res = await fetch('word-bank.json');
    WORD_BANK = await res.json();
    console.log('Home 字庫載入完成', WORD_BANK);

    renderTopicCards();
    setupButtons();
  } catch (err) {
    console.error('讀取 word-bank.json 失敗：', err);
    const grid = document.getElementById('topic-grid');
    if (grid) {
      grid.innerHTML = '<p>載入字庫失敗，請稍後再試。</p>';
    }
  }
}

// 由字庫抓一個代表 emoji（優先用第一個單字的 emoji）
function getTopicEmoji(topicName) {
  const list = WORD_BANK[topicName] || [];
  if (list.length > 0 && list[0].emoji) {
    // 如果是多個 emoji，用第一個
    return list[0].emoji.toString().split(/\s+/)[0];
  }
  // 沒有就給一個通用圖示
  if (topicName.toLowerCase().includes('weather') || topicName.includes('天氣')) return '🌤️';
  if (topicName.toLowerCase().includes('animal') || topicName.includes('動物')) return '🐾';
  if (topicName.toLowerCase().includes('fruit') || topicName.includes('水果')) return '🍎';
  if (topicName.toLowerCase().includes('family') || topicName.includes('家庭')) return '👨‍👩‍👧‍👦';
  return '📚';
}

// 畫出主題方框卡片
function renderTopicCards() {
  const grid = document.getElementById('topic-grid');
  if (!grid) return;

  grid.innerHTML = '';

  const topics = Object.keys(WORD_BANK);
  if (topics.length === 0) {
    grid.innerHTML = '<p>目前尚未有主題。</p>';
    return;
  }

  topics.forEach(topicName => {
    const card = document.createElement('div');
    card.className = 'topic-card';
    card.dataset.topic = topicName;

    const emojiDiv = document.createElement('div');
    emojiDiv.className = 'topic-emoji';
    emojiDiv.textContent = getTopicEmoji(topicName);

    const infoDiv = document.createElement('div');
    infoDiv.className = 'topic-info';

    const title = document.createElement('div');
    title.className = 'topic-title';
    title.textContent = topicName;

    const count = document.createElement('div');
    count.className = 'topic-count';
    const words = WORD_BANK[topicName] || [];
    count.textContent = `單字數：${words.length}`;

    const selectedTag = document.createElement('div');
    selectedTag.className = 'topic-selected-tag';
    selectedTag.textContent = '✔ 已選取';

    infoDiv.appendChild(title);
    infoDiv.appendChild(count);
    infoDiv.appendChild(selectedTag);

    card.appendChild(emojiDiv);
    card.appendChild(infoDiv);

    card.addEventListener('click', () => toggleTopicSelection(topicName, card));
    grid.appendChild(card);
  });

  // 如果之前 localStorage 有選過主題，就自動還原
  const saved = localStorage.getItem('selectedTopics');
  if (saved) {
    try {
      const arr = JSON.parse(saved);
      arr.forEach(topic => {
        if (WORD_BANK[topic]) {
          selectedTopics.add(topic);
          const card = grid.querySelector(`.topic-card[data-topic="${topic}"]`);
          if (card) card.classList.add('selected');
        }
      });
    } catch (e) {
      console.warn('無法解析已儲存的 selectedTopics', e);
    }
  }

  updateStartButtonState();
}

// 點選主題卡片：選／取消
function toggleTopicSelection(topicName, cardElement) {
  if (selectedTopics.has(topicName)) {
    selectedTopics.delete(topicName);
    cardElement.classList.remove('selected');
  } else {
    selectedTopics.add(topicName);
    cardElement.classList.add('selected');
  }

  localStorage.setItem('selectedTopics', JSON.stringify(Array.from(selectedTopics)));
  updateStartButtonState();
}

// 控制「進入遊戲」按鈕是否可按
function updateStartButtonState() {
  const btn = document.getElementById('startGameBtn');
  if (!btn) return;
  btn.disabled = selectedTopics.size === 0;
}

// 設定按鈕事件
function setupButtons() {
  const startBtn = document.getElementById('startGameBtn');
  const resetBtn = document.getElementById('resetSelectionBtn');

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (selectedTopics.size === 0) {
        alert('請先選擇至少一個主題！');
        return;
      }
      localStorage.setItem('selectedTopics', JSON.stringify(Array.from(selectedTopics)));
      window.location.href = 'game.html';
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      selectedTopics.clear();
      localStorage.removeItem('selectedTopics');

      const grid = document.getElementById('topic-grid');
      if (grid) {
        grid.querySelectorAll('.topic-card.selected').forEach(card => {
          card.classList.remove('selected');
        });
      }
      updateStartButtonState();
    });
  }
}

window.addEventListener('DOMContentLoaded', loadWordBankForHome);
