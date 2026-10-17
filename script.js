/**
 * Tasnim Kousar Weds Sadaf - Royal Wedding Invitation Script
 * Handles: 3D Envelope Animation, Falling Petals & Gold Dust Canvas,
 * Live Countdown Timer, Audio Player, ICS Calendar Generator, Guest Wishes & Scroll Reveal.
 */

document.addEventListener('DOMContentLoaded', () => {
  initEnvelope();
  initPetalsCanvas();
  initCountdown();
  initScrollReveal();
  initAudioPlayer();
  initCalendarAndShare();
  initPortraitCelebration();
  initAutoGuide();
});

/* ==========================================================================
   1. ENVELOPE OPEN / CLOSE MECHANICS
   ========================================================================== */
let isEnvelopeOpened = false;
let isEnvelopeClosing = false;

function initEnvelope() {
  const stage = document.getElementById('heroEnvelopeStage');
  const seal = document.getElementById('waxSealWrapper');
  const btnOpen = document.getElementById('btnOpenEnvelope');
  const btnReplay = document.getElementById('btnReplayEnvelope');
  const btnScrollToDetails = document.getElementById('btnScrollToDetails');

  function openEnvelope() {
    if (isEnvelopeOpened || isEnvelopeClosing) return;
    isEnvelopeOpened = true;

    // Play realistic paper unfold sound effect via Web Audio
    playParchmentSound();

    // Trigger 3D envelope flap opening and card sliding out in slow motion
    stage.classList.remove('closing');
    stage.classList.add('opened');

    // Trigger bright golden radiance sparkles
    triggerRevealRadiance();

    // Attempt to start soft background music
    tryPlayMusic();

    // Show floating auto-guide controller pill
    showAutoGuideController();

    // Automatically guide the user through the card after the centered card is revealed
    autoGuideTimer = setTimeout(() => {
      startAutoGuide(0);
    }, 4200);
  }

  function resetEnvelope() {
    if (!isEnvelopeOpened || isEnvelopeClosing) return;
    isEnvelopeClosing = true;
    isEnvelopeOpened = false;

    // Stop auto-guide and hide its controller
    stopAutoGuide();
    hideAutoGuideController();

    // Scroll smoothly to top so user watches the full closing sequence
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Transition from opened to closing to initiate the reverse choreography
    stage.classList.remove('opened');
    stage.classList.add('closing');

    // Play tactile paper slide and stamp sound effect
    playEnvelopeCloseSound();

    // Reset clean state after sequence finishes (2.2s)
    setTimeout(() => {
      stage.classList.remove('closing');
      isEnvelopeClosing = false;
    }, 2250);
  }

  const nestedCard = document.getElementById('envelopeNestedCard');
  if (seal) seal.addEventListener('click', () => openEnvelope());
  if (btnOpen) btnOpen.addEventListener('click', () => openEnvelope());
  if (btnReplay) btnReplay.addEventListener('click', resetEnvelope);
  if (btnScrollToDetails) {
    btnScrollToDetails.addEventListener('click', () => {
      if (!isAutoGuiding) {
        startAutoGuide(0);
      } else {
        pauseAutoGuide(true);
      }
    });
  }
  if (nestedCard) {
    nestedCard.addEventListener('click', () => {
      if (!isEnvelopeOpened) {
        openEnvelope();
      } else {
        if (!isAutoGuiding) {
          startAutoGuide(0);
        } else {
          pauseAutoGuide(true);
        }
      }
    });
  }

  // Also auto-open if user scrolls past a slight threshold on load
  let scrollTriggered = false;
  window.addEventListener('scroll', () => {
    if (!scrollTriggered && window.scrollY > 80 && !isEnvelopeOpened) {
      scrollTriggered = true;
      openEnvelope(false);
    }
  }, { passive: true });
}

/* ==========================================================================
   2. FALLING ROSE PETALS & FLOATING GOLD DUST CANVAS
   ========================================================================== */
