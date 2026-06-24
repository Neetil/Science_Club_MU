# Live Chat Setup Guide

This guide covers every step needed to make the Telegram-powered live chat on **scienceclub.neetil.in** fully operational.

The chat bridges website visitors (Socket.IO) with Science Club members in a Telegram support group. There is no admin dashboard — members reply only in Telegram.

---

## Architecture

```
Website Visitor  ↔  Socket.IO Server (Railway/Render)  ↔  Telegram Bot  ↔  Telegram Group  ↔  Club Members
                              ↕
                         PostgreSQL
```

- **Frontend (Vercel):** Next.js chat widget in the home page hero
- **Backend (Railway or Render):** Express + Socket.IO + Telegram webhook
- **Database:** Same PostgreSQL used by the main site (Neon, etc.)

---

## Prerequisites

Before you start, make sure you have:

- [ ] A PostgreSQL database with `DATABASE_URL` (same one the main site uses)
- [ ] A Telegram account
- [ ] A Railway or Render account for the chat server
- [ ] Vercel access for the frontend deployment
- [ ] Admin access to the Science Club Telegram group

---

## Step 1: Run the database migration

The chat system adds `ChatSession` and `Message` tables. Apply the migration to your database.

**Locally:**

```bash
npx prisma migrate deploy
```

**On Vercel (production):** This runs automatically during `npm run build` because the build script includes `prisma migrate deploy`.

**Verify:**

```bash
npx prisma migrate status
```

You should see migration `20250624120000_add_chat_models` as applied.

---

## Step 2: Create a Telegram bot

