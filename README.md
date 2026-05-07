# 🪙 Sentimental Satoshi

> An algorithmic crypto sentiment and trade validator — combining AI-powered social sentiment analysis, on-chain whale tracking, and US congressional trade disclosures into a single unified conviction score.

![Architecture](docs/images/architecture.svg)

---

## What it does

Sentimental Satoshi pulls data from three independent signal streams and combines them into a **Smart Money Score (0–100)** per crypto asset:

| Signal | Weight | Source |
|---|---|---|
| **AI Sentiment** | 45% | CryptoBERT NLP on 150–300 social posts per analysis |
| **Whale Activity** | 30% | On-chain ETH/SOL/BTC wallet tracking via Etherscan + Helius |
| **Congress Trades** | 25% | STOCK Act disclosures — senators buying crypto-adjacent stocks |

A score above 65 signals bullish conviction. Below 35 signals bearish. Signals are pushed to the browser live via WebSocket the moment analysis completes.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Lightweight Charts, Socket.io client |
| Backend API | Node.js 20, Express, Prisma (ORM), BullMQ (job queue), Socket.io |
| AI Service | Python 3.11, FastAPI, CryptoBERT (HuggingFace), spaCy NER, scikit-learn |
| Wallet Tracker | Spring Boot 3, Java 21, HikariCP, Spring Data JPA, `@Scheduled` |
| Senator Tracker | Spring Boot 3, Java 21, Jackson XML, Senate EFTS API |
| Database | Supabase (PostgreSQL 15) — shared across all services |
| Queue | Redis 7 (local) via BullMQ |
| Auth | JWT access tokens (15 min) + refresh token rotation (7 days) |

---

## Project Structure

```
sentimental-satoshi/
├── apps/
│   ├── frontend/          # Next.js 14 dashboard
│   ├── backend/           # Node.js + Express API  :4000
│   ├── ai-service/        # Python FastAPI         :8000
│   ├── wallet-tracker/    # Spring Boot            :8080
│   └── senator-tracker/   # Spring Boot            :8081
├── packages/
│   └── shared-types/      # TypeScript types shared between frontend + backend
├── docs/
│   ├── guides/            # Step-by-step setup guides
│   │   ├── PRISMA_SUPABASE_SETUP.md
│   │   ├── LOCAL_DEVELOPMENT.md
│   │   ├── WALLET_TRACKER.md
│   │   └── SENATOR_TRACKER.md
│   └── images/
│       └── architecture.svg
├── .env.example
├── turbo.json
└── package.json           # pnpm workspace root
```

---

## Quick Start

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | `^20.19` or `^22.12` | Backend + Frontend |
| pnpm | `^9` | Package manager |
| Python | `3.11.x` | AI service |
| Java | `21` (LTS) | Spring Boot services |
| Redis | `7` | Job queue |

> **macOS:** `brew install nvm pyenv redis` then `nvm install 20 && pyenv install 3.11.9`
> **Windows:** Use nvm-windows for Node, python.org installer for Python, WSL2 for Redis

### 1. Clone and install

```bash
git clone https://github.com/yourusername/sentimental-satoshi.git
cd sentimental-satoshi

# Install Node.js dependencies for all workspace packages
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — fill in your Supabase URLs and API keys
# See docs/guides/PRISMA_SUPABASE_SETUP.md for Supabase connection details
```

The critical variables:

```env
# Supabase pooler URL — used by the Node.js app at runtime
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"

# Supabase direct URL — used only by prisma migrate
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

> See **[docs/guides/PRISMA_SUPABASE_SETUP.md](docs/guides/PRISMA_SUPABASE_SETUP.md)** for the full connection guide including Prisma 7 vs Prisma 5 differences.

### 3. Run database migrations

```bash
cd apps/backend
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Set up the Python AI service

```bash
cd apps/ai-service
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_trf
```

> First run downloads ~700MB of model weights. Cached after that — subsequent starts take ~15s.

### 5. Start all services