function initPetalsCanvas() {
  const canvas = document.getElementById('petals-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const petals = [];
  const sparkles = [];

  const petalCount = window.innerWidth < 600 ? 18 : 32;
  const sparkleCount = window.innerWidth < 600 ? 25 : 45;

  // Rose Petal Class
  class Petal {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -30;
      this.size = Math.random() * 12 + 10;
      this.speedY = Math.random() * 0.9 + 0.6;
      this.speedX = Math.random() * 0.6 - 0.3;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.02;
      this.flip = Math.random() * Math.PI;
      this.flipSpeed = Math.random() * 0.03 + 0.01;
      this.opacity = Math.random() * 0.4 + 0.45;
      
      // Blush pink petal tones
      const tones = [
        'rgba(247, 210, 214, ',
        'rgba(239, 168, 177, ',
        'rgba(252, 232, 234, ',
        'rgba(223, 126, 139, '
      ];
      this.color = tones[Math.floor(Math.random() * tones.length)];
    }

    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.y * 0.008) * 0.8 + this.speedX;
      this.rotation += this.rotSpeed;
      this.flip += this.flipSpeed;

      if (this.y > height + 40 || this.x < -40 || this.x > width + 40) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.scale(Math.cos(this.flip), 1);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size / 2, this.size / 2, 0, this.size);
      ctx.bezierCurveTo(this.size / 2, this.size / 2, this.size / 2, -this.size / 2, 0, 0);

      ctx.fillStyle = this.color + this.opacity + ')';
      ctx.fill();

      // Delicate gold vein line
      ctx.strokeStyle = `rgba(212, 175, 55, ${this.opacity * 0.3})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.lineTo(0, this.size * 0.8);
      ctx.stroke();

      ctx.restore();
    }
  }

  // Floating Gold Dust Sparkle Class
  class Sparkle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.size = Math.random() * 2 + 1;
      this.speedY = -(Math.random() * 0.4 + 0.2);
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.6 + 0.2;
      this.pulseSpeed = Math.random() * 0.04 + 0.02;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.alpha += Math.sin(Date.now() * this.pulseSpeed * 0.05) * 0.01;

      if (this.y < -10 || this.x < -10 || this.x > width + 10) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 175, 55, ${Math.max(0.1, Math.min(0.8, this.alpha))})`;
      ctx.shadowColor = 'rgba(236, 207, 122, 0.8)';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < petalCount; i++) petals.push(new Petal());
  for (let i = 0; i < sparkleCount; i++) sparkles.push(new Sparkle());

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let s of sparkles) {
      s.update();
      s.draw();
    }

    for (let p of petals) {
      p.update();
      p.draw();
    }

    requestAnimationFrame(animate);
  }

  // Radiance sparkle surge when envelope unfolds
  window.addRevealSparkles = function() {
    const centerX = width / 2;
    const centerY = height * 0.45;
    for (let i = 0; i < 40; i++) {
      const sp = new Sparkle();
      sp.x = centerX + (Math.random() - 0.5) * (width < 600 ? 220 : 340);
      sp.y = centerY + (Math.random() - 0.5) * 120;
      sp.speedY = -(Math.random() * 0.9 + 0.4); // slow-motion upward float
      sp.speedX = (Math.random() - 0.5) * 0.8;
      sp.size = Math.random() * 3.5 + 1.8;
      sp.alpha = 1;
      sparkles.push(sp);
    }
  };

  animate();
}

function triggerRevealRadiance() {
  if (typeof window.addRevealSparkles === 'function') {
    window.addRevealSparkles();
  }
}

/* ==========================================================================
   3. LIVE COUNTDOWN TIMER
   Target: Sunday, 22nd November 2026 at 12:45 PM IST
   ========================================================================== */
function initCountdown() {
  const targetDate = new Date('2026-11-22T12:45:00+05:30').getTime();

  const daysEl = document.getElementById('countDays');
  const hoursEl = document.getElementById('countHours');
  const minsEl = document.getElementById('countMinutes');
  const secsEl = document.getElementById('countSeconds');

  function update() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      if (daysEl) daysEl.innerText = '00';
      if (hoursEl) hoursEl.innerText = '00';
      if (minsEl) minsEl.innerText = '00';
      if (secsEl) secsEl.innerText = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysEl) daysEl.innerText = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.innerText = String(hours).padStart(2, '0');
    if (minsEl) minsEl.innerText = String(minutes).padStart(2, '0');
    if (secsEl) secsEl.innerText = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   4. SCROLL REVEAL OBSERVER
   ========================================================================== */