1. Open Telegram and message [@BotFather](https://t.me/BotFather).
2. Send `/newbot` and follow the prompts.
3. Choose a name (e.g. `Science Club Support`) and a username (e.g. `scienceclub_support_bot`).
4. Copy the **bot token** BotFather gives you. This is your `TELEGRAM_BOT_TOKEN`.

---

## Step 3: Set up the Telegram support group

1. Create a Telegram **group** for club members (or use an existing one).
2. Add your bot to the group.
3. Make the bot a **group admin** so it can read all messages.
4. Get the group **chat ID**:
   - Add [@userinfobot](https://t.me/userinfobot) or [@RawDataBot](https://t.me/RawDataBot) to the group temporarily, or
   - Send a message in the group, then call:
     ```
     https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
     ```
   - Look for `"chat":{"id":-100xxxxxxxxxx}` — that number is your `TELEGRAM_CHAT_ID`.
   - Group IDs are usually negative (e.g. `-1001234567890`).

5. **Important:** Club members must use Telegram’s **Reply** feature when responding. Replies are how the bot routes messages to the correct visitor (`SC-104`, `SC-105`, etc.).

---

## Step 4: Deploy the chat backend (Railway or Render)

The chat server lives in the `server/` folder and must run **separately** from Vercel (Vercel cannot host long-running Socket.IO servers reliably).

### Option A: Railway

1. Go to [railway.app](https://railway.app) and create a new project.
2. Connect your GitHub repo (`Science-Club`).
3. Add a **PostgreSQL** service or link your existing `DATABASE_URL`.
4. Add environment variables:

   | Variable | Value |
   |----------|--------|
   | `DATABASE_URL` | Your PostgreSQL connection string |
   | `TELEGRAM_BOT_TOKEN` | From BotFather |
   | `TELEGRAM_CHAT_ID` | Group chat ID (e.g. `-1001234567890`) |
   | `TELEGRAM_WEBHOOK_URL` | `https://<your-railway-domain>/telegram/webhook` |
   | `TELEGRAM_WEBHOOK_SECRET` | A random secret string (optional but recommended) |
   | `FRONTEND_URL` | `https://scienceclub.neetil.in` |
   | `FRONTEND_URLS` | `https://scienceclub.neetil.in,http://localhost:3000` |
   | `PORT` | `5000` |
   | `NODE_ENV` | `production` |

5. Set the **start command** (Railway reads `railway.toml` automatically):
   ```
   npx tsx server/index.ts
   ```
6. Deploy and copy your public URL (e.g. `https://science-club-chat-production.up.railway.app`).

### Option B: Render

1. Go to [render.com](https://render.com) and create a new **Web Service**.
2. Connect the repo; use `render.yaml` or configure manually.
3. Set the same environment variables as above.
4. **Build command:** `npm install && npx prisma generate`
5. **Start command:** `npx tsx server/index.ts`
6. Copy your Render URL when deployed.

### Verify the backend

Open in a browser:

```
https://<your-backend-url>/health
```

You should see:

```json
{"status":"ok","timestamp":"..."}
```

---

## Step 5: Register the Telegram webhook

In production, the server tries to register the webhook on startup if `TELEGRAM_WEBHOOK_URL` is set.

**Manual registration (if needed):**

```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://<your-backend-url>/telegram/webhook","secret_token":"<TELEGRAM_WEBHOOK_SECRET>"}'
```

**Verify webhook:**

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

Expected: `"url"` matches your webhook URL and `"pending_update_count"` is 0 or low.

---

## Step 6: Configure the frontend (Vercel)

In your Vercel project settings → **Environment Variables**, add:

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SOCKET_URL` | `https://<your-backend-url>` (no trailing slash) |

Redeploy the frontend after adding this variable.

**Local development** — add to `.env.local`:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## Step 7: Test locally (optional but recommended)

**Terminal 1 — chat server:**

```bash
npm run dev:server
```

**Terminal 2 — Next.js:**

```bash
npm run dev
```

**Terminal 3 — expose webhook for Telegram (optional):** Use [ngrok](https://ngrok.com) if you want to test Telegram replies locally:

```bash
ngrok http 5000
```

Set `TELEGRAM_WEBHOOK_URL` to `https://<ngrok-url>/telegram/webhook`.

### Test checklist

- [ ] Open `http://localhost:3000` and click **Talk to a Club Member** in the hero.
- [ ] Click **Connect** — you should see `SC-104` (or next ID) and a waiting state.
- [ ] Check the Telegram group for the **New Chat Request** message.
- [ ] **Reply** to that message in Telegram — the website should show **Connected** and display your reply.
- [ ] Send a message from the website — it should appear in Telegram.
- [ ] Reply to the visitor message in Telegram — it should appear on the website.
- [ ] Close the chat — after ~8 seconds, Telegram should show **Visitor Disconnected**.
- [ ] Reopen within 10 minutes — session and messages should restore.

---

## Step 8: Production smoke test

After deploying both backend and frontend:

1. Visit `https://scienceclub.neetil.in`.
2. Open live chat from the hero section.
3. Connect and confirm Telegram notification.
4. Have a club member reply in Telegram.
5. Confirm two-way messaging works.

---

## Environment variables reference

See `.env.chat.example` for a template.

### Backend (Railway / Render)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `TELEGRAM_BOT_TOKEN` | Yes | Bot token from BotFather |
| `TELEGRAM_CHAT_ID` | Yes | Telegram group chat ID |
| `TELEGRAM_WEBHOOK_URL` | Yes (prod) | Full webhook URL |
| `TELEGRAM_WEBHOOK_SECRET` | Recommended | Validates incoming webhook requests |
| `FRONTEND_URL` | Yes | Primary frontend origin for CORS |
| `FRONTEND_URLS` | Optional | Comma-separated extra origins |
| `PORT` | Optional | Default `5000` |
| `NODE_ENV` | Yes (prod) | Set to `production` |

### Frontend (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SOCKET_URL` | Yes | Backend URL for Socket.IO |

---

## How club members use Telegram

Share these instructions with your team:

1. When a **New Chat Request** appears, tap **Reply** on that message.
2. Type your greeting (e.g. “Hello! I'm here to help.”).
3. For follow-up messages, **reply to the visitor’s message** in the group (not a new standalone message).
4. Each visitor has an ID like `SC-104` — always reply in the thread tied to that visitor.

---

## Troubleshooting

### Chat shows “Unable to start chat”

- Check `NEXT_PUBLIC_SOCKET_URL` on Vercel points to the live backend.
- Open browser DevTools → Network → confirm WebSocket connects to the backend.
- Confirm backend `/health` returns OK.

### Telegram notifications not appearing

- Verify `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`.
- Ensure the bot is in the group and is an admin.
- Test manually:
  ```bash
  curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
    -H "Content-Type: application/json" \
    -d '{"chat_id":"<CHAT_ID>","text":"Test from bot"}'
  ```

### Replies from Telegram not reaching the website

- Member must use **Reply**, not a new message.
- Check webhook: `getWebhookInfo` should show your URL with no errors.
- Check backend logs on Railway/Render for webhook errors.

### CORS / connection blocked

- Set `FRONTEND_URL=https://scienceclub.neetil.in` on the backend.
- Add the domain to `FRONTEND_URLS` if you use www or preview URLs.

### Migration errors on deploy

- Run `npx prisma migrate deploy` against production `DATABASE_URL` manually once.
- Ensure the database user can create tables and enums.

### Visitor disconnected too quickly on refresh

- The server waits **8 seconds** before sending a disconnect notice (to allow page refresh/reconnect).
- Sessions restore within **10 minutes** via localStorage.

### No member available (60 seconds)

- If nobody replies within 60 seconds, the visitor sees an email form.
- Submitting sends a **Missed Chat Request** notification to Telegram.

---

## Optional cleanup

- **Botpress (Astra AI):** Still loaded in `src/app/layout.tsx`. Consider removing `AstraBotpress` if you only want Telegram chat.
- **Music player:** Sits bottom-right like Botpress; adjust position in `MusicPlayer.tsx` if widgets overlap.

---

## Useful commands

```bash
# Run chat server locally
npm run dev:server

# Run chat server in production mode locally
npm run start:server

# Apply database migrations
npx prisma migrate deploy

# Regenerate Prisma client after schema changes
npx prisma generate

# Check migration status
npx prisma migrate status
```

---

## File reference

| Path | Purpose |
|------|---------|
| `server/index.ts` | Express app entry, webhook route |
| `server/socket.ts` | Socket.IO session handling |
| `server/lib/telegram.ts` | Telegram Bot API integration |
| `server/lib/session.ts` | Session and message persistence |
| `src/components/chat/` | Frontend chat UI |
| `prisma/schema.prisma` | `ChatSession` and `Message` models |
| `railway.toml` | Railway deployment config |
| `render.yaml` | Render deployment config |
| `.env.chat.example` | Environment variable template |

---

## Summary checklist

- [ ] Run `npx prisma migrate deploy` on production database
- [ ] Create Telegram bot and get token
- [ ] Create/add bot to support group and get chat ID
- [ ] Deploy backend to Railway or Render with all env vars
- [ ] Confirm `/health` works
- [ ] Register Telegram webhook
- [ ] Set `NEXT_PUBLIC_SOCKET_URL` on Vercel and redeploy
- [ ] Test full flow on production
- [ ] Brief club members on replying in Telegram threads

Once every box is checked, live chat is fully operational.
