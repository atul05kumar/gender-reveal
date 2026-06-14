/* ====================================================
   GENDER REVEAL — script.js
   ====================================================

   ┌─────────────────────────────────────────────────┐
   │  ⚙️  CONFIGURATION — edit this section only     │
   └─────────────────────────────────────────────────┘ */

const CONFIG = {

  /* ── Reveal ──────────────────────────────────────
   * Set to 'girl' or 'boy'                          */
  gender: 'boy',

  /* Optional baby name shown on the reveal screen.
   * Leave as '' if you're not announcing the name.  */
  babyName: '',

  /* Your names, shown on the reveal screen.         */
  parents: 'Devina & Atul',

  /* ── Questions ──────────────────────────────────
   *
   * Each correct answer awards one rewardDigit.
   * The master key is all rewardDigits joined in order
   * (e.g. digits 4,8,1,5,9 → masterKey "48159").
   *
   * Answers are compared case-insensitively.
   *
   * FOR EXTRA SECURITY (optional):
   *   Open the browser console (F12 → Console) and run:
   *     sha256('your answer').then(h => console.log(h))
   *   Copy the resulting hex string, paste it as the
   *   `answer` value, then add  isHashed: true  to
   *   that question object. The plaintext is never
   *   stored; only the hash is compared at runtime.
   *                                                 */
  questions: [
    {
      question:    'What is Lucky\'s favourite comfort food?',
      hint:        'It takes only one pot and 3 ingredients 🥘',
      answer:      'khichdi',
      rewardDigit: '2',
      rewardMsg:   'Lucky can eat Khichdi any day, best comfort food ever! First digit unlocked!'
    },
    {
      question:    'What color is Shalu\'s favourite?',
      hint:        'Look at the decoration, its all over the place 🌈',
      answer:      'pink',
      rewardDigit: '9',
      rewardMsg:   'Baby Girl or Baby Boy, Pink is forever! Second digit unlocked!'
    },
    {
      question:    'You can call me Lucky, You can call me Atul or You can call me?',
      hint:        'Only Sisters are allowed to call me that 🫶',
      answer:      'gutti',
      rewardDigit: '0',
      rewardMsg:   'Gutti! Gutti! O mere Gutkania! Third digit unlocked!'
    },
    {
      question:    'We took the phrase \'celebrate good times\' a little too literally on a wedding day. Who is the person that shares his anniversary with our kid\'s conception date?',
      hint:        'Think Medical, Think Hard, they are close and not so far! 🤵👰',
      answer:      'rishu',
      rewardDigit: '5',
      rewardMsg:   'Balle Balle, Aaj mere sale ki shadi hai! Fourth digit unlocked!'
    },
    {
      question:    'You attended our wedding. You saw the photos. You probably liked the posts. But do you remember the hashtag that tied it all together?',
      hint:        'Our hashtag for our happily-ever-after! 🤵👰',
      answer:      '#shalugotlucky',
      rewardDigit: '0',
      rewardMsg:   'Haha You got it! Hashtag was to make finding photos easier. Years later, who knew it will become a memory test for family! Fifth digit unlocked!'
    },
    {
      question:    'One woman in our family dreams of flawless glass skin, while another could probably identify a boy band member from three pixels. Which country has clearly taken over this household?',
      hint:        'We Hope you cook something with Sugar tonight! 🎸',
      answer:      'korea',
      rewardDigit: '3',
      rewardMsg:   'There you go, BTS ARMY! Sixth digit unlocked!'
    },
    {
      question:    'When I flew thousands of miles to meet Shalu, I brought her flowers. We were so busy being excited that we nearly donated them to the airport lost-and-found. Guess the flower?',
      hint:        '🌸🌺🌼🌻🌷🌹!',
      answer:      'rose',
      rewardDigit: '0',
      rewardMsg:   'Well Roses are red, and violets are blue, you got it right, good for YOU! Seventh digit unlocked!'
    },
    {
      question:    'Before we knew whether we\'d be welcoming a prince or a princess, we had already started auditioning nicknames. Which boy name was the first contestant we introduced to the family?',
      hint:        'Memories fade but WhatsApp chats don\'t!',
      answer:      'vedu',
      rewardDigit: '9',
      rewardMsg:   'Woohooo! Your fingers were fast, and the next question is second last! Eighth digit unlocked!'
    },
    {
      question:    'Our little one has a favorite number, and it\'s hiding in plain sight! Take Shalu\'s current pregnancy week, add the digits together, and if needed, add them again until only one digit remains. What number does baby choose?',
      hint:        'To get to it, you got to do some numbers!',
      answer:      'two',
      rewardDigit: '2',
      rewardMsg:   'Woohooo! You got 2 it!'
    },
    {
      question:    'Before learning to walk, talk, or even be born, our baby apparently decided to help with our social media bios — they tried their best but left a spelling mistake. One word in our social media bio is misspelled by our tiniest editor. What is the word?',
      hint:        'Well, keep your eyes and our profiles open!',
      answer:      'devlovement',
      rewardDigit: '6',
      rewardMsg:   'All digits collected — you\'ve cracked the code! Final digit unlocked!'
    },
  ]
};