function initScrollReveal() {
  const sections = document.querySelectorAll('.invitation-section');
  if (!sections.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  sections.forEach(section => observer.observe(section));
}

/* ==========================================================================
   5. BACKGROUND MUSIC & AUDIO SYNTHESIS
   ========================================================================== */
let audioCtx = null;
let bgAudio = null;
let isAudioPlaying = false;

function initAudioPlayer() {
  bgAudio = document.getElementById('bgAudioElement');
  const toggleBtn = document.getElementById('audioToggleBtn');
  const audioText = document.getElementById('audioToggleText');

  if (!toggleBtn || !bgAudio) return;

  toggleBtn.addEventListener('click', () => {
    if (isAudioPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  });
}

function playMusic() {
  if (!bgAudio) return;
  const toggleBtn = document.getElementById('audioToggleBtn');
  const audioText = document.getElementById('audioToggleText');

  bgAudio.play().then(() => {
    isAudioPlaying = true;
    if (toggleBtn) toggleBtn.classList.add('playing');
    if (audioText) audioText.innerText = 'Music Playing';
  }).catch(e => {
    console.log('Audio autoplay prevented, starting synthesized harp melody', e);
    startSynthesizedMelody();
    isAudioPlaying = true;
    if (toggleBtn) toggleBtn.classList.add('playing');
    if (audioText) audioText.innerText = 'Music Playing';
  });
}

function pauseMusic() {
  if (!bgAudio) return;
  const toggleBtn = document.getElementById('audioToggleBtn');
  const audioText = document.getElementById('audioToggleText');

  bgAudio.pause();
  isAudioPlaying = false;
  if (toggleBtn) toggleBtn.classList.remove('playing');
  if (audioText) audioText.innerText = 'Play Music';
}

function tryPlayMusic() {
  if (!isAudioPlaying) {
    playMusic();
  }
}



// Realistic Web Audio Parchment Sound Effect when Envelope Opens
function playParchmentSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Noise buffer for gentle paper rustle
    const bufferSize = ctx.sampleRate * 0.6;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.18));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter to make it sound like warm heavy parchment paper
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.5);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();

    // Soft chime overlay
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 chime
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5

    oscGain.gain.setValueAtTime(0.06, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch (err) {
    // Ignore audio error if unsupported
  }
}

// Realistic Web Audio Parchment Slide & Wax Stamp Sound when Envelope Closes
function playEnvelopeCloseSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // 1. Soft paper friction sound as card slides into envelope pocket
    const bufferSize = ctx.sampleRate * 0.8;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.28));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.75);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();

    // 2. Soft wax seal stamp "thud" at 1.55s as the seal lands and seals
    setTimeout(() => {
      try {
        const stampOsc = ctx.createOscillator();
        const stampGain = ctx.createGain();
        stampOsc.type = 'triangle';
        stampOsc.frequency.setValueAtTime(120, ctx.currentTime);
        stampOsc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.22);

        stampGain.gain.setValueAtTime(0.2, ctx.currentTime);
        stampGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

        stampOsc.connect(stampGain);
        stampGain.connect(ctx.destination);
        stampOsc.start();
        stampOsc.stop(ctx.currentTime + 0.3);
      } catch (e) {}
    }, 1550);
  } catch (err) {
    // Ignore audio error if unsupported
  }
}

// Synthesized Calming Harp/Sufi Chord Progression as fallback
function startSynthesizedMelody() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!audioCtx) audioCtx = new AudioContext();

    const notes = [261.63, 329.63, 392.00, 523.25, 440.00, 392.00]; // C E G C A G
    let step = 0;

    setInterval(() => {
      if (!isAudioPlaying) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(notes[step % notes.length], audioCtx.currentTime);

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 2.0);
      step++;
    }, 1200);
  } catch (e) {
    console.log(e);
  }
}

