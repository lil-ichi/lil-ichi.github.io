# ⚡ LIL-ICHI // Cyberpunk Neural Portfolio & HUD

> Ultra-futuristic, high-tech NetRunner HUD portfolio website for **lil-ichi** (`itsrasoul`), built with zero external dependencies, procedural Web Audio synthesis, interactive Canvas particle/matrix backgrounds, dynamic GitHub API integration, and an embedded CLI terminal.

---

## 🚀 Live Features

1. **Procedural Web Audio Synthesizer**:
   - Pure real-time audio generation using the browser's Web Audio API.
   - Interactive cyber clicks, chirps, laser hums, terminal keystrokes, and error/success alarms with persistent HUD audio toggles.

2. **Interactive Background Engine**:
   - Real-time reactive neural particle mesh with mouse collision repulsion.
   - Matrix digital code rain mode toggle.

3. **Live GitHub REST API Integration**:
   - Dynamically loads profile details (avatar, bio, follower counters, repo counts).
   - Live repository deck with language badges, stars, forks, search input, and language category filters.
   - Live telemetry event stream of recent GitHub actions with automatic offline cache fallback.

4. **NetRunner CLI (Terminal Modal)**:
   - Interactive command line with command history, tab autocompletion, and rich output (`neofetch`, `repos`, `skills`, `theme`, `matrix`, `hack`, `stats`, `whoami`, `contact`, `clear`).

5. **Multi-Chromatic Cyber Themes**:
   - **Neon Cyberpunk** (Cyan & Magenta)
   - **Matrix Green** (Phosphor terminal)
   - **Synthwave Sunset** (Amber & Violet)
   - **Stealth Void** (Dark tactical)

---

## 🌐 Deploying to GitHub Pages

### Option 1: Automatic GitHub Actions (Recommended)
This repository includes `.github/workflows/deploy.yml`.
1. Push this folder to your GitHub repository (e.g. `https://github.com/lil-ichi/lil-ichi.github.io` or any custom repo name).
2. On GitHub, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. Push to `main` — GitHub Actions will automatically deploy your page to `https://lil-ichi.github.io`!

### Option 2: Deploy via `main` Branch
1. In **Settings** > **Pages**, under **Source**, select **Deploy from a branch**.
2. Select branch `main` and root folder `/`.
3. Click **Save**.

---

## 💻 Local Testing & Preview

You can start a local development server using Python:

```bash
# In this directory:
python -m http.server 3000
```

Then navigate to `http://localhost:3000` in your web browser.

---

## 🛠️ Project Structure

```
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions workflow for automatic Pages deployment
├── index.html              # Main semantic HTML5 structure & HUD layout
├── style.css               # Futuristic cyberpunk styling & CSS design system
├── app.js                  # Main controller, HUD telemetry, 3D tilt & toasts
├── audio.js                # Procedural Web Audio API sound synthesizer
├── canvas.js               # Interactive particle network & Matrix rain engine
├── github-api.js           # Live GitHub REST API connector with offline cache
└── README.md               # Documentation & setup guide
```
