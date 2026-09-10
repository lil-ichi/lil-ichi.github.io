/**
 * Cyberpunk NetRunner Terminal CLI Engine
 * Fully interactive embedded command-line interface with history, tab completion,
 * dynamic commands, sound effects, and color formatting.
 */
class CyberTerminal {
  constructor() {
    this.container = document.getElementById('terminal-container');
    this.output = document.getElementById('terminal-output');
    this.input = document.getElementById('terminal-input');
    this.toggleBtn = document.getElementById('toggle-terminal-btn');
    this.closeBtn = document.getElementById('close-terminal-btn');
    this.history = [];
    this.historyIdx = -1;
    this.isOpen = false;

    this.commands = {
      help: () => this.cmdHelp(),
      neofetch: () => this.cmdNeofetch(),
      whoami: () => this.cmdWhoami(),
      repos: (args) => this.cmdRepos(args),
      skills: () => this.cmdSkills(),
      bio: () => this.cmdBio(),
      contact: () => this.cmdContact(),
      clear: () => this.cmdClear(),
      cls: () => this.cmdClear(),
      theme: (args) => this.cmdTheme(args),
      matrix: () => this.cmdMatrix(),
      audio: (args) => this.cmdAudio(args),
      stats: () => this.cmdStats(),
      hack: () => this.cmdHack(),
      sudo: () => this.cmdSudo(),
      exit: () => this.toggle(false)
    };

    this.initEvents();
  }

