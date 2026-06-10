# 🎮 GamePal – AI Gaming Companion PWA

> Your intelligent AI-powered gaming assistant. Discover, organize, and track games through natural conversation.

![GamePal](icons/screenshot-wide.png)

---

## ✨ Features

- 💬 **AI Chat** – Talk naturally to find games ("RPG games for PS1", "games like Dark Souls")
- 🔍 **Smart Search** – Claude AI interprets your message → searches the RAWG database (500,000+ games)
- 📚 **Game Library** – Organize games into Backlog / Playing / Finished
- ⭐ **Ratings** – Rate finished games 1–10
- 📱 **PWA** – Install on any device (iOS, Android, Desktop) like a native app
- 🌙 **Dark Mode** – Always-on beautiful dark UI
- 💾 **Offline-ready** – App shell cached by Service Worker
- 🔑 **Your keys** – API keys stored only on your device

---

## 🚀 Deploy to GitHub Pages (5 minutes)

### Step 1 — Fork or create repo

```bash
# Option A: Clone this repo
git clone https://github.com/YOUR_USERNAME/gamepal.git
cd gamepal

# Option B: Create new repo and copy files
git init
git add .
git commit -m "Initial GamePal PWA"
git remote add origin https://github.com/YOUR_USERNAME/gamepal.git
git push -u origin main
```

### Step 2 — Enable GitHub Pages

1. Go to your repo on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**, select **GitHub Actions**
4. Push any commit — the workflow auto-deploys!

Your app will be live at:
```
https://YOUR_USERNAME.github.io/gamepal/
```

> ⚠️ **Important:** If your repo is named something other than `gamepal`, update the `start_url` and `scope` in `manifest.json` to match. GitHub Pages serves from `/{repo-name}/`.

---

## 🔑 API Keys Setup

After opening the app, go to **Settings** (⚙️) to add your keys:

### Google Gemini API Key (Required · 100% Free)
Powers the AI chat — no credit card, no cost.
1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with any Google account
3. Click **"Create API key"** → copy it
4. Paste it in GamePal Settings → Save

**Free tier limits:** 15 requests/min · 1,500 requests/day · 1M tokens/day — more than enough for personal use!

### RAWG API Key (Optional · Free)
Higher rate limits for game search. The app works without it.
1. Go to [rawg.io/apidocs](https://rawg.io/apidocs)
2. Sign up free → get your key
3. Paste it in GamePal Settings

> Keys are stored only in your browser's `localStorage`. They never leave your device except to call the respective APIs directly.

---

## 📱 Install as App

### iPhone / iPad (iOS)
1. Open in **Safari**
2. Tap the **Share** button (box with arrow)
3. Tap **"Add to Home Screen"**
4. Tap **Add** → GamePal appears on your home screen!

### Android (Chrome)
1. Open in **Chrome**
2. Tap the menu **⋮**
3. Tap **"Install app"** or **"Add to Home Screen"**

### Desktop (Chrome / Edge)
1. Look for the **⊕ install icon** in the address bar
2. Click it → **Install**

---

## 💬 Example Prompts

```
RPG games for PlayStation 1
Games similar to Dark Souls
Best Nintendo Switch games 2023
Top indie games of all time
Short horror games
Melhores jogos de aventura para PC
Jogos parecidos com Final Fantasy VII
Games with great story
Hidden gem strategy games
New releases this year
```

---

## 🗂 Project Structure

```
gamepal/
├── index.html          # App entry point + PWA meta tags
├── app.js              # Full React app (Babel standalone, no build needed)
├── sw.js               # Service Worker (offline + caching)
├── manifest.json       # PWA manifest
├── icons/              # All PWA icons (72–512px) + screenshots
│   ├── icon-72.png
│   ├── icon-192.png
│   ├── icon-512.png
│   └── ...
├── .github/
│   └── workflows/
│       └── deploy.yml  # Auto-deploy to GitHub Pages
├── generate_icons.py   # Icon generation script (run once)
└── README.md
```

---

## 🏗 Architecture

```
User Message
    ↓
Google Gemini AI (gemini-2.0-flash · FREE)
    ↓ JSON: { action, params, message }
    ↓
RAWG API (500k+ games database)
    ↓
Game Cards rendered in chat
    ↓
localStorage (library, ratings, history)
```

**No backend. No database. No build step.** Pure static files.

---

## 🔧 Local Development

No build tools needed! Just serve the files:

```bash
# Python
python3 -m http.server 3000

# Node.js
npx serve .

# VS Code
# Install "Live Server" extension → right-click index.html → Open with Live Server
```

Then open `http://localhost:3000`

---

## 🗺 Roadmap

- [ ] Cloud sync (optional, user-provided backend)
- [ ] Import from Steam / PlayStation library
- [ ] Game detail pages with full info
- [ ] Friends & compare libraries
- [ ] Push notifications for game releases
- [ ] Export library to CSV/JSON

---

## 📄 License

MIT — use freely, fork freely, build on it!

---

Made with 🎮 + Claude AI
