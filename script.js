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
});

/* ==========================================================================
   1. ENVELOPE OPEN / CLOSE MECHANICS
   ========================================================================== */
let isEnvelopeOpened = false;

function initEnvelope() {
  const stage = document.getElementById('heroEnvelopeStage');
  const seal = document.getElementById('waxSealWrapper');
  const btnOpen = document.getElementById('btnOpenEnvelope');
  const btnReplay = document.getElementById('btnReplayEnvelope');
  const btnScrollToDetails = document.getElementById('btnScrollToDetails');

  function openEnvelope() {
    if (isEnvelopeOpened) return;
    isEnvelopeOpened = true;

    // Play realistic paper unfold sound effect via Web Audio
    playParchmentSound();

    // Trigger 3D envelope flap opening and card sliding out in slow motion
    stage.classList.add('opened');

    // Trigger bright golden radiance sparkles
    triggerRevealRadiance();

    // Attempt to start soft background music
    tryPlayMusic();

    // The card remains centered and closer for guests to view up close.
    // Guests can click the view details button or scroll down when ready.
  }

  function resetEnvelope() {
    isEnvelopeOpened = false;
    stage.classList.remove('opened');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const nestedCard = document.getElementById('envelopeNestedCard');
  if (seal) seal.addEventListener('click', () => openEnvelope());
  if (btnOpen) btnOpen.addEventListener('click', () => openEnvelope());
  if (btnReplay) btnReplay.addEventListener('click', resetEnvelope);
  if (btnScrollToDetails) {
    btnScrollToDetails.addEventListener('click', () => {
      const cardSection = document.getElementById('invitationCard');
      if (cardSection) cardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  if (nestedCard) {
    nestedCard.addEventListener('click', () => {
      if (!isEnvelopeOpened) {
        openEnvelope();
      } else {
        const cardSection = document.getElementById('invitationCard');
        if (cardSection) cardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
   6. CALENDAR (GOOGLE & ICAL .ICS) & SHARING
   ========================================================================== */
function initCalendarAndShare() {
  const btnIcal = document.getElementById('btnDownloadIcal');
  const btnShareWhatsapp = document.getElementById('btnShareWhatsapp');

  // iCal .ics file download generator
  if (btnIcal) {
    btnIcal.addEventListener('click', (e) => {
      e.preventDefault();
      downloadIcsFile();
    });
  }

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
        `⏰ *Time:* 12:45 PM Inshallah\n` +
        `📍 *Venue:* The White Palace, Gudihal Road, Hubli\n\n` +
        `Directions: https://maps.google.com/?q=The+White+Palace+Gudihal+Road+Hubli\n\n` +
        `Your presence & Duas will add to our joy!\n` +
        `With best compliments: Doddamani family, relatives, and friends.`;

      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, '_blank');
    });
  }
}

function downloadIcsFile() {
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Doddamani Family//Wedding Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:wedding-tasnim-sadaf-20261122@invitation',
    'DTSTAMP:20261015T120000Z',
    'DTSTART:20261122T071500Z', // 12:45 PM IST is 07:15 AM UTC
    'DTEND:20261122T113000Z',
    'SUMMARY:Nikah: Tasnim Kousar & Sadaf',
    'DESCRIPTION:Inshallah Nikah ceremony of Tasnim Kousar and Sadaf (S/o Mr. Abdul Tawab Kodiyal). Venue: The White Palace, Gudihal Road, Hubli. With best compliments from Doddamani family.',
    'LOCATION:The White Palace, Gudihal Road, Hubli',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', 'Tasnim_Kousar_Weds_Sadaf_Nikah.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('📅 Calendar event downloaded!');
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
