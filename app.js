/**
 * Main Cyberpunk Application Controller
 * Manages HUD telemetry, theme engines, 3D tilt effects,
 * repository filtering, audio interactions, and toast notifications.
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Saved Theme & Settings
  initThemeAndSettings();

  // 2. Start Realtime HUD Clock & Network Latency Simulator
  initHUDTelemetry();

  // 3. Initialize 3D Card Tilt Effects
  init3DTilt();

  // 4. Initialize Sound Event Listeners
  initSoundListeners();

  // 5. Initialize Repo Search & Filters
  initRepoFilters();

  // 6. Initialize Contact Copy & Transmission
  initTransmissionHub();

  // 7. Initialize Settings Modal
  initSettingsModal();

  // 8. Load GitHub Data
  if (window.githubConnector) {
    window.githubConnector.loadAll('lil-ichi');
  }
});

/**
 * Theme & Visual Settings
 */
function initThemeAndSettings() {
  const savedTheme = localStorage.getItem('cyber_theme') || 'neon';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const themeSelector = document.getElementById('theme-select');
  if (themeSelector) {
    themeSelector.value = savedTheme;
    themeSelector.addEventListener('change', (e) => {
      const val = e.target.value;
      document.documentElement.setAttribute('data-theme', val);
      localStorage.setItem('cyber_theme', val);
      window.cyberAudio.playSuccess();
      showCyberToast(`PALETTE UPDATED: [${val.toUpperCase()}]`);
    });
  }

  // Scanline CRT Toggle
  const scanlineToggle = document.getElementById('toggle-scanlines');
  const scanlineOverlay = document.getElementById('scanline-overlay');
  const savedScanlines = localStorage.getItem('cyber_scanlines') !== 'false';

  if (scanlineToggle && scanlineOverlay) {
    scanlineToggle.checked = savedScanlines;
    scanlineOverlay.style.display = savedScanlines ? 'block' : 'none';

    scanlineToggle.addEventListener('change', (e) => {
      const enabled = e.target.checked;
      scanlineOverlay.style.display = enabled ? 'block' : 'none';
      localStorage.setItem('cyber_scanlines', enabled.toString());
      window.cyberAudio.playClick();
    });
  }

  // Audio Toggle Button in HUD
  const audioBtn = document.getElementById('hud-audio-btn');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      const active = window.cyberAudio.toggle();
      audioBtn.classList.toggle('active', active);
      audioBtn.querySelector('.hud-btn-label').textContent = active ? 'AUDIO: ON' : 'AUDIO: OFF';
      if (active) window.cyberAudio.playSuccess();
      showCyberToast(`AUDIO SYNTH: [${active ? 'ONLINE' : 'MUTED'}]`);
    });
  }

  // Matrix Background Toggle
  const matrixToggle = document.getElementById('toggle-matrix');
  if (matrixToggle) {
    matrixToggle.addEventListener('change', (e) => {
      const mode = e.target.checked ? 'matrix' : 'network';
      if (window.cyberCanvas) {
        window.cyberCanvas.setMode(mode);
      }
      window.cyberAudio.playClick();
      showCyberToast(`CANVAS MODE: [${mode.toUpperCase()}]`);
    });
  }
}

/**
 * Realtime HUD Telemetry (Clock & Latency)
 */
function initHUDTelemetry() {
  const clockEl = document.getElementById('hud-clock');
  const pingEl = document.getElementById('hud-ping');

  function updateClock() {
    if (clockEl) {
      const now = new Date();
      const utcString = now.toUTCString().split(' ')[4];
      const localString = now.toLocaleTimeString([], { hour12: false });
      clockEl.textContent = `${localString} LOC // ${utcString} UTC`;
    }
  }

  updateClock();
  setInterval(updateClock, 1000);

  // Ping jitter simulator for authentic cyber HUD telemetry
  if (pingEl) {
    setInterval(() => {
      const jitter = Math.floor(18 + Math.random() * 14);
      pingEl.textContent = `${jitter} ms`;
    }, 3500);
  }
}

