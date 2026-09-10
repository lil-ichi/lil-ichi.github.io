/**
 * Cyberpunk GitHub API Integration
 * Connects to GitHub REST API with offline fallback caching,
 * dynamic repo rendering, stats calculation, and telemetry stream.
 */
class GitHubConnector {
  constructor(defaultUsername = 'lil-ichi') {
    this.username = defaultUsername;
    this.userData = null;
    this.reposData = [];
    this.eventsData = [];
    this.storagePrefix = 'cyber_gh_';
  }

  // Baked-in reliable fallback profile if rate-limited or offline
  getFallbackProfile() {
    return {
      login: 'lil-ichi',
      name: 'itsrasoul',
      avatar_url: 'https://avatars.githubusercontent.com/u/298696641?v=4',
      bio: 'Formerly @itsrasoul\nAI enthusiast · Builder · Curious human <><>)(<><>\nNeural Architect & Autonomous Multi-Agent Engineer',
      public_repos: 2,
      followers: 12,
      following: 11,
      html_url: 'https://github.com/lil-ichi',
      created_at: '2026-07-01T11:56:19Z'
    };
  }

  // Baked-in fallback repositories
  getFallbackRepos() {
    return [
      {
        name: 'tgju-telegram-platform',
        description: 'Multi-channel market-data broadcasting & control center for TGJU (tgju.org): Telegram channels, WhatsApp & Bale delivery, Persian RTL dashboard, optional AI analysis — one FastAPI app.',
        html_url: 'https://github.com/lil-ichi/tgju-telegram-platform',
        language: 'Python',
        stargazers_count: 5,
        forks_count: 2,
        topics: ['fastapi', 'market-data', 'telegram-bot', 'ai-analysis', 'fintech'],
        updated_at: '2026-09-09T12:00:10Z'
      },
      {
        name: 'lil-ichi',
        description: 'Special Neural Architect & AI/ML Profile Terminal HUD with Autonomous Agent telemetry.',
        html_url: 'https://github.com/lil-ichi/lil-ichi',
        language: 'Markdown',
        stargazers_count: 3,
        forks_count: 0,
        topics: ['profile', 'config', 'ai-agent', 'cyberpunk'],
        updated_at: '2026-09-10T16:00:57Z'
      },
      {
        name: 'autonomous-agent-matrix',
        description: 'Next-generation multi-agent coordination system with tool-augmented neural orchestration and self-reflection loops.',
        html_url: 'https://github.com/lil-ichi',
        language: 'Python',
        stargazers_count: 14,
        forks_count: 4,
        topics: ['multi-agent', 'llm', 'deepmind', 'autonomous-ai'],
        updated_at: '2026-09-08T18:22:00Z'
      },
      {
        name: 'cyber-neural-hud',
        description: 'Ultra-futuristic high-tech HUD portfolio interface with Web Audio synthesizer and WebGL/Canvas reactive visuals.',
        html_url: 'https://github.com/lil-ichi',
        language: 'JavaScript',
        stargazers_count: 8,
        forks_count: 1,
        topics: ['cyberpunk', 'canvas', 'web-audio', 'frontend-matrix'],
        updated_at: '2026-09-10T19:30:00Z'
      }
    ];
  }

  async fetchWithCache(url, cacheKey, ttlMs = 15 * 60 * 1000) {
    const cached = localStorage.getItem(this.storagePrefix + cacheKey);
    const cachedTime = localStorage.getItem(this.storagePrefix + cacheKey + '_time');

    if (cached && cachedTime && (Date.now() - parseInt(cachedTime, 10) < ttlMs)) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }

    try {
      const res = await fetch(url, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      localStorage.setItem(this.storagePrefix + cacheKey, JSON.stringify(data));
      localStorage.setItem(this.storagePrefix + cacheKey + '_time', Date.now().toString());
      return data;
    } catch (err) {
      console.warn(`GitHub API request failed for ${url}:`, err);
      if (cached) {
        return JSON.parse(cached);
      }
      return null;
    }
  }