/* ==========================================================================
   6. SHARING & CALENDAR INTEGRATION
   ========================================================================== */
function initCalendarAndShare() {
  const btnShareWhatsapp = document.getElementById('btnShareWhatsapp');

  // WhatsApp share button
  if (btnShareWhatsapp) {
    btnShareWhatsapp.addEventListener('click', (e) => {
      e.preventDefault();
      const shareText = `*Wedding Invitation: Tasnim Kousar & Sadaf*\n\n` +
        `In the name of Almighty Allah the most beneficent and the most merciful.\n` +
        `With the blessings of Allah (SWT) and Mr. Mohammad Shafi Doddamani, you are cordially invited to celebrate the auspicious Nikah ceremony of\n\n` +
        `👰 *Tasnim Kousar*\n` +
        `weds\n` +
        `🤵 *Sadaf* (S/o Mr. Abdul Tawab Kodiyal, Kumta Road, Sirsi)\n\n` +
        `📅 *Date:* Sunday, 22nd November 2026\n` +
        `⏰ *Time:* 12:45 PM Inshallah (Followed by Lunch at 1:30 PM)\n` +
        `📍 *Venue:* The White Palace, Gudihal Road, Hubli\n\n` +
        `Directions: https://maps.google.com/?q=The+White+Palace+Gudihal+Road+Hubli\n\n` +
        `Your presence & Duas will add to our joy!\n` +
        `With best compliments: Doddamani family, relatives, and friends.`;

      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, '_blank');
    });
  }
}



/* ==========================================================================
   HELPERS & TOAST
   ========================================================================== */
function showToast(message) {
  let toast = document.getElementById('toastNotice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

/* ==========================================================================
   8. INTERACTIVE COUPLE PORTRAIT CELEBRATION ANIMATION
   ========================================================================== */
function initPortraitCelebration() {
  const showcase = document.getElementById('couplePortraitShowcase');
  const fxContainer = document.getElementById('portraitCelebrationFx');
  if (!showcase || !fxContainer) return;

  const blessings = [
    '✨ MashaAllah! ✨',
    '💖 BarakAllah! 💖',
    '🌸 Lots of Duas! 🌸',
    '🤲 May Allah Bless Them! 🤲',
    '💍 Tasnim & Sadaf 💍',
    '🤍 Shadi Mubarak! 🤍'
  ];
  let blessingIndex = 0;

  function triggerCelebration(e) {
    // 1. Re-trigger the pulse and gleam animation on the frame
    showcase.classList.remove('celebrating');
    void showcase.offsetWidth; // Force DOM reflow to restart CSS animation cleanly
    showcase.classList.add('celebrating');

    // 2. Play gentle royal chime sound via Web Audio
    playRoyalChimeSound();

    // 3. Determine origin coordinates for the particle burst
    const rect = showcase.getBoundingClientRect();
    let clientX = rect.left + rect.width / 2;
    let clientY = rect.top + rect.height * 0.45;

    if (e && e.clientX && e.clientY) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const localX = clientX - rect.left;
    const localY = clientY - rect.top;

    // 4. Spawn floating celebration particles (hearts, petals, sparkles)
    const particleIcons = ['✨', '💖', '🌸', '🤍', '💍', '❦', '✦', '💐'];
    const particleCount = 14;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('span');
      particle.className = 'floating-celebration-particle';
      particle.innerText = particleIcons[Math.floor(Math.random() * particleIcons.length)];

      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.6;
      const distance = Math.random() * 90 + 60;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance - 80; // drift upward
      const rot = (Math.random() - 0.5) * 90 + 'deg';

      particle.style.left = `${localX}px`;
      particle.style.top = `${localY}px`;
      particle.style.setProperty('--dx', `${dx}px`);
      particle.style.setProperty('--dy', `${dy}px`);
      particle.style.setProperty('--rot', rot);
      particle.style.fontSize = `${Math.random() * 0.7 + 1.25}rem`;

      fxContainer.appendChild(particle);

      setTimeout(() => {
        if (particle.parentNode) particle.parentNode.removeChild(particle);
      }, 1600);
    }

    // 5. Spawn floating blessing banner
    const banner = document.createElement('div');
    banner.className = 'blessing-popup-banner';
    banner.innerText = blessings[blessingIndex % blessings.length];
    blessingIndex++;
    fxContainer.appendChild(banner);

    setTimeout(() => {
      if (banner.parentNode) banner.parentNode.removeChild(banner);
    }, 1600);
  }

  showcase.addEventListener('click', (e) => {
    triggerCelebration(e);
  });

  showcase.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerCelebration();
    }
  });
}

function playRoyalChimeSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Pentatonic romantic harp arpeggio: C5, E5, G5, C6, E6
    const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const startTime = ctx.currentTime + idx * 0.07;
      const duration = 0.85;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.08, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    });
  } catch (err) {
    // Audio context may be restricted by browser autoplay policy
  }
}

/* ==========================================================================
   9. CINEMATIC AUTO-GUIDE ANIMATION ENGINE
   ========================================================================== */
let isAutoGuiding = false;
let currentGuideIndex = 0;
let guideStepTimeout = null;
let autoGuideTimer = null;

const guideChapters = [
  { id: 'sectionWelcome', label: '1/5 Divine Blessing', pause: 4200 },
  { id: 'sectionCouple', label: '2/5 The Royal Couple', pause: 4800, onEnter: () => triggerPortraitCelebrationFromGuide() },
  { id: 'sectionEvent', label: '3/5 Nikah Details', pause: 4200 },
  { id: 'sectionVenue', label: '4/5 Venue & Directions', pause: 4600 },
  { id: 'sectionClosing', label: '5/5 Duas & Compliments', pause: 4200 }
];

function initAutoGuide() {
  const btnToggle = document.getElementById('btnGuideToggle');
  if (btnToggle) {
    btnToggle.addEventListener('click', () => {
      if (isAutoGuiding) {
        pauseAutoGuide(true);
      } else {
        startAutoGuide(currentGuideIndex);
      }
    });
  }

  // Gracefully pause auto-guide when user manually wheels or touches screen
  window.addEventListener('wheel', (e) => {
    if (isAutoGuiding && Math.abs(e.deltaY) > 8) {
      pauseAutoGuide(true);
    }
  }, { passive: true });

  window.addEventListener('touchmove', () => {
    if (isAutoGuiding) {
      pauseAutoGuide(true);
    }
  }, { passive: true });
}

function showAutoGuideController() {
  const ctrl = document.getElementById('autoGuideController');
  if (ctrl) ctrl.classList.add('visible');
}

function hideAutoGuideController() {
  const ctrl = document.getElementById('autoGuideController');
  if (ctrl) ctrl.classList.remove('visible');
}

function startAutoGuide(fromIndex = 0) {
  if (autoGuideTimer) clearTimeout(autoGuideTimer);
  if (guideStepTimeout) clearTimeout(guideStepTimeout);

  if (fromIndex >= guideChapters.length) {
    fromIndex = 0;
  }

  isAutoGuiding = true;
  currentGuideIndex = fromIndex;
  showAutoGuideController();

  const btnToggle = document.getElementById('btnGuideToggle');
  if (btnToggle) btnToggle.classList.add('guiding');

  executeGuideStep(currentGuideIndex);
}

