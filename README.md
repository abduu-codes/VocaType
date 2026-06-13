# 🎙 VocaType — Voice to Text Editor

> Built by **Muhammad Abdullah** · UET Lahore · BS Computer Science (Gaming & Animation) · 2026

A fully free, browser-based voice-to-text editor with real-time transcription, AI-powered spell correction, rich text formatting, and support for 43 languages — built with pure HTML, CSS, and JavaScript. No backend. No API keys. No cost.

---

## 🌐 Live Demo

Hosted on GitHub Pages → `https://abduu-codes.github.io/VocaType/`

---

## ✨ Features

### 🎤 Voice Recognition
- Real-time transcription — words appear **instantly** as you speak
- Interim text shows live in the editor while you are mid-sentence
- Mic **never stops** automatically — auto-restarts after every silence pause
- Handles **network errors** silently and recovers without user action
- Press **Space** to toggle mic on/off, **Esc** to stop

### 🌍 43 Languages Supported
Urdu · Arabic · English (US/UK) · Chinese · Hindi · Spanish · French · German · Italian · Portuguese · Russian · Japanese · Korean · Turkish · Dutch · Polish · Swedish · Danish · Finnish · Norwegian · Czech · Slovak · Hungarian · Romanian · Bulgarian · Ukrainian · Greek · Hebrew · Persian · Bengali · Tamil · Telugu · Malayalam · Thai · Vietnamese · Indonesian · Malay · Filipino · Swahili · Afrikaans · Catalan · Croatian · and more

### 🤖 Smart Spell Correction
- Built-in dictionary of 150+ common voice-to-text mistakes
- Fixes instantly in 0ms — no network call, no delay
- Examples: `definately → definitely`, `recieve → receive`, `powerfull → powerful`
- English only — other languages are written exactly as spoken (no corruption)
- Toggle ON/OFF with the **AI Correct** button in the header

### ✏️ Rich Text Editor
- **Bold**, *Italic*, Underline, Strikethrough
- 40+ font families (Serif, Sans-serif, Monospace, Handwriting)
- Font sizes from 8px to 48px
- Text color picker
- Highlight / background color picker
- Align Left, Center, Right, Justify
- Bullet lists and numbered lists
- Undo / Redo
- Clear formatting

### 💾 Save & Export
- **Copy** — copies plain text to clipboard
- **Save** — downloads as `.txt` file with today's date in filename
- **Auto-save** — saves draft to browser localStorage every 10 seconds
- Draft is restored automatically on next visit

### 🎨 Design
- Dark mode by default, light mode toggle saved across sessions
- Animated mic pulse rings when recording
- Live sound waveform bars while listening
- Scrolling rainbow bar at top of page during recording
- Luxury typography — Cormorant Garamond + Josefin Sans + Fira Code
- Punctuation hints — wavy yellow underline on sentences missing `.  ,  ?  !`
- Fully responsive — works on mobile and desktop

---

## 📁 Project Structure

```
vocatype/
├── index.html      # Full page structure and toolbar (354 lines)
├── style.css       # Complete design system, themes, animations (537 lines)
├── app.js          # Voice recognition, editor logic, spell fix (553 lines)
└── README.md       # This file
```

No frameworks. No npm. No build tools. Just three files.

---

## 🚀 How to Run Locally

### Requirements
- [VS Code](https://code.visualstudio.com/) — free code editor
- [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) — by Ritwick Dey
- Google Chrome or Microsoft Edge (Firefox does not support Web Speech API)

### Steps

**1.** Clone or download this repository
```bash
git clone https://github.com/abduu-codes/vocatype.git
```

**2.** Open the `vocatype` folder in VS Code
```
File → Open Folder → select vocatype
```

**3.** Right-click `index.html` in the file explorer → **Open with Live Server**

**4.** Chrome opens at `http://127.0.0.1:5500`

**5.** Click the purple mic button → allow microphone permission → speak

> ⚠️ **Important:** Do NOT open `index.html` by double-clicking it. The URL must start with `http://` not `file://` — otherwise Chrome blocks the microphone and voice recognition will not work.

---

## 🌐 Deploy to GitHub Pages (Free Hosting)

**1.** Create a free account at [github.com](https://github.com)

**2.** Create a new repository named `vocatype`

**3.** Upload your 3 files (`index.html`, `style.css`, `app.js`)

**4.** Go to repository **Settings → Pages → Source → main branch → Save**

**5.** Your live URL: `https://your-username.github.io/vocatype`

Share this link in your resume and portfolio — employers can open it instantly without installing anything.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Toggle mic on/off (when not typing) |
| `Esc` | Stop recording |
| `Ctrl + B` | Bold |
| `Ctrl + I` | Italic |
| `Ctrl + U` | Underline |
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |

---

## 🛠 Technology Stack

| Technology | Purpose | Cost |
|------------|---------|------|
| HTML5 | Page structure | Free |
| CSS3 | Styling, animations, themes | Free |
| JavaScript (ES6+) | All logic, no framework | Free |
| Web Speech API | Voice recognition, 43 languages | Free (built into Chrome) |
| Google Fonts | 40+ typography options | Free |
| GitHub Pages | Live hosting with public URL | Free |
| localStorage | Auto-save drafts locally | Free (browser built-in) |

**Total cost: $0**

---

## 🧠 How the Voice Recognition Works

```
You speak
    ↓
Chrome sends audio to Google's servers (Web Speech API)
    ↓
Every ~200ms: INTERIM result → appears live in editor (purple)
    ↓
You pause: FINAL result → replaces interim, spell-fixed permanently
    ↓
Chrome ends session after silence → VocaType restarts in 120ms
    ↓
Mic is always listening until YOU click stop
```

### Why text appears instantly
Most voice apps wait for the `isFinal` result which takes 1–2 seconds after you stop speaking. VocaType writes **interim** results directly into the editor as a live `<span>` — so you see every word the moment you say it. When the final confirmed version arrives, it replaces the interim span silently.

### Why the mic never stops
Chrome's Web Speech API automatically ends every session after about 5 seconds of silence, and also on network blips. VocaType's `onend` handler checks if the user is still supposed to be recording — if yes, it immediately builds a new session and starts it. This loop runs indefinitely until the user clicks the mic button.

---

## 🗺 Project Roadmap

- [x] Week 1 — Voice recognition, 43 languages, dark/light theme
- [x] Week 2 — Rich text editor, 40+ fonts, colors, formatting toolbar
- [x] Week 3 — Smart spell correction, punctuation hints, auto-save
- [x] Week 4 — Mic stability (auto-restart, network recovery), multi-language fix
- [ ] Week 5 — GitHub Pages deployment, final polish, resume ready

---

## 👨‍💻 About the Developer

**Muhammad Abdullah**
- 🎓 BS Computer Science — Gaming & Animation
- 🏫 University of Engineering & Technology (UET), Lahore
- 🐙 GitHub: [@abduu-codes](https://github.com/abduu-codes)
- 📅 2nd Semester · 2026

This project was built to demonstrate real skills in frontend web development, browser APIs, UX design, and practical problem-solving — all without a backend, framework, or any paid service.

---

## 📄 License

MIT License — free to use, modify, and share.