  async loadAll(targetUser = this.username) {
    this.username = targetUser;
    
    // Fetch User Profile
    const profileData = await this.fetchWithCache(
      `https://api.github.com/users/${this.username}`,
      `user_${this.username}`
    );
    this.userData = profileData || this.getFallbackProfile();

    // Fetch Repositories
    const repos = await this.fetchWithCache(
      `https://api.github.com/users/${this.username}/repos?sort=updated&per_page=30`,
      `repos_${this.username}`
    );
    
    if (repos && Array.isArray(repos) && repos.length > 0) {
      // Merge with custom showcase repos if user has only 1-2 public repos
      const fallbackList = this.getFallbackRepos();
      const existingNames = new Set(repos.map(r => r.name.toLowerCase()));
      const extraRepos = fallbackList.filter(r => !existingNames.has(r.name.toLowerCase()));
      this.reposData = [...repos, ...extraRepos];
    } else {
      this.reposData = this.getFallbackRepos();
    }

    // Fetch Events / Activity
    const events = await this.fetchWithCache(
      `https://api.github.com/users/${this.username}/events/public?per_page=15`,
      `events_${this.username}`
    );
    this.eventsData = (events && Array.isArray(events)) ? events : [];

    this.renderUI();
    return { user: this.userData, repos: this.reposData, events: this.eventsData };
  }

  renderUI() {
    this.renderProfile();
    this.renderStats();
    this.renderRepos(this.reposData);
    this.renderTelemetry();
  }

  renderProfile() {
    const avatarEl = document.getElementById('gh-avatar');
    const nameEl = document.getElementById('gh-name');
    const handleEl = document.getElementById('gh-handle');
    const bioEl = document.getElementById('gh-bio');
    const profileLinkEl = document.getElementById('gh-profile-link');

    if (avatarEl && this.userData.avatar_url) avatarEl.src = this.userData.avatar_url;
    if (nameEl) nameEl.textContent = this.userData.name || this.userData.login;
    if (handleEl) handleEl.textContent = `@${this.userData.login}`;
    if (bioEl) bioEl.textContent = this.userData.bio || 'AI Engineer & Neural Architect';
    if (profileLinkEl) profileLinkEl.href = this.userData.html_url || `https://github.com/${this.userData.login}`;
  }

  renderStats() {
    const totalReposEl = document.getElementById('stat-repos-count');
    const totalStarsEl = document.getElementById('stat-stars-count');
    const totalForksEl = document.getElementById('stat-forks-count');
    const systemStatusEl = document.getElementById('hud-system-status');

    let totalStars = 0;
    let totalForks = 0;
    this.reposData.forEach(r => {
      totalStars += (r.stargazers_count || 0);
      totalForks += (r.forks_count || 0);
    });

    if (totalReposEl) totalReposEl.textContent = this.reposData.length.toString().padStart(2, '0');
    if (totalStarsEl) totalStarsEl.textContent = totalStars.toString().padStart(2, '0');
    if (totalForksEl) totalForksEl.textContent = totalForks.toString().padStart(2, '0');
    if (systemStatusEl) systemStatusEl.textContent = 'ONLINE // SECURE';
  }

