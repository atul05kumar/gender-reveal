// CONFIGURATION

// SHA-256 hash of your secret PIN
const SECRET_PIN_HASH =
  "01f0a55c866eeb79adee1aa0b130e2a6da664a7b912a6cab70d560649a0caa7b";

// BOY or GIRL
const BABY_GENDER = "BOY";

async function checkPin() {
  const enteredPin = document.getElementById("pinInput").value;

  const hash = await sha256(enteredPin);

  if (hash !== SECRET_PIN_HASH) {
    document.getElementById("error").innerText = "Incorrect PIN";

    return;
  }

  revealGender();
}
async function sha256(text) {
  const encoder = new TextEncoder();

  const data = encoder.encode(text);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function revealGender() {
  document.getElementById("pin-section").style.display = "none";

  document.getElementById("revealSection").classList.remove("hidden");

  const emoji = document.getElementById("genderEmoji");

  const text = document.getElementById("genderText");

  if (BABY_GENDER === "BOY") {
    emoji.innerHTML = "💙";

    text.innerHTML = "IT'S A BOY!";
  } else {
    emoji.innerHTML = "🎀";

    text.innerHTML = "IT'S A GIRL!";
  }

  launchConfetti();

  launchBalloons();

  playMusic();
}

function launchConfetti() {
  const duration = 8000;

  const end = Date.now() + duration;

  const interval = setInterval(() => {
    confetti({
      particleCount: 10,
      spread: 120,
      startVelocity: 40,
      origin: {
        x: Math.random(),
        y: Math.random() - 0.2,
      },
    });

    if (Date.now() > end) {
      clearInterval(interval);
    }
  }, 150);
}

function launchBalloons() {
  const container = document.getElementById("balloonContainer");

  const balloonEmoji = BABY_GENDER === "BOY" ? "🎈" : "🎀";

  for (let i = 0; i < 40; i++) {
    const balloon = document.createElement("div");

    balloon.className = "balloon";

    balloon.innerHTML = balloonEmoji;

    balloon.style.left = Math.random() * 100 + "vw";

    balloon.style.animationDuration = 6 + Math.random() * 6 + "s";

    balloon.style.fontSize = 40 + Math.random() * 40 + "px";

    container.appendChild(balloon);
  }
}

function playMusic() {
  const music = document.getElementById("revealMusic");

  music.play().catch(() => {
    console.log("Music autoplay blocked by browser.");
  });
}