  initEvents() {
    if (!this.input) return;

    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => {
        window.cyberAudio.playClick();
        this.toggle();
      });
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => {
        window.cyberAudio.playClick();
        this.toggle(false);
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        window.cyberAudio.playClick();
        this.toggle(false);
      }
    });

    this.input.addEventListener('keydown', (e) => {
      window.cyberAudio.playKey();

      if (e.key === 'Enter') {
        const val = this.input.value.trim();
        if (val) {
          this.history.push(val);
          this.historyIdx = this.history.length;
          this.execute(val);
        }
        this.input.value = '';
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.historyIdx > 0) {
          this.historyIdx--;
          this.input.value = this.history[this.historyIdx] || '';
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.historyIdx < this.history.length - 1) {
          this.historyIdx++;
          this.input.value = this.history[this.historyIdx] || '';
        } else {
          this.historyIdx = this.history.length;
          this.input.value = '';
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this.autoComplete();
      }
    });
  }

  toggle(forceState) {
    this.isOpen = forceState !== undefined ? forceState : !this.isOpen;
    if (this.container) {
      if (this.isOpen) {
        this.container.classList.add('active');
        this.input.focus();
      } else {
        this.container.classList.remove('active');
      }
    }
  }

  print(html, className = '') {
    const line = document.createElement('div');
    line.className = `term-line ${className}`;
    line.innerHTML = html;
    this.output.appendChild(line);
    this.output.scrollTop = this.output.scrollHeight;
  }

  execute(rawCmd) {
    this.print(`<span class="term-prompt">lil-ichi@neural-core:~$</span> <span class="term-cmd-echo">${this.escapeHTML(rawCmd)}</span>`);
    const parts = rawCmd.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (this.commands[cmd]) {
      this.commands[cmd](args);
    } else {
      window.cyberAudio.playError();
      this.print(`<span class="term-error">Command not recognized: '${cmd}'. Type <span class="term-highlight">help</span> for available instructions.</span>`);
    }
  }

  autoComplete() {
    const val = this.input.value.toLowerCase();
    const match = Object.keys(this.commands).find(c => c.startsWith(val));
    if (match) {
      this.input.value = match;
    }
  }

  escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  cmdHelp() {
    const helpText = `
<div class="term-help-grid">
  <div><strong class="term-highlight">neofetch</strong> - System telemetry & profile readout</div>
  <div><strong class="term-highlight">whoami</strong>   - Print neural identity profile</div>
  <div><strong class="term-highlight">repos</strong>    - List GitHub repositories and telemetry</div>
  <div><strong class="term-highlight">skills</strong>   - Display neural skillset & power grid</div>
  <div><strong class="term-highlight">theme &lt;name&gt;</strong>- Switch theme: neon, matrix, synth, stealth</div>
  <div><strong class="term-highlight">matrix</strong>   - Toggle digital matrix rain background</div>
  <div><strong class="term-highlight">audio [on|off]</strong>- Procedural sound synthesizer toggle</div>
  <div><strong class="term-highlight">contact</strong> - Access direct transmission comm-link</div>
  <div><strong class="term-highlight">stats</strong>   - Live neural cluster statistics</div>
  <div><strong class="term-highlight">hack</strong>    - Initialize cyber security bypass simulation</div>
  <div><strong class="term-highlight">clear</strong>   - Clear terminal screen</div>
  <div><strong class="term-highlight">exit</strong>    - Minimize terminal interface</div>
</div>`;
    this.print(helpText);
    window.cyberAudio.playSuccess();
  }

  cmdNeofetch() {
    const art = `
<pre class="term-ascii-art">
   █████████  lil-ichi@neural-core
  ███     ███ ---------------------
  ███  █  ███ OS: CyberOS v2.0 (Neural Kernel)
  ███  █  ███ Host: Autonomous Agent Matrix
   █████████  Kernel: 6.8.0-deepmind-agy
              Uptime: 99.98% System Synchronized
              Shell: NetRunner ZSH 5.9
              Stack: Python, FastAPI, TypeScript, ML
              GitHub: https://github.com/lil-ichi
              Status: RUNNING // ACTIVE AGENT SWARM
</pre>`;
    this.print(art);
    window.cyberAudio.playSuccess();
  }

  cmdWhoami() {
    this.print(`
<div>
  <span class="term-cyan">NODE:</span> lil-ichi (formerly @itsrasoul)<br/>
  <span class="term-cyan">DESIGNATION:</span> AI Enthusiast · Neural Architect · Builder · Curious Human<br/>
  <span class="term-cyan">DIRECTIVE:</span> Orchestrating high-precision multi-agent intelligence and modern web infrastructure.
</div>`);
  }

  cmdRepos(args) {
    const gh = window.githubConnector;
    if (!gh || !gh.reposData || gh.reposData.length === 0) {
      this.print(`<span class="term-warn">Querying GitHub API... telemetry buffer warming up.</span>`);
      return;
    }
    let html = `<div class="term-table-header"><span>NAME</span><span>LANG</span><span>STARS</span></div>`;
    gh.reposData.forEach(r => {
      html += `<div class="term-table-row">
        <span><a href="${r.html_url}" target="_blank" class="term-link">${r.name}</a></span>
        <span class="term-dim">${r.language || 'N/A'}</span>
        <span class="term-gold">★ ${r.stargazers_count || 0}</span>
      </div>`;
    });
    this.print(html);
  }

  cmdSkills() {
    this.print(`
<div class="term-skills-list">
  <div>[▓▓▓▓▓▓▓▓▓▓] 98% - Multi-Agent AI Systems & Orchestration</div>
  <div>[▓▓▓▓▓▓▓▓▓░] 94% - Python (FastAPI, AsyncIO, PyTorch)</div>
  <div>[▓▓▓▓▓▓▓▓░░] 88% - Modern Web Architecture (Canvas, CSS Grid, TS)</div>
  <div>[▓▓▓▓▓▓▓▓▓░] 90% - Market-Data Broadcasting & Telegram Bots</div>
  <div>[▓▓▓▓▓▓▓▓░░] 85% - Neural Embeddings & Vector Stores</div>
</div>`);
  }

  cmdBio() {
    this.cmdWhoami();
  }

  cmdContact() {
    this.print(`
<div>
  <span class="term-highlight">TRANSMISSION COMM-LINK:</span><br/>
  - GitHub: <a href="https://github.com/lil-ichi" target="_blank" class="term-link">github.com/lil-ichi</a><br/>
  - Status: Accepting high-impact AI/ML collaborations & agentic ventures.
</div>`);
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  cmdClear() {
    this.output.innerHTML = '';
  }

  cmdTheme(args) {
    const themeName = args[0] ? args[0].toLowerCase() : '';
    const validThemes = ['neon', 'matrix', 'synth', 'stealth'];
    if (!validThemes.includes(themeName)) {
      this.print(`<span class="term-warn">Usage: theme &lt;neon | matrix | synth | stealth&gt;</span>`);
      return;
    }
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('cyber_theme', themeName);
    this.print(`<span class="term-success">Theme updated to palette: [${themeName.toUpperCase()}]</span>`);
    window.cyberAudio.playSuccess();
  }

  cmdMatrix() {
    if (window.cyberCanvas) {
      const newMode = window.cyberCanvas.mode === 'matrix' ? 'network' : 'matrix';
      window.cyberCanvas.setMode(newMode);
      this.print(`<span class="term-success">Background mode switched to: [${newMode.toUpperCase()}]</span>`);
      window.cyberAudio.playSuccess();
    }
  }

  cmdAudio(args) {
    const state = args[0] ? args[0].toLowerCase() : '';
    if (state === 'on') {
      window.cyberAudio.init();
      window.cyberAudio.enabled = true;
      this.print(`<span class="term-success">Audio synthesizer ACTIVATED.</span>`);
    } else if (state === 'off') {
      window.cyberAudio.enabled = false;
      this.print(`<span class="term-warn">Audio synthesizer MUTED.</span>`);
    } else {
      const active = window.cyberAudio.toggle();
      this.print(`<span class="term-info">Audio synthesizer toggled: [${active ? 'ONLINE' : 'OFFLINE'}]</span>`);
    }
  }

  cmdStats() {
    const gh = window.githubConnector;
    const repoCount = gh && gh.reposData ? gh.reposData.length : 4;
    this.print(`
<div>
  <span class="term-cyan">CORE LOAD:</span> 12.4% (Nominal)<br/>
  <span class="term-cyan">ACTIVE REPOSITORIES:</span> ${repoCount}<br/>
  <span class="term-cyan">BANDWIDTH:</span> 1.2 Gbps Uplink<br/>
  <span class="term-cyan">FIREWALL:</span> Quantum Encrypted (AES-512)
</div>`);
  }

  cmdHack() {
    this.print(`<span class="term-warn">INITIALIZING ICE BREAKER PROTOCOL...</span>`);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      this.print(`<span class="term-dim">Bypassing subnet security layer... ${progress}%</span>`);
      window.cyberAudio.playKey();
      if (progress >= 100) {
        clearInterval(interval);
        this.print(`<span class="term-success">ACCESS GRANTED. Root privileges simulated. Welcome, NetRunner.</span>`);
        window.cyberAudio.playSuccess();
      }
    }, 250);
  }

  cmdSudo() {
    window.cyberAudio.playError();
    this.print(`<span class="term-error">ACCESS DENIED: Neural permission signature mismatch. lil-ichi is not in the sudoers file. This incident will be reported to Skynet.</span>`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.cyberTerminal = new CyberTerminal();
});
