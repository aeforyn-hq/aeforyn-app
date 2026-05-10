-- AEFORYN Demo Seed Data
-- Run this AFTER schema.sql in your Supabase SQL editor
-- Creates a demo user with realistic data across all features

-- NOTE: The demo user auth record must be created via Supabase Auth first.
-- Run this in the SQL editor after creating the auth user:
-- Email: demo@aeforyn.com  |  Password: password123

DO $$
DECLARE
  demo_user_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN

-- ─────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────
INSERT INTO public.users (id, email, creator_handle, platforms_connected, plan_tier, storage_used_bytes, created_at)
VALUES (
  demo_user_id,
  'demo@aeforyn.com',
  '@creatorhandle',
  ARRAY['instagram','tiktok','youtube','x','linkedin'],
  'pro',
  13421772800, -- ~12.5 GB used
  NOW() - INTERVAL '90 days'
) ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────
-- SUBSCRIPTIONS
-- ─────────────────────────────────────────
INSERT INTO public.subscriptions (user_id, stripe_subscription_id, plan_tier, status, current_period_start, current_period_end)
VALUES (
  demo_user_id,
  'sub_demo_pro_0001',
  'pro',
  'active',
  NOW() - INTERVAL '15 days',
  NOW() + INTERVAL '15 days'
) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────
-- PLATFORMS CONNECTED
-- ─────────────────────────────────────────
INSERT INTO public.platforms_connected (user_id, platform, handle, health_score, status, last_checked_at, connected_at)
VALUES
  (demo_user_id, 'instagram', '@creatorhandle',  85, 'safe',      NOW() - INTERVAL '5 minutes',  NOW() - INTERVAL '60 days'),
  (demo_user_id, 'tiktok',    '@creatorhandle',  72, 'warning',   NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '45 days'),
  (demo_user_id, 'youtube',   'Creator Channel', 91, 'safe',      NOW() - INTERVAL '3 minutes',  NOW() - INTERVAL '80 days'),
  (demo_user_id, 'x',         '@creatorhandle',  55, 'warning',   NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '30 days'),
  (demo_user_id, 'linkedin',  'Creator Name',    67, 'monitoring', NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────
-- THREATS LOG (8 threats: 2 critical, 2 high, 2 medium, 2 resolved)
-- ─────────────────────────────────────────
INSERT INTO public.threats_log (user_id, threat_type, platform, severity, title, description, location, is_resolved, detected_at)
VALUES
  -- Critical (unresolved)
  (demo_user_id, 'login_attempt',    'instagram', 'critical',
   'Login attempt from Lagos, Nigeria',
   'An unrecognised device attempted to log in to your Instagram account. The attempt was blocked by two-factor authentication.',
   'Lagos, Nigeria', FALSE, NOW() - INTERVAL '15 minutes'),

  (demo_user_id, 'phishing',         'email',     'critical',
   'Phishing email impersonating YouTube',
   'Email from "noreply@youtube-creator-support.net" claiming your channel is at risk of deletion. This is a phishing attempt designed to steal your Google login.',
   'Email', FALSE, NOW() - INTERVAL '45 minutes'),

  -- High (unresolved)
  (demo_user_id, 'phishing',         'email',     'high',
   'Brand deal phishing email detected',
   'Email from "partnerships@brands-hub.co" offering a $5,000 brand deal. Requests PayPal email and Instagram login — confirmed phishing targeting creators.',
   'Email', FALSE, NOW() - INTERVAL '2 hours'),

  (demo_user_id, 'account_takeover', 'x',         'high',
   'Unrecognised login on X (Twitter)',
   'Your X account was accessed from a new device in São Paulo, Brazil. If this wasn''t you, secure your account immediately.',
   'São Paulo, Brazil', FALSE, NOW() - INTERVAL '5 hours'),

  -- Medium (unresolved)
  (demo_user_id, 'suspicious_access','tiktok',    'medium',
   'Unusual login time on TikTok',
   'TikTok login at 3:47 AM from your usual device in Cape Town. Unusual timing flagged by our monitoring system.',
   'Cape Town, ZA', FALSE, NOW() - INTERVAL '8 hours'),

  (demo_user_id, 'data_breach',      'email',     'medium',
   'Email found in data breach',
   'Your email address appeared in the "DataCo Breach 2024" leak. Change any passwords shared with that service immediately.',
   'Breach Database', FALSE, NOW() - INTERVAL '1 day'),

  -- Resolved
  (demo_user_id, 'phishing',         'instagram', 'high',
   'Fake collaboration DM',
   'Instagram DM from @brands_deals_official offering a paid partnership. Account created 3 days ago — confirmed scam account.',
   'Instagram DM', TRUE, NOW() - INTERVAL '2 days'),

  (demo_user_id, 'login_attempt',    'youtube',   'low',
   'Failed login to YouTube',
   'A single failed login attempt on your YouTube channel. No action needed unless attempts continue.',
   'Unknown', TRUE, NOW() - INTERVAL '3 days')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────
-- VAULT FILES (12 files: mix of categories)
-- ─────────────────────────────────────────
INSERT INTO public.vault_files (user_id, file_name, file_type, file_size_bytes, r2_key, category, is_encrypted, uploaded_at)
VALUES
  (demo_user_id, 'Q4_Brand_Deal_Contract.pdf',       'application/pdf',  2400000,    'demo/f001.pdf',  'document',   TRUE, NOW() - INTERVAL '2 hours'),
  (demo_user_id, 'YouTube_Analytics_Nov2024.mp4',    'video/mp4',        450000000,  'demo/f002.mp4',  'video',      TRUE, NOW() - INTERVAL '1 day'),
  (demo_user_id, 'Backup_Codes_Instagram.pdf',       'application/pdf',  180000,     'demo/f003.pdf',  'credential', TRUE, NOW() - INTERVAL '2 days'),
  (demo_user_id, 'TikTok_Campaign_Dec_Raw.mp4',      'video/mp4',        280000000,  'demo/f004.mp4',  'video',      TRUE, NOW() - INTERVAL '3 days'),
  (demo_user_id, 'Profile_Photo_HD_2024.jpg',        'image/jpeg',       4500000,    'demo/f005.jpg',  'image',      TRUE, NOW() - INTERVAL '4 days'),
  (demo_user_id, 'Sponsor_Agreement_NovDec.pdf',     'application/pdf',  1800000,    'demo/f006.pdf',  'document',   TRUE, NOW() - INTERVAL '5 days'),
  (demo_user_id, 'YouTube_Backup_Codes.txt',         'text/plain',       2048,       'demo/f007.txt',  'credential', TRUE, NOW() - INTERVAL '6 days'),
  (demo_user_id, 'Instagram_Story_Assets.zip',       'application/zip',  85000000,   'demo/f008.zip',  'image',      TRUE, NOW() - INTERVAL '7 days'),
  (demo_user_id, 'Merch_Partnership_Contract.pdf',   'application/pdf',  3200000,    'demo/f009.pdf',  'document',   TRUE, NOW() - INTERVAL '8 days'),
  (demo_user_id, 'TikTok_Backup_Codes_2024.pdf',    'application/pdf',  156000,     'demo/f010.pdf',  'credential', TRUE, NOW() - INTERVAL '9 days'),
  (demo_user_id, 'Brand_Kit_Logo_Files.zip',         'application/zip',  24000000,   'demo/f011.zip',  'image',      TRUE, NOW() - INTERVAL '10 days'),
  (demo_user_id, 'Creator_Contract_Template.pdf',    'application/pdf',  950000,     'demo/f012.pdf',  'document',   TRUE, NOW() - INTERVAL '14 days')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────
-- SCAN RESULTS (3 scans: 1 high, 1 medium, 1 low)
-- ─────────────────────────────────────────
INSERT INTO public.scan_results (user_id, input_text, risk_level, confidence_score, red_flags, explanation, recommendation, scanned_at)
VALUES
  (demo_user_id,
   'Hi! I''m Sarah from BrandCollab Media. We love your content and want to offer you a $3,500 paid partnership. We need your PayPal email and Instagram login to send the advance payment immediately. Reply ASAP — offer expires today!',
   'high', 96,
   ARRAY['Requests account credentials', 'Requests payment details upfront', 'Artificial urgency tactic', 'Unsolicited outreach with high payment claim'],
   'This is a phishing message targeting creators. Legitimate brands never ask for your Instagram login or PayPal email in an initial outreach. The urgency tactic is a classic manipulation technique.',
   'Do not respond or share any information. Block and report the sender immediately.',
   NOW() - INTERVAL '2 hours'),

  (demo_user_id,
   'Hey! I represent a mid-size clothing brand and we''ve been following your content. We''d love to do a collaboration — could you send us your media kit and rate card? Our budget is around $500-$1000 for a dedicated post.',
   'medium', 58,
   ARRAY['Unverified sender identity', 'Vague brand description'],
   'This message shows some legitimate markers (reasonable rate, standard ask for media kit) but the sender''s identity is unverified. It could be a legitimate enquiry or a prelude to a scam.',
   'Ask for their company website and LinkedIn profile before sharing any personal information or your media kit.',
   NOW() - INTERVAL '1 day'),

  (demo_user_id,
   'Hi! I work at Nike''s creator partnerships team. We''d love to collaborate on our upcoming campaign. Our official email is partnerships@nike.com — feel free to verify us on LinkedIn or the Nike website. No payment upfront, we''ll discuss terms via official channels.',
   'low', 93,
   ARRAY[]::TEXT[],
   'This message shows all the markers of a legitimate brand outreach. The email domain is verifiable, no sensitive information is requested upfront, and the sender encourages you to verify their identity independently.',
   'Proceed with normal due diligence — verify the contact on LinkedIn and the official Nike website before engaging further.',
   NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────
-- RECOVERY SESSIONS (2 completed)
-- ─────────────────────────────────────────
INSERT INTO public.recovery_sessions (user_id, platform, incident_type, steps_completed, total_steps, status, incident_report, started_at, completed_at)
VALUES
  (demo_user_id, 'instagram', 'account_hacked', 6, 6, 'completed',
   '{"platform":"instagram","incident_type":"account_hacked","steps_completed":6,"total_steps":6,"time_taken_minutes":34,"completed_at":"' || (NOW() - INTERVAL '7 days')::TEXT || '"}'::jsonb,
   NOW() - INTERVAL '7 days' - INTERVAL '34 minutes',
   NOW() - INTERVAL '7 days'),

  (demo_user_id, 'email', 'account_hacked', 5, 5, 'completed',
   '{"platform":"email","incident_type":"account_hacked","steps_completed":5,"total_steps":5,"time_taken_minutes":52,"completed_at":"' || (NOW() - INTERVAL '14 days')::TEXT || '"}'::jsonb,
   NOW() - INTERVAL '14 days' - INTERVAL '52 minutes',
   NOW() - INTERVAL '14 days')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────
-- AI CONVERSATIONS (1 demo conversation)
-- ─────────────────────────────────────────
INSERT INTO public.ai_conversations (user_id, messages, created_at, updated_at)
VALUES (
  demo_user_id,
  '[
    {"role":"user","content":"Someone just logged into my Instagram from Lagos, Nigeria and I don''t know anyone there. What should I do?","timestamp":"' || (NOW() - INTERVAL '15 minutes' - INTERVAL '5 minutes')::TEXT || '"},
    {"role":"assistant","content":"That''s urgent — act right now before they lock you out.\n\n**Immediate steps:**\n\n1. Change your Instagram password immediately from a trusted device (not your phone if you think it''s compromised)\n2. Go to Settings → Security → Login Activity and log out every session you don''t recognise\n3. Check if your recovery email and phone number are still yours — if they changed them, you need to use instagram.com/hacked right now\n\n**While you''re doing that:**\n- Also change the password on the email linked to your Instagram account\n- Enable 2FA using an authenticator app (not SMS) if you haven''t already\n\nDo you still have access to your account right now? That''s the most important thing to confirm first.","timestamp":"' || (NOW() - INTERVAL '15 minutes' - INTERVAL '4 minutes')::TEXT || '"},
    {"role":"user","content":"Yes I still have access. I can see the login in Login Activity. What should I click?","timestamp":"' || (NOW() - INTERVAL '15 minutes' - INTERVAL '3 minutes')::TEXT || '"},
    {"role":"assistant","content":"Good — you''re in time. Here''s exactly what to do:\n\n**In Login Activity:**\n1. Find the Lagos, Nigeria entry\n2. Tap on it\n3. Tap \"Log Out\" on that specific session\n4. Then tap the three dots at the top and select \"Log Out of All Sessions\" just to be safe\n\n**Right after that:**\n1. Go to Settings → Security → Password and change it to something completely new — at least 16 characters, never used anywhere else\n2. Then go to Settings → Security → Two-Factor Authentication and switch to an authenticator app if you''re currently using SMS\n\n**Urgent check:** Go to Settings → Security → Apps and Websites → Active. Look for any apps you didn''t authorise in the last week and remove them.\n\nYou''re doing the right thing acting fast. Once you''ve done these steps, you can use the AEFORYN Recovery section for a full guided walkthrough.","timestamp":"' || (NOW() - INTERVAL '15 minutes')::TEXT || '"}
  ]'::jsonb,
  NOW() - INTERVAL '15 minutes' - INTERVAL '5 minutes',
  NOW() - INTERVAL '15 minutes'
) ON CONFLICT DO NOTHING;

END $$;