/**
 * 3D Holographic Card Tilt Effect
 */
function init3DTilt() {
  const cards = document.querySelectorAll('[data-tilt]');

  cards.forEach(card => {
    let bounds;

    function rotateToMouse(e) {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const leftX = mouseX - bounds.x;
      const topY = mouseY - bounds.y;
      const center = {
        x: leftX - bounds.width / 2,
        y: topY - bounds.height / 2
      };
      const distance = Math.sqrt(center.x ** 2 + center.y ** 2);

      card.style.transform = `
        perspective(1000px)
        scale3d(1.02, 1.02, 1.02)
        rotateX(${-(center.y / (bounds.height / 2)) * 6}deg)
        rotateY(${(center.x / (bounds.width / 2)) * 6}deg)
      `;
    }

    card.addEventListener('mouseenter', () => {
      bounds = card.getBoundingClientRect();
      document.addEventListener('mousemove', rotateToMouse);
    });

    card.addEventListener('mouseleave', () => {
      document.removeEventListener('mousemove', rotateToMouse);
      card.style.transform = 'perspective(1000px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg)';
    });
  });
}

/**
 * Global Cyber Sound Hook
 */
function initSoundListeners() {
  // Buttons and Links
  document.querySelectorAll('a, button, input, select, .cyber-interactive').forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (window.cyberAudio) window.cyberAudio.playHover();
    });
    el.addEventListener('click', () => {
      if (window.cyberAudio) window.cyberAudio.playClick();
    });
  });
}

/**
 * Repository Filter & Search
 */
function initRepoFilters() {
  const searchInput = document.getElementById('repo-search-input');
  const langFilters = document.querySelectorAll('.lang-filter-btn');
  let currentLang = 'all';

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      if (window.githubConnector) {
        window.githubConnector.filterRepos(e.target.value, currentLang);
      }
    });
  }

  langFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      langFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLang = btn.getAttribute('data-lang') || 'all';
      const term = searchInput ? searchInput.value : '';
      if (window.githubConnector) {
        window.githubConnector.filterRepos(term, currentLang);
      }
    });
  });
}

/**
 * Transmission / Contact Hub
 */
function initTransmissionHub() {
  const form = document.getElementById('uplink-form');
  const copyBtns = document.querySelectorAll('[data-copy]');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      window.cyberAudio.playSuccess();
      showCyberToast('COMMUNICATION PACKET DISPATCHED // ACKNOWLEDGED');
      form.reset();
    });
  }

  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          window.cyberAudio.playSuccess();
          showCyberToast(`COPIED TO BUFFER: ${textToCopy}`);
        }).catch(() => {
          showCyberToast(`TARGET: ${textToCopy}`);
        });
      }
    });
  });
}

/**
 * Cyber Toast Notification System
 */
function showCyberToast(message) {
  const container = document.getElementById('cyber-toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'cyber-toast';
  toast.innerHTML = `
    <div class="toast-indicator"></div>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

/**
 * Settings Modal / Custom User Lookup
 */
function initSettingsModal() {
  const modal = document.getElementById('settings-modal');
  const openBtn = document.getElementById('open-settings-btn');
  const closeBtn = document.getElementById('close-settings-btn');
  const customUserBtn = document.getElementById('btn-apply-custom-user');
  const customUserInput = document.getElementById('custom-gh-user-input');

  if (openBtn && modal) {
    openBtn.addEventListener('click', () => {
      modal.classList.add('active');
      window.cyberAudio.playClick();
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      window.cyberAudio.playClick();
    });
  }

  if (customUserBtn && customUserInput) {
    customUserBtn.addEventListener('click', () => {
      const val = customUserInput.value.trim();
      if (val && window.githubConnector) {
        window.githubConnector.loadAll(val);
        showCyberToast(`SYNCHRONIZING WITH GITHUB NODE: @${val}`);
        modal.classList.remove('active');
        window.cyberAudio.playSuccess();
      }
    });
  }
}
