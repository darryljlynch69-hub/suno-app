# Suno Prompt Builder

Mobile-first React app for crafting professional Suno AI music prompts.

## Features

- **6 AI Tools**: Reference Track Analyzer, Concept Expander, Tag Optimizer, Cover Reimaginer, Lyric Translator, Prompt Critic
- **Lyric Tools**: AI Coach, Improve Selection, Title Generator, Hook Maker
- **Audio**: Playback with real EQ, Vocal Coach RMS meter, Pitch Contour analyzer with adjustments
- **Workflow**: Hit Library (80+ songs), Style DNA picker, Track Timeline, 3 Suno output cards
- **iOS Native**: Bottom tab bar, dark mode, haptics, PWA-ready, native share sheet

---

## 🚀 Deploy to Vercel via GitHub (Step-by-Step)

### Prerequisites
- A GitHub account (free)
- A Vercel account (free, sign up with your GitHub)
- An Anthropic API key — get one at [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
- Optional: An OpenAI API key for Whisper audio transcription

### Step 1: Push to GitHub

```bash
# In this project folder
git init
git add .
git commit -m "Initial commit"

# Create a new empty repo on github.com (don't add README), then:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/suno-prompt-builder.git
git push -u origin main
```

### Step 2: Connect Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your `suno-prompt-builder` repo
4. Vercel auto-detects Vite — leave all settings as default
5. **DO NOT click Deploy yet** — first add env vars (Step 3)

### Step 3: Add Environment Variables

Before deploying, click **Environment Variables** and add:

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | Your `sk-ant-...` key |
| `OPENAI_API_KEY` | Your `sk-...` key (only if you want Whisper transcription) |

Then click **Deploy**.

### Step 4: Use it on iPhone

1. Wait ~2 minutes for the deploy to finish
2. Open the deploy URL on your iPhone (e.g. `suno-prompt-builder.vercel.app`)
3. Tap the **Share** button → **Add to Home Screen**
4. Now you have a real app icon that launches full-screen

---

## 🔧 Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

For local development of API features, create a `.env.local` file (already gitignored):

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENAI_API_KEY=sk-your-key-here
```

Then use Vercel CLI to run with serverless functions locally:

```bash
npm install -g vercel
vercel dev
```

This runs the proxies at `/api/claude` and `/api/whisper` locally so the AI features work in development.

---

## 📁 Project Structure

```
suno-app/
├── api/
│   ├── claude.js       # Vercel serverless proxy for Anthropic
│   └── whisper.js      # Vercel serverless proxy for OpenAI Whisper
├── src/
│   ├── App.jsx         # Main React app (~5000 lines)
│   ├── main.jsx        # React entry point
│   └── index.css       # Tailwind imports
├── index.html          # iOS PWA meta tags
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## 🛡️ Security Notes

- API keys live ONLY in Vercel environment variables — never in browser code
- The `/api/claude` and `/api/whisper` serverless functions act as authenticated proxies
- Auto-saved data (lyrics, tags, etc.) stays in the user's browser localStorage
- Add CORS restrictions to `api/claude.js` to lock the proxy to your domain in production

---

## 💰 Cost Estimate

- **Anthropic API**: ~$0.003 per AI call. A typical session uses 10-20 calls = ~$0.05
- **OpenAI Whisper**: $0.006/minute of audio
- **Vercel**: Free tier covers personal use indefinitely

---

## ⚠️ What Genuinely Works vs Limitations

**Works perfectly** (with API key configured):
- All 6 AI Power Tools
- Title Generator, Hook Maker, AI Lyric Coach, Improve Selection
- Audio playback + biquad EQ filters
- Vocal Coach RMS analysis
- Pitch contour with transpose/snap-to-key adjustments
- Whisper transcription
- Track Timeline drag/resize
- Auto-save to localStorage
- Native iOS share sheet
- 3 Suno output cards (these ARE the Suno fields)

**Real limitations**:
- Pitch detection works best on isolated vocals, not full mixes
- No sheet music output (polyphonic-to-notation isn't reliable in browsers)
- No stem separation (can't split vocals from music in arbitrary audio)
- Hit Library DNA tags are educated guesses, not official credits
