/**
 * Cyberpunk GitHub API Integration
 * Pure live connection to GitHub REST API.
 * Renders only genuine repositories, stats, and real telemetry events.
 */
class GitHubConnector {
  constructor(defaultUsername = 'lil-ichi') {
    this.username = defaultUsername;
    this.userData = null;
    this.reposData = [];
    this.eventsData = [];
    this.storagePrefix = 'cyber_gh_live_';
  }

  // Baseline fallback representation of user's real profile
  getFallbackProfile() {
    return {
      login: 'lil-ichi',
      name: 'itsrasoul',
      avatar_url: 'https://avatars.githubusercontent.com/u/298696641?v=4',
      bio: 'Formerly @itsrasoul\nAI enthusiast · Builder · Curious human <><>)(<><>\nNew account — courtesy of GitHub. 🫠',
      public_repos: 3,
      followers: 0,
      following: 11,
      html_url: 'https://github.com/lil-ichi',
      created_at: '2026-07-01T11:56:19Z'
    };
  }

  // Baseline real repositories only
  getFallbackRepos() {
    return [
      {
        name: 'tgju-telegram-platform',
        description: 'Multi-channel market-data broadcasting & control center for TGJU (tgju.org): Telegram channels, WhatsApp & Bale delivery, Persian RTL dashboard, optional AI analysis — one FastAPI app.',
        html_url: 'https://github.com/lil-ichi/tgju-telegram-platform',
        language: 'Python',
        stargazers_count: 0,
        forks_count: 0,
        topics: ['fastapi', 'market-data', 'telegram-bot', 'ai-analysis'],
        updated_at: '2026-09-09T12:00:10Z'
      },
      {
        name: 'lil-ichi',
        description: 'Neural Architect & AI/ML Profile Configuration.',
        html_url: 'https://github.com/lil-ichi/lil-ichi',
        language: 'Markdown',
        stargazers_count: 0,
        forks_count: 0,
        topics: ['profile', 'config', 'ai-agent'],
        updated_at: '2026-09-10T16:00:57Z'
      },
      {
        name: 'lil-ichi.github.io',
        description: 'Ultra-futuristic Cyberpunk / NetRunner HUD portfolio website connected directly to GitHub.',
        html_url: 'https://github.com/lil-ichi/lil-ichi.github.io',
        language: 'HTML',
        stargazers_count: 0,
        forks_count: 0,
        topics: ['cyberpunk', 'portfolio', 'github-pages', 'web-audio'],
        updated_at: '2026-09-10T19:35:00Z'
      }
    ];
  }

  async fetchWithCache(url, cacheKey, ttlMs = 5 * 60 * 1000) {
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
    
    // Clear old outdated caches
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cyber_gh_') && !key.startsWith('cyber_gh_live_')) {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {}

    // Fetch User Profile
    const profileData = await this.fetchWithCache(
      `https://api.github.com/users/${this.username}`,
      `user_${this.username}`
    );
    this.userData = profileData || this.getFallbackProfile();

    // Fetch Actual User Repositories
    const repos = await this.fetchWithCache(
      `https://api.github.com/users/${this.username}/repos?sort=updated&per_page=50`,
      `repos_${this.username}`
    );
    
    if (repos && Array.isArray(repos) && repos.length > 0) {
      this.reposData = repos;
    } else {
      this.reposData = this.getFallbackRepos();
    }

    // Fetch Real GitHub Events
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
    if (bioEl) bioEl.textContent = this.userData.bio || 'AI enthusiast · Builder · Curious human';
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

    const repoCount = this.userData.public_repos !== undefined ? this.userData.public_repos : this.reposData.length;

    if (totalReposEl) totalReposEl.textContent = repoCount.toString().padStart(2, '0');
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
      const desc = repo.description || 'Public GitHub repository.';
      const topics = repo.topics && repo.topics.length > 0 ? repo.topics : [lang.toLowerCase()];
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
          <span class="telemetry-type tag-push">SYNCED</span>
          <span class="telemetry-text">Node connected to GitHub cluster. Telemetry channel active for <strong class="cyber-cyan">@${this.username}</strong>.</span>
        </div>
      `;
      return;
    }

    feed.innerHTML = this.eventsData.slice(0, 6).map(evt => {
      const type = evt.type.replace('Event', '').toUpperCase();
      const repoName = evt.repo ? evt.repo.name : `${this.username}/repo`;
      const timeStr = new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      let typeClass = 'tag-push';
      if (type === 'CREATE' || type === 'FORK') typeClass = 'tag-create';
      if (type === 'WATCH' || type === 'STAR') typeClass = 'tag-star';

      return `
        <div class="telemetry-item">
          <span class="telemetry-time">[${timeStr}]</span>
          <span class="telemetry-type ${typeClass}">${type}</span>
          <span class="telemetry-text">Action recorded on <strong class="cyber-cyan">${repoName}</strong></span>
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