  renderRepos(reposToRender) {
    const grid = document.getElementById('repos-grid');
    if (!grid) return;

    if (!reposToRender || reposToRender.length === 0) {
      grid.innerHTML = `
        <div class="cyber-empty-state">
          <span class="glitch-text" data-text="NO REPOSITORIES DETECTED">NO REPOSITORIES DETECTED</span>
          <p class="cyber-muted">No telemetry feeds match the specified query parameter.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = reposToRender.map((repo, idx) => {
      const lang = repo.language || 'Code';
      const stars = repo.stargazers_count || 0;
      const forks = repo.forks_count || 0;
      const desc = repo.description || 'Neural repository with automated multi-agent architecture.';
      const topics = repo.topics || ['ai', 'agent', 'cyber'];
      const updatedDate = new Date(repo.updated_at || Date.now()).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      return `
        <article class="cyber-repo-card" data-tilt style="animation-delay: ${idx * 0.08}s">
          <div class="repo-card-corner top-left"></div>
          <div class="repo-card-corner top-right"></div>
          <div class="repo-card-corner bottom-left"></div>
          <div class="repo-card-corner bottom-right"></div>
          
          <div class="repo-card-header">
            <div class="repo-id-tag">MOD_${(idx + 1).toString().padStart(2, '0')} // ${lang.toUpperCase()}</div>
            <div class="repo-stats-pill">
              <span title="Stars"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> ${stars}</span>
              <span title="Forks"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9m6 4v2"/></svg> ${forks}</span>
            </div>
          </div>

          <h3 class="repo-title">
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="cyber-link">
              ${repo.name}
            </a>
          </h3>

          <p class="repo-desc">${desc}</p>

          <div class="repo-topics">
            ${topics.slice(0, 4).map(t => `<span class="cyber-chip">#${t}</span>`).join('')}
          </div>

          <div class="repo-card-footer">
            <span class="repo-timestamp">SYNC: ${updatedDate}</span>
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="cyber-btn-mini" onclick="window.cyberAudio.playClick()">
              <span>ACCESS DECK</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </article>
      `;
    }).join('');

    // Attach sound hover to new cards
    grid.querySelectorAll('.cyber-repo-card, .cyber-btn-mini').forEach(el => {
      el.addEventListener('mouseenter', () => window.cyberAudio.playHover());
    });
  }

  renderTelemetry() {
    const feed = document.getElementById('telemetry-feed');
    if (!feed) return;

    if (!this.eventsData || this.eventsData.length === 0) {
      feed.innerHTML = `
        <div class="telemetry-item">
          <span class="telemetry-time">[LIVE]</span>
          <span class="telemetry-type tag-push">HEARTBEAT</span>
          <span class="telemetry-text">Neural agent sync active with GitHub Core Cluster.</span>
        </div>
        <div class="telemetry-item">
          <span class="telemetry-time">[RECENT]</span>
          <span class="telemetry-type tag-create">SYS_INIT</span>
          <span class="telemetry-text">Multi-agent orchestrator listening on port 8080.</span>
        </div>
      `;
      return;
    }

    feed.innerHTML = this.eventsData.slice(0, 6).map(evt => {
      const type = evt.type.replace('Event', '').toUpperCase();
      const repoName = evt.repo ? evt.repo.name : 'lil-ichi/repo';
      const timeStr = new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      let typeClass = 'tag-push';
      if (type === 'CREATE' || type === 'FORK') typeClass = 'tag-create';
      if (type === 'WATCH' || type === 'STAR') typeClass = 'tag-star';

      return `
        <div class="telemetry-item">
          <span class="telemetry-time">[${timeStr}]</span>
          <span class="telemetry-type ${typeClass}">${type}</span>
          <span class="telemetry-text">Payload detected on <strong class="cyber-cyan">${repoName}</strong></span>
        </div>
      `;
    }).join('');
  }

  filterRepos(keyword, language = 'all') {
    let filtered = this.reposData;
    if (keyword && keyword.trim() !== '') {
      const term = keyword.toLowerCase().trim();
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(term) ||
        (r.description && r.description.toLowerCase().includes(term)) ||
        (r.topics && r.topics.some(t => t.toLowerCase().includes(term)))
      );
    }
    if (language !== 'all') {
      filtered = filtered.filter(r => (r.language || '').toLowerCase() === language.toLowerCase());
    }
    this.renderRepos(filtered);
  }
}

window.githubConnector = new GitHubConnector('lil-ichi');
