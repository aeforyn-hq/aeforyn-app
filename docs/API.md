# AEFORYN API Documentation

Base URL: `http://localhost:3001` (dev) | `https://api.aeforyn.com` (prod)

All protected endpoints require: `Authorization: Bearer <supabase_jwt_token>`

---

## Authentication — `/api/auth`

### POST /api/auth/signup
Create a new user account.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "creator_handle": "@myhandle",
  "platforms": ["instagram", "tiktok", "youtube"]
}
```

**Response:**
```json
{
  "message": "Account created. Check your email to verify.",
  "user_id": "uuid"
}
```

---

### POST /api/auth/login
Authenticate and receive a JWT token.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "eyJ...",
  "refresh_token": "eyJ...",
  "user": { "id": "uuid", "email": "...", "plan_tier": "pro", ... }
}
```

---

### POST /api/auth/forgot-password
Send password reset email.

**Body:** `{ "email": "user@example.com" }`

**Response:** `{ "message": "Password reset email sent" }`

---

### GET /api/auth/me 🔒
Get current user profile including subscription.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "creator_handle": "@handle",
  "plan_tier": "pro",
  "storage_used_bytes": 1073741824,
  "subscriptions": [{ ... }]
}
```

---

## Monitoring — `/api/monitoring`

### GET /api/monitoring/platforms 🔒
List all connected platforms.

**Response:** Array of platform objects with health scores.

---

### POST /api/monitoring/platforms 🔒
Connect a new platform.

**Body:** `{ "platform": "instagram", "handle": "@handle" }`

**Response:** Platform object

---

### DELETE /api/monitoring/platforms/:id 🔒
Disconnect a platform.

---

### GET /api/monitoring/dashboard 🔒
Get aggregated dashboard data.

**Response:**
```json
{
  "security_score": 78,
  "threats_summary": { "critical": 2, "high": 1, "medium": 2, "low": 0, "total": 7, "resolved": 2 },
  "platforms": [...],
  "recent_threats": [...],
  "recent_files": [...],
  "storage_used": 1073741824,
  "storage_total": 53687091200
}
```

---

## Vault — `/api/vault`

### GET /api/vault/files 🔒
List vault files. Optional query param: `?category=video|image|document|credential|other`

---

### POST /api/vault/upload 🔒
Upload a file (multipart/form-data).

**Form fields:**
- `file` — the file to upload (max 5GB)
- `category` — `video | image | document | credential | other | general`

**Plan limits enforced:** Storage quota checked before upload.

**Response:** VaultFile object

---

### GET /api/vault/download/:fileId 🔒
Get a 15-minute presigned download URL.

**Response:** `{ "url": "https://...", "file_name": "original-name.pdf" }`

---

### DELETE /api/vault/files/:fileId 🔒
Delete a file from vault and R2.

---

## Threats — `/api/threats`

### GET /api/threats 🔒
List threats. Query params: `?severity=critical|high|medium|low&resolved=true|false&limit=50&offset=0`

---

### POST /api/threats 🔒
Create a threat record.

**Body:**
```json
{
  "threat_type": "login_attempt",
  "platform": "instagram",
  "severity": "critical",
  "title": "Login from unknown location",
  "description": "...",
  "location": "Lagos, Nigeria"
}
```

---

### PATCH /api/threats/:id/resolve 🔒
Mark a threat as resolved.

---

### GET /api/threats/summary 🔒
Get threat counts by severity.

**Response:**
```json
{ "critical": 2, "high": 1, "medium": 3, "low": 1, "total": 9, "resolved": 4 }
```

---

## Scanner — `/api/scanner`

### POST /api/scanner/scan 🔒
Analyse text for phishing/scam indicators using Claude AI.

**Plan limits:** Monthly scan quota enforced per plan tier.

**Body:** `{ "text": "suspicious message content..." }`

**Response:**
```json
{
  "id": "uuid",
  "risk_level": "high",
  "confidence_score": 94,
  "red_flags": ["Requests login credentials", "Artificial urgency"],
  "explanation": "This is a phishing attempt targeting creators...",
  "recommendation": "Do not respond. Block and report the sender.",
  "scanned_at": "2024-11-15T10:23:00Z"
}
```

---

### GET /api/scanner/history 🔒
Get last 10 scan results.

---

## Recovery — `/api/recovery`

### GET /api/recovery/playbooks 🔒
List all available recovery playbook summaries.

**Response:** Array of `{ platform, incident_type, title, description, total_steps }`

---

### GET /api/recovery/playbooks/:platform/:incident 🔒 (Pro+)
Get a full recovery playbook with all steps.

**Platforms:** `instagram | tiktok | youtube | x | linkedin | email`
**Incidents:** `account_hacked | cant_login | posts_deleted | account_suspended | impersonation`

---

### POST /api/recovery/sessions 🔒 (Pro+)
Start a new recovery session.

**Body:** `{ "platform": "instagram", "incident_type": "account_hacked" }`

**Response:** `{ "session": {...}, "playbook": {...} }`

---

### PATCH /api/recovery/sessions/:id/step 🔒
Update steps completed count.

**Body:** `{ "steps_completed": 3 }`

---

### POST /api/recovery/sessions/:id/complete 🔒
Complete a session and generate incident report.

**Response:** `{ "session": {...}, "incident_report": {...} }`

---

### GET /api/recovery/sessions 🔒
List all recovery sessions for the current user.

---

## AI Assistant — `/api/ai`

### POST /api/ai/chat 🔒 (Standard+)
Send a message and receive a streaming response.

**Body:**
```json
{
  "message": "Someone logged in from another country, what do I do?",
  "conversation_id": "uuid-or-null"
}
```

**Response:** Server-Sent Events (SSE) stream

```
data: {"text": "That's urgent"}
data: {"text": " — act immediately."}
data: {"done": true, "conversation_id": "uuid"}
```

---

### GET /api/ai/conversations 🔒
List recent AI conversations (last 10).

---

## Billing — `/api/billing`

### POST /api/billing/create-checkout 🔒
Create a Stripe Checkout session.

**Body:** `{ "plan": "pro", "billing_period": "monthly" }`

**Response:** `{ "url": "https://checkout.stripe.com/..." }`

---

### POST /api/billing/webhook
Stripe webhook handler. Must receive raw body (not JSON-parsed).

**Events handled:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

---

### GET /api/billing/portal 🔒
Get Stripe Customer Portal URL.

**Response:** `{ "url": "https://billing.stripe.com/..." }`

---

### GET /api/billing/subscription 🔒
Get current active subscription.

---

## User — `/api/user`

### GET /api/user/export 🔒
Export all user data as JSON (GDPR/POPIA compliance).

**Response:** JSON file download containing all user data across all tables.

---

### DELETE /api/user 🔒
Permanently delete account and all associated data including R2 files.

**Response:** `{ "message": "Account and all data permanently deleted" }`

> ⚠️ This action is irreversible.

---

### PATCH /api/user/profile 🔒
Update user profile.

**Body:** `{ "creator_handle": "@newhandle" }`

---

## Error responses

All errors follow this format:

```json
{
  "error": "Description of what went wrong"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request / validation error |
| 401 | Unauthorised — missing or invalid token |
| 403 | Forbidden — plan does not include this feature |
| 404 | Resource not found |
| 500 | Internal server error |

---

## Rate limiting

All API endpoints are rate-limited to **100 requests per 15 minutes** per IP address.

---

## Plan-gated endpoints

| Endpoint | Required Plan |
|----------|--------------|
| `POST /api/ai/chat` | Standard, Pro, Enterprise |
| `GET /api/recovery/playbooks/:platform/:incident` | Pro, Enterprise |
| `POST /api/recovery/sessions` | Pro, Enterprise |
| Monthly scan limits | Enforced per plan (5 free / 50 standard / 999 pro) |
| Storage upload | Enforced per plan (2GB / 10GB / 50GB / 200GB) |
