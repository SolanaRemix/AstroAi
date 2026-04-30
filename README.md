# AstroLife ✨

> **Where the Stars Meet Your Story** — A production-ready mystical insights web app.

Live at: **[astrolife.vercel.app](https://astrolife.vercel.app)**

---

## Overview

AstroLife is a full-stack Next.js 16 web application that provides:

- **Numerology** — Life path, destiny, soul urge, and personality numbers from birth date + name
- **Palm Reading** — Symbolic left-hand analysis (photo upload) with line interpretation
- **Oracle Insights** — Past-life themes, karma guidance, and goal-path clarity
- **Subscription plans** via Stripe (monthly/yearly)
- **User dashboard** with full personalized profile
- **Admin dashboard** for managing users, plans, content, and oracle rules

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| UI | React + Tailwind CSS |
| Auth | NextAuth v4 (Google OAuth) |
| Database | PostgreSQL + Prisma ORM |
| Payments | Stripe (subscriptions + webhooks) |
| Hosting | Vercel |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/SolanaRemix/AstroAi.git
cd AstroAi
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local` (see `.env.example` for descriptions).

### 3. Set up database

```bash
npx prisma migrate deploy
npx prisma db seed
```

### 4. Run locally

```bash
npm run dev
```

---

## Stripe Setup

1. Create products with recurring prices in Stripe Dashboard
2. Copy Price IDs to `STRIPE_PRICE_MONTHLY` and `STRIPE_PRICE_YEARLY`
3. Set up webhook at `https://yourdomain.com/api/stripe/webhook`
4. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

Local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

---

## Vercel Deployment

```bash
npm i -g vercel
vercel link
vercel env pull
vercel deploy --prod
```

Or run `.\pipeline.ps1` on Windows.

---

## Palm ML Integration

Current implementation uses a deterministic mock. To use a real model, update `lib/palm.ts` — see the TODO comment for the integration point.

Set `PALM_ML_ENDPOINT` in environment variables.

---

## Oracle Engine Notes

- All insights are symbolic and reflective — not predictions or medical advice
- Non-fatalistic, empowering, and agency-focused framing
- Manage oracle rules via the admin dashboard at `/admin`

---

## License

MIT