/* ── End of configuration ─────────────────────────── */
/* ====================================================
   Everything below is engine code — no need to edit.
   ==================================================== */

/* ── State ─────────────────────────────────────────── */
const S = {
  currentQ:      0,
  collected:     [],       // digits earned so far
  answerHashes:  [],       // SHA-256 of each answer (pre-computed at init)
  masterKeyHash: '',       // SHA-256 of the full master key
};

/* ── Audio ─────────────────────────────────────────── */
/* GitHub Pages blocks audio/video media types (403 MediaTypeBlocked).
   Files are served via jsDelivr CDN which proxies them from the GitHub
   repo without the media-type restriction.                             */
const CDN = 'https://cdn.jsdelivr.net/gh/atul05kumar/gender-reveal@main/assets/';

const bgAudio       = new Audio(CDN + 'gender-reveal-background.mp3');
bgAudio.loop        = true;
bgAudio.volume      = 0.6;

const drumrollAudio = new Audio(CDN + 'drumroll.mp3');
drumrollAudio.loop  = false;
drumrollAudio.volume = 0.9;

function playBg()       { bgAudio.play().catch(() => {}); }
function pauseBg()      { bgAudio.pause(); }
function stopDrumroll() { drumrollAudio.pause(); drumrollAudio.currentTime = 0; }

/* ── SHA-256 via SubtleCrypto ──────────────────────── */
async function sha256(str) {
  const buf  = new TextEncoder().encode(str.trim().toLowerCase());
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/* ══════════════════════════════════════════════════════
   CONFETTI ENGINE
══════════════════════════════════════════════════════ */

const canvas   = document.getElementById('confetti-canvas');
const ctx2     = canvas.getContext('2d');
let particles  = [];
let cfRAF      = null;
let cfRainTimer = null;

const GIRL_PAL = ['#f9a8d4','#ec4899','#f472b6','#fce7f3','#be185d','#fbbf24','#fff','#fbcfe8'];
const BOY_PAL  = ['#93c5fd','#3b82f6','#60a5fa','#dbeafe','#1d4ed8','#fbbf24','#fff','#bfdbfe'];

function pal() { return CONFIG.gender === 'girl' ? GIRL_PAL : BOY_PAL; }

function resizeCv() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCv);
resizeCv();

/* shapes: 'rect', 'circle', 'star' */
const SHAPES = ['rect','rect','rect','circle','circle','star'];

function spawnParticles(n, fromCenter = false) {
  const colors = pal();
  for (let i = 0; i < n; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = fromCenter ? 8 + Math.random() * 22 : 0;
    particles.push({
      x:    fromCenter ? canvas.width / 2 : Math.random() * canvas.width,
      y:    fromCenter ? canvas.height / 2 : -8 - Math.random() * canvas.height * 0.5,
      vx:   fromCenter ? Math.cos(angle) * speed : (Math.random() - 0.5) * 4.5,
      vy:   fromCenter ? Math.sin(angle) * speed - 12 : 2 + Math.random() * 5,
      w:    6 + Math.random() * 11,
      h:    3 + Math.random() * 7,
      rot:  Math.random() * Math.PI * 2,
      rV:   (Math.random() - 0.5) * 0.28,
      col:  colors[Math.floor(Math.random() * colors.length)],
      shp:  SHAPES[Math.floor(Math.random() * SHAPES.length)],
      op:   1,
      grav: fromCenter ? 0.3 + Math.random() * 0.28 : 0.11,
    });
  }
  if (!cfRAF) cfRAF = requestAnimationFrame(cfTick);
}