function executeGuideStep(index) {
  if (!isAutoGuiding || index >= guideChapters.length) {
    finishAutoGuide();
    return;
  }

  currentGuideIndex = index;
  const step = guideChapters[index];
  const el = document.getElementById(step.id);

  // Update Progress Bar at Viewport Top
  const progressBar = document.getElementById('guideProgressBar');
  if (progressBar) {
    progressBar.classList.add('active');
    const pct = ((index + 1) / guideChapters.length) * 100;
    progressBar.style.width = `${pct}%`;
  }

  // Update Floating Controller Button
  const stepChip = document.getElementById('guideStepChip');
  if (stepChip) stepChip.innerText = `${index + 1}/${guideChapters.length}`;
  const toggleText = document.getElementById('guideToggleText');
  if (toggleText) toggleText.innerText = 'Pause Guide';
  const toggleIcon = document.getElementById('guideToggleIcon');
  if (toggleIcon) toggleIcon.className = 'fa-solid fa-pause';

  // Highlight Section with Golden Focus Shimmer
  document.querySelectorAll('.invitation-section').forEach(s => s.classList.remove('auto-guide-focus'));
  if (el) {
    el.classList.add('auto-guide-focus');
    el.classList.add('revealed');

    // Smooth cinematic gliding scroll to center the section in the viewport
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Trigger step celebration (e.g. couple portrait pulse)
    if (step.onEnter) {
      setTimeout(step.onEnter, 900);
    }
  }

  // Schedule Next Step in Tour
  guideStepTimeout = setTimeout(() => {
    if (isAutoGuiding) {
      executeGuideStep(index + 1);
    }
  }, step.pause);
}

function pauseAutoGuide(manual = false) {
  isAutoGuiding = false;
  if (guideStepTimeout) clearTimeout(guideStepTimeout);
  if (autoGuideTimer) clearTimeout(autoGuideTimer);

  const btnToggle = document.getElementById('btnGuideToggle');
  if (btnToggle) btnToggle.classList.remove('guiding');

  const toggleText = document.getElementById('guideToggleText');
  if (toggleText) toggleText.innerText = 'Resume Guide';
  const toggleIcon = document.getElementById('guideToggleIcon');
  if (toggleIcon) toggleIcon.className = 'fa-solid fa-play';

  document.querySelectorAll('.invitation-section').forEach(s => s.classList.remove('auto-guide-focus'));

  if (manual) {
    showToast('⏸ Auto-Guide paused. Tap "Resume Guide" anytime!');
  }
}

function stopAutoGuide() {
  isAutoGuiding = false;
  currentGuideIndex = 0;
  if (guideStepTimeout) clearTimeout(guideStepTimeout);
  if (autoGuideTimer) clearTimeout(autoGuideTimer);

  const btnToggle = document.getElementById('btnGuideToggle');
  if (btnToggle) btnToggle.classList.remove('guiding');

  const progressBar = document.getElementById('guideProgressBar');
  if (progressBar) {
    progressBar.classList.remove('active');
    progressBar.style.width = '0%';
  }

  const stepChip = document.getElementById('guideStepChip');
  if (stepChip) stepChip.innerText = `1/5`;
  const toggleText = document.getElementById('guideToggleText');
  if (toggleText) toggleText.innerText = 'Auto-Guide';
  const toggleIcon = document.getElementById('guideToggleIcon');
  if (toggleIcon) toggleIcon.className = 'fa-solid fa-compass';

  document.querySelectorAll('.invitation-section').forEach(s => s.classList.remove('auto-guide-focus'));
}

function finishAutoGuide() {
  isAutoGuiding = false;
  currentGuideIndex = 0;

  const btnToggle = document.getElementById('btnGuideToggle');
  if (btnToggle) btnToggle.classList.remove('guiding');

  const toggleText = document.getElementById('guideToggleText');
  if (toggleText) toggleText.innerText = 'Replay Guide';
  const toggleIcon = document.getElementById('guideToggleIcon');
  if (toggleIcon) toggleIcon.className = 'fa-solid fa-rotate-right';

  const progressBar = document.getElementById('guideProgressBar');
  if (progressBar) {
    progressBar.style.width = '100%';
    setTimeout(() => {
      progressBar.classList.remove('active');
      progressBar.style.width = '0%';
    }, 1500);
  }

  document.querySelectorAll('.invitation-section').forEach(s => s.classList.remove('auto-guide-focus'));
  showToast('✨ Royal Wedding Invitation tour completed!');
}

function triggerPortraitCelebrationFromGuide() {
  const showcase = document.getElementById('couplePortraitShowcase');
  if (showcase) {
    showcase.click();
  }
}
