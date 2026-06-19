// AS Pharmacy - Medicine/Health Chatbot Widget
// Floating button + chat window, connects to api/chatbot.php

(function () {
  // ── Inject CSS ─────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #aspharm-chat-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #16a34a;
      color: #fff;
      border: none;
      cursor: pointer;
      font-size: 26px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #aspharm-chat-window {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 340px;
      max-width: 90vw;
      height: 460px;
      max-height: 70vh;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 9999;
      font-family: Arial, sans-serif;
    }
    #aspharm-chat-header {
      background: #16a34a;
      color: #fff;
      padding: 12px 16px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    #aspharm-chat-close {
      cursor: pointer;
      font-size: 18px;
      background: none;
      border: none;
      color: #fff;
    }
    #aspharm-chat-body {
      flex: 1;
      padding: 12px;
      overflow-y: auto;
      background: #f4f6f8;
      font-size: 14px;
    }
    .aspharm-msg {
      margin-bottom: 10px;
      max-width: 85%;
      padding: 8px 12px;
      border-radius: 10px;
      line-height: 1.4;
      white-space: pre-wrap;
    }
    .aspharm-msg.user {
      background: #16a34a;
      color: #fff;
      margin-left: auto;
      border-bottom-right-radius: 2px;
    }
    .aspharm-msg.bot {
      background: #e5e7eb;
      color: #111;
      margin-right: auto;
      border-bottom-left-radius: 2px;
    }
    #aspharm-chat-input-area {
      display: flex;
      border-top: 1px solid #ddd;
    }
    #aspharm-chat-input {
      flex: 1;
      border: none;
      padding: 10px;
      font-size: 14px;
      outline: none;
    }
    #aspharm-chat-send {
      background: #16a34a;
      color: #fff;
      border: none;
      padding: 0 16px;
      cursor: pointer;
      font-size: 14px;
    }
  `;
  document.head.appendChild(style);

  // ── Inject HTML ────────────────────────────────────────────
  const btn = document.createElement('button');
  btn.id = 'aspharm-chat-btn';
  btn.innerHTML = '💬';
  document.body.appendChild(btn);

  const win = document.createElement('div');
  win.id = 'aspharm-chat-window';
  win.innerHTML = `
    <div id="aspharm-chat-header">
      <span>Medicine & Health Assistant</span>
      <button id="aspharm-chat-close">✕</button>
    </div>
    <div id="aspharm-chat-body"></div>
    <div id="aspharm-chat-input-area">
      <input id="aspharm-chat-input" type="text" placeholder="Sawal likhein..." />
      <button id="aspharm-chat-send">Send</button>
    </div>
  `;
  document.body.appendChild(win);

  const body = win.querySelector('#aspharm-chat-body');
  const input = win.querySelector('#aspharm-chat-input');
  const sendBtn = win.querySelector('#aspharm-chat-send');
  const closeBtn = win.querySelector('#aspharm-chat-close');

  function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = 'aspharm-msg ' + sender;
    msg.textContent = text;
    body.appendChild(msg);
    body.scrollTop = body.scrollHeight;
  }

  // Welcome message on first open
  let opened = false;
  btn.addEventListener('click', () => {
    win.style.display = win.style.display === 'flex' ? 'none' : 'flex';
    if (win.style.display === 'flex') input.focus();
    if (!opened) {
      addMessage('Assalam-o-Alaikum! Aap mujh se medicine ya health se related koi bhi sawal pooch sakte hain.', 'bot');
      opened = true;
    }
  });

  closeBtn.addEventListener('click', () => {
    win.style.display = 'none';
  });

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    input.value = '';
    sendBtn.disabled = true;

    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'aspharm-msg bot';
    loadingMsg.textContent = 'Likh raha hoon...';
    body.appendChild(loadingMsg);
    body.scrollTop = body.scrollHeight;

    try {
      const res = await fetch('api/chatbot.php?action=ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      loadingMsg.remove();

      if (data && data.success && data.reply) {
        addMessage(data.reply, 'bot');
      } else if (data && data.message) {
        addMessage('Error: ' + data.message, 'bot');
      } else {
        addMessage('Maaf kijiye, jawab nahi mil saka. Dobara koshish karein.', 'bot');
      }
    } catch (err) {
      loadingMsg.remove();
      addMessage('Connection error. Dobara koshish karein.', 'bot');
    }

    sendBtn.disabled = false;
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
})();