```bash
# Option A: all at once
pnpm dev

# Option B: individually (better for debugging)
# Terminal 1
cd apps/backend && pnpm dev

# Terminal 2 (venv activated)
cd apps/ai-service && uvicorn main:app --port 8000 --reload

# Terminal 3
cd apps/frontend && pnpm dev

# Terminal 4
cd apps/wallet-tracker && ./mvnw spring-boot:run

# Terminal 5
cd apps/senator-tracker && ./mvnw spring-boot:run

# Redis (background service)
redis-server &
```

### 6. Open the app

| URL | What |
|---|---|
| http://localhost:3000 | Frontend dashboard |
| http://localhost:4000/health | Backend health check |
| http://localhost:8000/docs | AI service Swagger UI |
| http://localhost:8080/actuator/health | Wallet tracker health |
| http://localhost:8081/actuator/health | Senator tracker health |
| http://localhost:4000/admin/queues | BullMQ job monitor |

---

## Environment Variables

Full list — copy `.env.example` to `.env` and fill in:

```env
# ── Supabase ─────────────────────────────────────────────────────
DATABASE_URL=            # Pooler URL :6543 — app queries
DIRECT_URL=              # Direct URL :5432 — migrations only
SUPABASE_URL=            # https://[ref].supabase.co
SUPABASE_ANON_KEY=       # From Supabase → Settings → API

# ── Auth ─────────────────────────────────────────────────────────
JWT_ACCESS_SECRET=       # 64+ random characters
JWT_REFRESH_SECRET=      # 64+ random characters, DIFFERENT from above

# ── Redis (local) ────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ── Service URLs (local dev) ─────────────────────────────────────
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000
AI_SERVICE_URL=http://localhost:8000

# ── Next.js public (browser) ─────────────────────────────────────
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# ── External APIs ────────────────────────────────────────────────
TWITTER_BEARER_TOKEN=    # developer.x.com — Basic tier for prod
COINGECKO_API_KEY=       # coingecko.com/en/developers/dashboard (free)
ETHERSCAN_API_KEY=       # etherscan.io/apis (free)
HELIUS_API_KEY=          # helius.xyz (free tier: 100k credits/month)

# ── Internal (service-to-service auth) ───────────────────────────
INTERNAL_SERVICE_KEY=    # Random secret — Spring Boot → Node.js calls

# ── Spring Boot (Supabase direct connection) ─────────────────────
SUPABASE_DB_PASSWORD=    # Your Supabase database password
```

---

## Documentation

| Guide | What it covers |
|---|---|
| [Prisma + Supabase Setup](docs/guides/PRISMA_SUPABASE_SETUP.md) | Connection strings, Prisma 7 vs 5, common errors and fixes |
| [Local Development](docs/guides/LOCAL_DEVELOPMENT.md) | Installing tools, running services, daily workflow |
| [Wallet Tracker](docs/guides/WALLET_TRACKER.md) | Spring Boot setup, Etherscan/Helius API keys, adding wallets |
| [Senator Tracker](docs/guides/SENATOR_TRACKER.md) | STOCK Act data sources, disclosure parsing, crypto-adjacent tickers |
| [Build Guide (HTML)](docs/SENTIMENTAL_SATOSHI_GUIDE_V3.html) | Full 10-phase interactive build guide with checkboxes |

---

## Supabase Tables

All services share one Supabase PostgreSQL database. Each service owns its own tables:

| Table | Service | Description |
|---|---|---|
| `users` | Node.js (Prisma) | Auth — email + hashed password |
| `sessions` | Node.js (Prisma) | JWT refresh token rotation |
| `watchlists` | Node.js (Prisma) | User-saved asset lists |
| `watchlist_assets` | Node.js (Prisma) | Assets within watchlists |
| `sentiment_scores` | Node.js (Prisma) | AI analysis results over time |
| `signal_accuracy` | Node.js (Prisma) | Retrospective signal scoring |
| `analysis_jobs` | Node.js (Prisma) | BullMQ job tracking |
| `tracked_wallets` | Spring Boot (JPA) | Whale wallets being monitored |
| `wallet_transactions` | Spring Boot (JPA) | All on-chain transactions |
| `senator_trades` | Spring Boot (JPA) | STOCK Act congressional disclosures |