function cfTick() {
  ctx2.clearRect(0, 0, canvas.width, canvas.height);
  particles = particles.filter(p => p.op > 0.01 && p.y < canvas.height + 30);

  for (const p of particles) {
    p.x  += p.vx;
    p.y  += p.vy;
    p.vy += p.grav;
    p.vx *= 0.99;
    p.rot += p.rV;
    if (p.y > canvas.height * 0.62) p.op -= 0.006;

    ctx2.save();
    ctx2.globalAlpha = p.op;
    ctx2.translate(p.x, p.y);
    ctx2.rotate(p.rot);
    ctx2.fillStyle = p.col;

    if (p.shp === 'circle') {
      ctx2.beginPath();
      ctx2.arc(0, 0, p.w / 2, 0, Math.PI * 2);
      ctx2.fill();
    } else if (p.shp === 'star') {
      drawStar(ctx2, p.w / 2, p.w / 4);
    } else {
      ctx2.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    }
    ctx2.restore();
  }

  cfRAF = particles.length ? requestAnimationFrame(cfTick) : null;
}

function drawStar(c, outerR, innerR, spikes = 5) {
  let rot = -Math.PI / 2;
  const step = Math.PI / spikes;
  c.beginPath();
  c.moveTo(Math.cos(rot) * outerR, Math.sin(rot) * outerR);
  for (let i = 0; i < spikes; i++) {
    rot += step;
    c.lineTo(Math.cos(rot) * innerR, Math.sin(rot) * innerR);
    rot += step;
    c.lineTo(Math.cos(rot) * outerR, Math.sin(rot) * outerR);
  }
  c.closePath();
  c.fill();
}

function startConfettiRain() {
  spawnParticles(380, true);                           // big center burst
  cfRainTimer = setInterval(() => spawnParticles(65), 850);
  setTimeout(() => clearInterval(cfRainTimer), 30000);
}

/* ══════════════════════════════════════════════════════
   AMBIENT ENVIRONMENT
══════════════════════════════════════════════════════ */

function buildAmbient() {
  const container = document.getElementById('particles');
  const orbColors = ['#c084fc','#f472b6','#818cf8','#a78bfa','#fb7185','#60a5fa','#34d399'];

  /* Floating colour orbs */
  for (let i = 0; i < 8; i++) {
    const el = document.createElement('div');
    el.className = 'orb';
    const s  = 180 + Math.random() * 340;
    const tx = (Math.random() - 0.5) * 110;
    const ty = (Math.random() - 0.5) * 90;
    el.style.cssText = `
      width:${s}px; height:${s}px;
      background:${orbColors[i % orbColors.length]};
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      --d:${14 + Math.random() * 18}s;
      --tx:${tx}px; --ty:${ty}px;
      --s:${0.82 + Math.random() * 0.36};
      animation-delay:${-Math.random() * 22}s;
    `;
    container.appendChild(el);
  }

  /* Twinkling stars */
  for (let i = 0; i < 80; i++) {
    const el = document.createElement('div');
    el.className = 'star';
    const sz = 1 + Math.random() * 2.8;
    el.style.cssText = `
      width:${sz}px; height:${sz}px;
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      --d:${2 + Math.random() * 5}s;
      animation-delay:${-Math.random() * 7}s;
    `;
    container.appendChild(el);
  }
}

/* ══════════════════════════════════════════════════════
   SCREEN TRANSITIONS
══════════════════════════════════════════════════════ */

function goTo(id, delay = 0) {
  const cur  = document.querySelector('.screen.active');
  const next = document.getElementById(id);
  if (!next || cur === next) return;

  if (cur) {
    cur.classList.add('exiting');
    cur.classList.remove('active');
    cur.addEventListener('transitionend', () => cur.classList.remove('exiting'), { once: true });
  }

  setTimeout(() => next.classList.add('active'), (cur ? 360 : 0) + delay);
}

