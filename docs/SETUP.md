# AEFORYN — Setup Guide

Complete setup guide for running AEFORYN locally and deploying to production.

---

## Prerequisites

- Node.js 20+
- npm 10+
- Git
- A Supabase account (free tier works)
- A Cloudflare account (for R2)
- A Stripe account (for payments)
- An Anthropic API key
- A Resend account (for email)

---

## 1. Clone the repository

```bash
git clone https://github.com/aeforyn-hq/aeforyn-app.git
cd aeforyn-app
```

---

## 2. Supabase setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL` / `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`
3. Go to **SQL Editor** and run `backend/src/db/schema.sql`
4. (Optional) Run `backend/src/db/seed.sql` to populate demo data

> ⚠️ Never expose your `service_role` key in the frontend. It must only be used server-side.

---

## 3. Cloudflare R2 setup

1. Log in to [Cloudflare dashboard](https://dash.cloudflare.com)
2. Go to **R2 Object Storage → Create bucket**
   - Dev bucket: `aeforyn-vault-dev`
   - Prod bucket: `aeforyn-vault-prod`
3. Go to **R2 → Manage R2 API Tokens → Create API Token**
   - Permissions: Object Read & Write
   - Copy the **Access Key ID** and **Secret Access Key**
4. Note your **Account ID** from the R2 dashboard URL

---

## 4. Stripe setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Go to **Developers → API Keys** and copy your **Secret Key**
3. Create products and prices in Stripe dashboard:

```
Standard Monthly: $29.00/month → note the price ID
Standard Annual:  $24.00/month billed annually → note the price ID
Pro Monthly:      $49.00/month → note the price ID
Pro Annual:       $41.00/month billed annually → note the price ID
```

4. Set up webhook endpoint:
   - Endpoint URL: `https://your-api.railway.app/api/billing/webhook`
   - Events to listen to:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy the **Webhook Secret**

---

## 5. Backend setup

```bash
cd backend
cp .env.example .env
```

Fill in your `.env`:

```env
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=aeforyn-vault-dev
R2_PUBLIC_URL=https://pub-xxxx.r2.dev
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_STANDARD_MONTHLY=price_xxx
STRIPE_PRICE_STANDARD_ANNUAL=price_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_ANNUAL=price_xxx
ANTHROPIC_API_KEY=sk-ant-xxx
RESEND_API_KEY=re_xxx
FRONTEND_URL=http://localhost:5173
```

```bash
npm install
npm run dev
```

The API will start at `http://localhost:3001`.

---

## 6. Frontend setup

```bash
cd frontend
cp .env.example .env
```

Fill in your `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

```bash
npm install
npm run dev
```

The frontend will start at `http://localhost:5173`.

---

## 7. Demo account

After running `seed.sql`, you can sign in with:

- **Email:** `demo@aeforyn.com`
- **Password:** `password123`

> Note: You must create this auth user in Supabase Auth first (Authentication → Users → Add User), then run seed.sql.

---

## 8. Production deployment

### Frontend → Cloudflare Pages

1. Connect your GitHub repo to Cloudflare Pages
2. Build command: `npm run build`
3. Build output: `dist`
4. Root directory: `frontend`
5. Add environment variables in Cloudflare Pages settings

### Backend → Railway

1. Connect your GitHub repo to [railway.app](https://railway.app)
2. Root directory: `backend`
3. Start command: `npm run start`
4. Add all environment variables in Railway settings
5. Set `FRONTEND_URL` to your Cloudflare Pages URL

### Production Stripe webhook

Update your Stripe webhook endpoint URL to your Railway deployment URL once deployed.

---

## 9. Database migrations

When updating the schema, create incremental migration files rather than re-running `schema.sql` (which would drop existing data).

Example migration file: `backend/src/db/migrations/002_add_column.sql`

---

## 10. TypeScript compilation

```bash
# Frontend type check
cd frontend && npx tsc --noEmit

# Backend build
cd backend && npm run build
```

---

## Troubleshooting

**"Invalid token" on API calls**
- Ensure `VITE_API_URL` points to the correct backend URL
- Check that the JWT from Supabase is being sent in the `Authorization: Bearer` header

**R2 upload fails**
- Verify your R2 Access Key has Object Read & Write permissions
- Confirm the bucket name matches `R2_BUCKET_NAME`

**Stripe checkout not working**
- Ensure you're using test mode API keys in development
- Check that price IDs in `.env` match your Stripe dashboard

**Claude API errors**
- Verify your `ANTHROPIC_API_KEY` is valid
- The scanner uses `claude-sonnet-4-20250514` — ensure your API key has access
