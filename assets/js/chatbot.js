// AS Pharmacy - Medicine/Health Chatbot Widget
// Floating button + chat window, connects to api/chatbot.php

(function () {
  // ── Inject CSS ─────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #aspharm-chat-btn {
      position: fixed;
      bottom: 110px;
      left: 24px;
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background: linear-gradient(135deg, #22c55e 0%, #15803d 100%);
      color: #fff;
      border: none;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(34, 197, 94, 0.45), 0 2px 6px rgba(0,0,0,0.3);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    #aspharm-chat-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 8px 24px rgba(34, 197, 94, 0.6), 0 2px 8px rgba(0,0,0,0.35);
    }
    #aspharm-chat-btn svg {
      width: 20px;
      height: 20px;
    }
    #aspharm-chat-btn .aspharm-pulse {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #22c55e;
      opacity: 0.5;
      animation: aspharm-pulse-anim 2.2s ease-out infinite;
      z-index: -1;
    }
    @keyframes aspharm-pulse-anim {
      0% { transform: scale(1); opacity: 0.5; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    #aspharm-chat-window {
      position: fixed;
      bottom: 168px;
      left: 24px;
      width: 350px;
      max-width: 90vw;
      height: 480px;
      max-height: 72vh;
      background: #0f172a;
      border: 1px solid rgba(34, 197, 94, 0.25);
      border-radius: 16px;
      box-shadow: 0 12px 36px rgba(0,0,0,0.5);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 9999;
      font-family: 'Segoe UI', Arial, sans-serif;
    }
    #aspharm-chat-header {
      background: linear-gradient(135deg, #16a34a 0%, #0f3d22 100%);
      color: #fff;
      padding: 14px 16px;
      font-weight: 600;
      font-size: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid rgba(34, 197, 94, 0.3);
    }
    #aspharm-chat-header .aspharm-header-icon {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: rgba(255,255,255,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    #aspharm-chat-header .aspharm-header-icon svg {
      width: 16px;
      height: 16px;
    }
    #aspharm-chat-header-text {
      flex: 1;
      line-height: 1.2;
    }
    #aspharm-chat-header-text small {
      display: block;
      font-weight: 400;
      font-size: 11px;
      opacity: 0.8;
      margin-top: 2px;
    }
    #aspharm-chat-close {
      cursor: pointer;
      font-size: 18px;
      background: none;
      border: none;
      color: #fff;
      opacity: 0.8;
      line-height: 1;
      padding: 4px;
    }
    #aspharm-chat-close:hover { opacity: 1; }
    #aspharm-chat-body {
      flex: 1;
      padding: 14px;
      overflow-y: auto;
      background: #0b1220;
      font-size: 14px;
    }
    #aspharm-chat-body::-webkit-scrollbar { width: 6px; }
    #aspharm-chat-body::-webkit-scrollbar-thumb { background: rgba(34,197,94,0.3); border-radius: 6px; }
    .aspharm-msg {
      margin-bottom: 10px;
      max-width: 85%;
      padding: 9px 13px;
      border-radius: 12px;
      line-height: 1.45;
      white-space: pre-wrap;
    }
    .aspharm-msg.user {
      background: linear-gradient(135deg, #22c55e, #15803d);
      color: #fff;
      margin-left: auto;
      border-bottom-right-radius: 3px;
    }
    .aspharm-msg.bot {
      background: #1e293b;
      color: #e2e8f0;
      margin-right: auto;
      border-bottom-left-radius: 3px;
      border: 1px solid rgba(255,255,255,0.06);
    }
    #aspharm-chat-input-area {
      display: flex;
      border-top: 1px solid rgba(34, 197, 94, 0.2);
      background: #0f172a;
      padding: 10px;
      gap: 8px;
    }
    #aspharm-chat-input {
      flex: 1;
      border: 1px solid rgba(255,255,255,0.1);
      background: #1e293b;
      color: #fff;
      padding: 10px 12px;
      font-size: 14px;
      outline: none;
      border-radius: 10px;
    }
    #aspharm-chat-input::placeholder { color: #64748b; }
    #aspharm-chat-input:focus { border-color: #22c55e; }
    #aspharm-chat-send {
      background: linear-gradient(135deg, #22c55e, #15803d);
      color: #fff;
      border: none;
      padding: 0 18px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      border-radius: 10px;
      transition: opacity 0.2s;
    }
    #aspharm-chat-send:hover { opacity: 0.9; }
    #aspharm-chat-send:disabled { opacity: 0.5; cursor: not-allowed; }
  `;
  document.head.appendChild(style);

  // ── Inject HTML ────────────────────────────────────────────
  const btn = document.createElement('button');
  btn.id = 'aspharm-chat-btn';
  btn.innerHTML = `
    <span class="aspharm-pulse"></span>
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 5.94 2 10.8c0 2.7 1.4 5.1 3.6 6.7-.1.9-.5 2.4-1.5 3.8-.2.3 0 .7.4.6 2-.4 3.7-1.3 4.8-2 1 .3 2.1.4 3.2.4 5.52 0 10-3.94 10-8.8S17.52 2 12 2z" fill="white"/>
      <circle cx="8.5" cy="10.8" r="1.2" fill="#15803d"/>
      <circle cx="12" cy="10.8" r="1.2" fill="#15803d"/>
      <circle cx="15.5" cy="10.8" r="1.2" fill="#15803d"/>
    </svg>
  `;
  document.body.appendChild(btn);

  const win = document.createElement('div');
  win.id = 'aspharm-chat-window';
  win.innerHTML = `
    <div id="aspharm-chat-header">
      <div class="aspharm-header-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4z" fill="white"/>
          <path d="M12 7v6M9 10h6" stroke="#15803d" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      </div>
      <div id="aspharm-chat-header-text">
        Medicine &amp; Health Assistant
        <small>AS Pharmacy • Always here to help</small>
      </div>
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