/* ══════════════════════════════════════════════════════
   SLOT-MACHINE DIGIT ANIMATION
══════════════════════════════════════════════════════ */

function slotMachine(el, finalDigit, duration = 1700) {
  const chars = '0123456789';
  const start = Date.now();

  const step = () => {
    const elapsed  = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);

    if (progress < 1) {
      el.textContent = chars[Math.floor(Math.random() * chars.length)];
      const interval = 50 + progress * 130;   // slows down
      setTimeout(step, interval);
    } else {
      el.textContent = finalDigit;
      el.classList.add('digit-final-pop');
      el.addEventListener('animationend', () => el.classList.remove('digit-final-pop'), { once: true });
    }
  };

  step();
}

/* ══════════════════════════════════════════════════════
   INITIALISATION
══════════════════════════════════════════════════════ */

async function init() {
  /* Pre-hash every answer */
  for (const q of CONFIG.questions) {
    S.answerHashes.push(
      q.isHashed ? q.answer : await sha256(q.answer)
    );
  }

  /* Pre-hash the master key (concatenation of all reward digits) */
  const masterKey    = CONFIG.questions.map(q => q.rewardDigit).join('');
  S.masterKeyHash    = await sha256(masterKey);

  buildAmbient();
  buildDigitSlots();
  wireEvents();
}

function buildDigitSlots() {
  const track = document.getElementById('digit-track');
  track.innerHTML = '';
  CONFIG.questions.forEach((_, i) => {
    const el = document.createElement('div');
    el.className = 'd-slot';
    el.id = `ds-${i}`;
    el.textContent = '?';
    track.appendChild(el);
  });
}

function wireEvents() {
  document.getElementById('btn-start') .addEventListener('click', startQuiz);
  document.getElementById('btn-submit').addEventListener('click', submitAnswer);
  document.getElementById('btn-next')  .addEventListener('click', nextQ);
  document.getElementById('btn-unlock').addEventListener('click', submitKey);

  /* Enter key does nothing anywhere — all buttons must be mouse-clicked */
  document.getElementById('answer-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') e.preventDefault();
  });
  document.getElementById('key-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') e.preventDefault();
  });
  ['btn-start','btn-submit','btn-next','btn-unlock'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
    });
  });

  /* Clear error messages as user types */
  document.getElementById('answer-input').addEventListener('input', () => {
    document.getElementById('answer-error').textContent = '';
  });
  document.getElementById('key-input').addEventListener('input', () => {
    document.getElementById('key-error').textContent = '';
  });
}

/* ══════════════════════════════════════════════════════
   GAME FLOW
══════════════════════════════════════════════════════ */

function startQuiz() {
  S.currentQ = 0;

  /* Unlock both audio elements on the first user gesture.
     Browsers (especially on HTTPS/GitHub Pages) block audio that
     plays outside a direct user-interaction call stack.
     Touching both elements here "unlocks" them so later .play()
     calls inside setTimeout chains also work. */
  bgAudio.play().catch(() => {});
  drumrollAudio.play().then(() => {
    drumrollAudio.pause();
    drumrollAudio.currentTime = 0;
  }).catch(() => {});

  loadQ(0);
  goTo('s-quiz');
}

function loadQ(idx) {
  const q     = CONFIG.questions[idx];
  const total = CONFIG.questions.length;

  document.getElementById('q-label').textContent = `Question ${idx + 1} of ${total}`;
  document.getElementById('progress-fill').style.width =
    `${(idx / total) * 100}%`;

  /* Animate text swap */
  const qTextEl = document.getElementById('q-text');
  const qHintEl = document.getElementById('q-hint');

  qTextEl.style.cssText = 'opacity:0; transform:translateY(10px);';
  qHintEl.style.opacity = '0';

  setTimeout(() => {
    qTextEl.textContent = q.question;
    qHintEl.textContent = q.hint;
    qTextEl.style.cssText =
      'opacity:1; transform:translateY(0); transition:opacity 0.4s, transform 0.4s;';
    qHintEl.style.cssText = 'opacity:1; transition:opacity 0.4s;';
  }, 200);

  document.getElementById('answer-input').value = '';
  document.getElementById('answer-error').textContent = '';
  setTimeout(() => document.getElementById('answer-input').focus(), 620);
}

