# AEFORYN — Creator Cybersecurity Platform

**Your account. Your income. Protected.**

AEFORYN is a premium cybersecurity SaaS platform built for content creators, freelancers, and remote workers who rely on their social media accounts for income.

Operated by **Co-Plot (Pty) Ltd** | Trading name: **AEFORYN**

---

## What AEFORYN does

| Feature | Description |
|---------|-------------|
| **Threat Monitoring** | Real-time detection of suspicious logins, phishing attempts, and account anomalies across Instagram, TikTok, YouTube, X, LinkedIn, and Email |
| **Content Vault** | AES-256 encrypted file storage on Cloudflare R2 for contracts, videos, credentials, and backup codes |
| **Phishing Scanner** | Claude AI-powered analysis of suspicious DMs, emails, and brand deal offers |
| **Recovery Playbooks** | Step-by-step guided account recovery for 6 platforms × 5 incident types |
| **AI Assistant** | Streaming security assistant that speaks creator language, not corporate jargon |
| **Breach Alerts** | Automated alerts when your email or credentials appear in known data breaches |

---

## Tech stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS (custom AEFORYN design tokens)
- Framer Motion (animations)
- Zustand (state management)
- TanStack Query (server state)
- React Router v6
- Lucide React (icons)
- Recharts (charts)

### Backend
- Node.js + Express (TypeScript)
- Supabase (PostgreSQL + Auth + Row Level Security)
- Cloudflare R2 (encrypted file storage)
- Stripe (subscription payments)
- Anthropic Claude API (claude-sonnet-4-20250514)
- Resend (transactional email)

### Infrastructure
- Frontend: Cloudflare Pages
- Backend: Railway
- Database: Supabase (managed PostgreSQL)
- Storage: Cloudflare R2

---

## Pricing

| Plan | Price | Storage | Platforms | Scans/month |
|------|-------|---------|-----------|-------------|
| Free | $0 | 2GB | 1 | 5 |
| Standard | $29/month | 10GB | 5 | 50 |
| Pro | $49/month | 50GB | Unlimited | Unlimited |
| Enterprise | Custom | 200GB+ | Unlimited | Unlimited |

Annual plans save 17%.

---

## Project structure

```
aeforyn-app/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route-level page components
│   │   ├── store/       # Zustand state stores
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities, API client, Supabase client
│   │   └── types/       # TypeScript type definitions
│   └── ...
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── routes/      # API route handlers
│   │   ├── middleware/  # Auth, rate limiting
│   │   ├── services/    # Business logic
│   │   ├── config/      # Plan limits, recovery playbooks
│   │   └── db/          # Supabase client, schema, seed data
│   └── ...
└── docs/              # Documentation
    ├── README.md
    ├── SETUP.md
    └── API.md
```

---

## Quick start

See [SETUP.md](./SETUP.md) for full setup instructions.

```bash
# Clone
git clone https://github.com/aeforyn-hq/aeforyn-app.git
cd aeforyn-app

# Frontend
cd frontend && npm install && npm run dev

# Backend (separate terminal)
cd backend && npm install && npm run dev
```

---

## Compliance

- **POPIA** (Protection of Personal Information Act, South Africa)
- **GDPR** (General Data Protection Regulation, EU)
- Data export: `GET /api/user/export`
- Account deletion: `DELETE /api/user`
- Privacy policy: `/privacy`
- Terms of service: `/terms`

---

## Team

| Name | Role |
|------|------|
| Mel | Operations & Product |
| Acaylia | Technical Lead |
