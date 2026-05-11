-- Migration: Impersonation detection and access delegation tables
-- Run via Supabase dashboard SQL editor or psql

-- ============================================================
-- IMPERSONATION TABLES
-- ============================================================

create table if not exists impersonation_handles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  platform text not null,
  handle text not null,
  created_at timestamptz default now()
);

create index if not exists idx_impersonation_handles_user on impersonation_handles(user_id);

alter table impersonation_handles enable row level security;
create policy "Users manage own handles" on impersonation_handles
  for all using (auth.uid() = user_id);

-- ----

create table if not exists impersonation_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  platform text not null,
  fake_handle text not null,
  fake_profile_url text,
  match_type text not null,  -- handle_match | image_match | bio_match | brand_match
  risk_level text not null,  -- low | medium | high | confirmed
  ai_analysis text,
  status text default 'active',  -- active | monitoring | reported | dismissed | removed
  detected_at timestamptz default now(),
  resolved_at timestamptz,
  follower_count integer,
  screenshot_url text
);

create index if not exists idx_impersonation_alerts_user on impersonation_alerts(user_id);
create index if not exists idx_impersonation_alerts_status on impersonation_alerts(status);

alter table impersonation_alerts enable row level security;
create policy "Users manage own alerts" on impersonation_alerts
  for all using (auth.uid() = user_id);

-- ----

create table if not exists impersonation_timeline (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid references impersonation_alerts(id) on delete cascade,
  event text not null,
  event_at timestamptz default now()
);

alter table impersonation_timeline enable row level security;
create policy "Users view own timeline" on impersonation_timeline
  for select using (
    exists (
      select 1 from impersonation_alerts
      where impersonation_alerts.id = impersonation_timeline.alert_id
        and impersonation_alerts.user_id = auth.uid()
    )
  );
create policy "Service inserts timeline" on impersonation_timeline
  for insert with check (true);

-- ============================================================
-- ACCESS DELEGATION TABLES
-- ============================================================

create table if not exists access_delegations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  delegate_name text not null,
  delegate_email text not null,
  platforms text[] not null default '{}',
  vault_item_ids text[] not null default '{}',
  expires_at timestamptz not null,
  created_at timestamptz default now(),
  revoked_at timestamptz,
  status text default 'active',  -- active | expired | revoked
  access_token text unique not null,
  password_changed_after boolean default false,
  password_change_reminder_sent boolean default false
);

create index if not exists idx_access_delegations_owner on access_delegations(owner_id);
create index if not exists idx_access_delegations_token on access_delegations(access_token);
create index if not exists idx_access_delegations_status on access_delegations(status);

alter table access_delegations enable row level security;
create policy "Owners manage own delegations" on access_delegations
  for all using (auth.uid() = owner_id);

-- ----

create table if not exists delegation_activity_log (
  id uuid primary key default gen_random_uuid(),
  delegation_id uuid references access_delegations(id) on delete cascade,
  action text not null,  -- link_opened | password_revealed | session_expired | revoked
  platform text,
  detail text,
  performed_at timestamptz default now(),
  ip_address text
);

create index if not exists idx_delegation_activity_delegation on delegation_activity_log(delegation_id);

alter table delegation_activity_log enable row level security;
create policy "Owners view own logs" on delegation_activity_log
  for select using (
    exists (
      select 1 from access_delegations
      where access_delegations.id = delegation_activity_log.delegation_id
        and access_delegations.owner_id = auth.uid()
    )
  );
create policy "Service inserts logs" on delegation_activity_log
  for insert with check (true);

-- ============================================================
-- Profile flag for impersonation onboarding
-- ============================================================
alter table users add column if not exists has_completed_impersonation_onboarding boolean default false;