async function submitAnswer() {
  const inp = document.getElementById('answer-input');
  const raw = inp.value;

  if (!raw.trim()) {
    document.getElementById('answer-error').textContent = 'Please type your answer!';
    return;
  }

  const hash = await sha256(raw);

  if (hash === S.answerHashes[S.currentQ]) {
    /* ✔ Correct */
    const q = CONFIG.questions[S.currentQ];
    S.collected.push(q.rewardDigit);

    /* Immediately remove focus + clear the input so Enter on the
       reward screen cannot re-trigger this handler */
    inp.blur();
    inp.value = '';

    /* Fill the digit slot */
    const slot = document.getElementById(`ds-${S.currentQ}`);
    if (slot) { slot.textContent = q.rewardDigit; slot.classList.add('filled'); }

    /* Populate reward screen */
    document.getElementById('reward-msg').textContent = q.rewardMsg;
    document.getElementById('reward-sub').textContent =
      `This is digit ${S.collected.length} of ${CONFIG.questions.length} in your master key.`;
    document.getElementById('key-so-far').innerHTML =
      `Key so far: <strong style="color:#c084fc;letter-spacing:0.38em;">${S.collected.join('  ')}</strong>`;

    goTo('s-reward');
    setTimeout(() => slotMachine(document.getElementById('slot-digit'), q.rewardDigit), 450);

  } else {
    /* ✘ Wrong */
    document.getElementById('answer-error').textContent =
      "That's not quite right — give it another try! 💭";
    inp.classList.add('shake');
    setTimeout(() => { inp.classList.remove('shake'); inp.select(); }, 440);
  }
}

function nextQ() {
  S.currentQ++;
  if (S.currentQ >= CONFIG.questions.length) {
    buildKeyDigitsDisplay();
    goTo('s-keyentry');
    setTimeout(() => document.getElementById('key-input').focus(), 650);
  } else {
    loadQ(S.currentQ);
    goTo('s-quiz');
  }
}

function buildKeyDigitsDisplay() {
  const wrap = document.getElementById('key-digits');
  wrap.innerHTML = '';
  S.collected.forEach((d, i) => {
    const el = document.createElement('div');
    el.className = 'k-digit';
    el.style.animationDelay = `${i * 0.1}s`;
    el.textContent = d;
    wrap.appendChild(el);
  });
}

async function submitKey() {
  const inp = document.getElementById('key-input');
  const raw = inp.value.replace(/\s/g, '');

  if (!raw) {
    document.getElementById('key-error').textContent = 'Please enter the master key!';
    return;
  }

  const hash = await sha256(raw);

  if (hash === S.masterKeyHash) {
    /* Correct key → drumroll */
    pauseBg();
    goTo('s-drumroll');
    setTimeout(startCountdown, 700);
  } else {
    document.getElementById('key-error').textContent =
      '🔒 Incorrect key — check the digits you collected and try again!';
    inp.classList.add('shake');
    setTimeout(() => { inp.classList.remove('shake'); inp.value = ''; }, 460);
  }
}

/* ══════════════════════════════════════════════════════
   DRUMROLL COUNTDOWN
══════════════════════════════════════════════════════ */

const CIRCUMFERENCE = 2 * Math.PI * 88; // ≈ 552.92  (radius 88 in SVG)

const COUNTDOWN_MSGS = [
  'Get ready…',
  'The secret is almost out…',
  'Hearts are racing…',
  'Drumroll please…',
  'Almost there…',
  'Just a few more seconds…',
  'Something incredible is coming…',
  'The suspense is real…',
  'One more moment…',
  'HERE WE GO!'
];