---

## API Reference

### Auth
| Method | Endpoint | Body | Response |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | `{ email, password }` | `{ accessToken, refreshToken }` |
| `POST` | `/api/v1/auth/login` | `{ email, password }` | `{ accessToken, refreshToken }` |
| `POST` | `/api/v1/auth/refresh` | `{ refreshToken }` | `{ accessToken, refreshToken }` |

### Analysis
| Method | Endpoint | Response |
|---|---|---|
| `POST` | `/api/v1/analyze/:symbol` | `202 { jobId }` — result pushed via WebSocket |
| `GET` | `/api/v1/analysis/:symbol/history` | Array of past sentiment scores |
| `GET` | `/api/v1/smart-money/:symbol` | Smart Money Score + component breakdown |
| `GET` | `/api/v1/smart-money/feed/recent` | Combined whale + senator signals |

### Prices
| Method | Endpoint | Query |
|---|---|---|
| `GET` | `/api/v1/prices/:coinId/ohlcv` | `?days=90` |
| `GET` | `/api/v1/prices/markets` | `?symbols=BTC,ETH` |

### WebSocket events (Socket.io)
| Event | Direction | Payload |
|---|---|---|
| `analysis:complete` | Server → Client | Full conviction result |
| `analysis:fallback` | Server → Client | Technical-only score (AI unavailable) |
| `price:tick` | Server → Client | Live Binance price tick |
| `wallet:whale_alert` | Server → Client | Whale movement detected |
| `senator:trade` | Server → Client | Congressional trade filed |
| `subscribe:prices` | Client → Server | `string[]` of symbols to watch |

### AI Service (internal, port 8000)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/ai/sentiment/batch` | Batch sentiment analysis |
| `POST` | `/ai/ner/extract` | Coin symbol extraction |
| `POST` | `/ai/analysis/conviction` | Full conviction pipeline |
| `GET` | `/docs` | Swagger UI |

### Wallet Tracker (port 8080)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/wallets` | List tracked wallets |
| `POST` | `/api/wallets` | Add wallet `{ address, chain, label }` |
| `DELETE` | `/api/wallets/:id` | Deactivate wallet |
| `GET` | `/actuator/health` | Spring Boot health |

---

## Common Issues

### Supabase connection problems
→ See **[docs/guides/PRISMA_SUPABASE_SETUP.md](docs/guides/PRISMA_SUPABASE_SETUP.md)** — covers every error pattern.

### "Supabase project is paused"
Free tier projects pause after 7 days of inactivity. Go to your Supabase dashboard and click **Restore project**. Upgrade to Pro ($25/month) to disable auto-pausing.

### Prisma 7 errors
Prisma 7 requires `@prisma/adapter-pg` and changed the `PrismaClient` initialization. See the setup guide for the working Prisma 7 singleton pattern, or pin to Prisma 5 to avoid the migration complexity.

### AI service slow to start
The first start downloads CryptoBERT (~700MB) and the spaCy transformer model (~500MB). This is a one-time download. Subsequent starts use the HuggingFace cache (~/.cache/huggingface) and take about 15–20 seconds.

### Spring Boot "Too many connections" on Supabase free tier
Spring Boot uses HikariCP with a direct connection (port 5432). Supabase free tier allows 25 direct connections. Set `spring.datasource.hikari.maximum-pool-size=3` in `application.properties` — 3 connections per Spring Boot service is enough for polling workloads.

---

## Production Deployment

| Service | Notes |
|---|---|
| Frontend | Auto-deploys on push to main |
| Backend | Node.js + Redis add-on |
| AI Service | Docker container, 2GB RAM minimum |
| Wallet Tracker| Spring Boot JAR |
| Senator Tracker| Spring Boot JAR |
| Database| Already cloud-hosted — same project |

See Phase 7 of the build guide for full CI/CD pipeline and production Dockerfiles.

---

## Contributing

This is a learning project. If you find bugs or have improvements, open an issue or PR.

---

## License

MIT — do whatever you want with it.