function startCountdown() {
  const ring  = document.getElementById('ring-prog');
  const numEl = document.getElementById('countdown-num');
  const msgEl = document.getElementById('drumroll-msg');

  ring.style.strokeDasharray  = CIRCUMFERENCE;
  ring.style.strokeDashoffset = 0;

  drumrollAudio.currentTime = 0;
  drumrollAudio.play().catch(() => {});

  let t = 10;

  const tick = () => {
    /* Drain the ring (dashoffset grows as time runs out) */
    ring.style.strokeDashoffset = CIRCUMFERENCE * (1 - t / 10);
    numEl.textContent = t;
    msgEl.textContent = COUNTDOWN_MSGS[10 - t] || 'HERE WE GO!';

    /* Visual urgency for last 3 seconds */
    if (t <= 3) {
      numEl.style.color      = '#f472b6';
      numEl.style.textShadow = '0 0 50px rgba(244,114,182,1)';
      numEl.style.transform  = 'translate(-50%,-50%) scale(1.4)';
      setTimeout(() => {
        numEl.style.transform = 'translate(-50%,-50%) scale(1)';
      }, 200);
    }

    if (t > 0) {
      t--;
      setTimeout(tick, 1000);
    } else {
      doReveal();
    }
  };

  tick();
}

/* ══════════════════════════════════════════════════════
   GENDER REVEAL
══════════════════════════════════════════════════════ */

function doReveal() {
  const isGirl = CONFIG.gender === 'girl';

  /* Change background colour */
  const bg = document.getElementById('bg-gradient');
  bg.style.animation  = 'none';
  bg.style.background = isGirl
    ? 'linear-gradient(135deg,#831843 0%,#9d174d 25%,#db2777 50%,#f472b6 78%,#fce7f3 100%)'
    : 'linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 28%,#3b82f6 55%,#60a5fa 80%,#dbeafe 100%)';

  /* Fill reveal content */
  const emoji    = isGirl ? '🎀' : '💙';
  const genderTx = isGirl ? 'Girl!' : 'Boy!';
  const cssClass = isGirl ? 'girl-text' : 'boy-text';
  const sub      = CONFIG.babyName
    ? `Welcome, ${CONFIG.babyName}! 🥰`
    : isGirl
      ? 'A little princess is on her way!'
      : 'A little prince is on his way!';

  document.getElementById('reveal-text').innerHTML =
    `<span class="${cssClass}">It's a<br>${genderTx} ${emoji}</span>`;
  document.getElementById('reveal-sub').textContent    = sub;
  document.getElementById('reveal-footer').textContent =
    `With all our love — ${CONFIG.parents} 💕`;

  goTo('s-reveal');

  /* Fire celebration after screen lands */
  setTimeout(() => {
    stopDrumroll();
    bgAudio.currentTime = 0;
    playBg();
    startConfettiRain();
  }, 550);
}

/* ══════════════════════════════════════════════════════
   REPLAY  (resets everything back to landing)
══════════════════════════════════════════════════════ */

function replayReveal() {
  /* Stop confetti */
  if (cfRainTimer) { clearInterval(cfRainTimer); cfRainTimer = null; }
  particles = [];
  ctx2.clearRect(0, 0, canvas.width, canvas.height);

  /* Reset background */
  const bg = document.getElementById('bg-gradient');
  bg.style.background = '';
  bg.style.animation  = '';

  /* Reset digit slots */
  document.querySelectorAll('.d-slot').forEach(el => {
    el.textContent = '?';
    el.classList.remove('filled');
  });

  /* Reset countdown ring */
  const ring = document.getElementById('ring-prog');
  ring.style.strokeDashoffset = 0;
  const numEl = document.getElementById('countdown-num');
  numEl.textContent = '10';
  numEl.style.color = '#fff';
  numEl.style.textShadow = '';
  numEl.style.transform = 'translate(-50%,-50%) scale(1)';

  /* Clear inputs / errors */
  document.getElementById('answer-input').value = '';
  document.getElementById('key-input').value    = '';
  document.getElementById('answer-error').textContent = '';
  document.getElementById('key-error').textContent    = '';

  /* Stop audio */
  stopDrumroll();
  pauseBg();
  bgAudio.currentTime = 0;

  /* Reset state */
  S.currentQ  = 0;
  S.collected = [];

  goTo('s-landing');
}

/* ══════════════════════════════════════════════════════
   BOOT
══════════════════════════════════════════════════════ */

init().catch(console.error);
