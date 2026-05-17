import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { LifeBuoy, CheckCircle, ChevronRight, Bot, Lock, ArrowLeft, Clock, Copy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { PlatformIcon } from '@/components/ui/PlatformIcon'
import { api } from '@/lib/api'
import { toast } from '@/store/toastStore'
import { useAuthStore } from '@/store/authStore'
import { PLATFORM_LABELS } from '@/lib/utils'
import type { RecoverySession } from '@/types'

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'email', label: 'Email / Gmail' },
  { id: 'x', label: 'X (Twitter)' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'snapchat', label: 'Snapchat' },
  { id: 'pinterest', label: 'Pinterest' },
  { id: 'twitch', label: 'Twitch' },
  { id: 'discord', label: 'Discord' },
  { id: 'reddit', label: 'Reddit' },
  { id: 'telegram', label: 'Telegram' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'spotify', label: 'Spotify' },
  { id: 'patreon', label: 'Patreon' },
  { id: 'onlyfans', label: 'OnlyFans' },
  { id: 'substack', label: 'Substack' },
  { id: 'medium', label: 'Medium' },
  { id: 'github', label: 'GitHub' },
  { id: 'shopify', label: 'Shopify' },
  { id: 'etsy', label: 'Etsy' },
  { id: 'gumroad', label: 'Gumroad' },
  { id: 'threads', label: 'Threads' },
]

const INCIDENT_TYPES = [
  { id: 'account_hacked', label: 'Account hacked', description: 'Someone else has access to my account' },
  { id: 'cant_login', label: "Can't log in", description: "I'm locked out of my account" },
  { id: 'posts_deleted', label: 'Posts deleted', description: 'Content has been removed from my account' },
  { id: 'account_suspended', label: 'Account suspended', description: 'My account has been disabled or banned' },
  { id: 'impersonation', label: 'Impersonation', description: 'Someone is pretending to be me' },
]

interface PlaybookStep {
  id: number
  title: string
  description: string
  instructions: string[]
  estimated_minutes: number
  officialLink?: string
  officialLinkLabel?: string
}

interface Playbook {
  platform: string
  incident_type: string
  title: string
  description: string
  steps: PlaybookStep[]
}

const PLAYBOOKS: Record<string, Playbook> = {
  // ── INSTAGRAM ─────────────────────────────────────────────
  instagram_account_hacked: {
    platform: 'instagram', incident_type: 'account_hacked',
    title: 'Instagram Account Compromised',
    description: 'Your Instagram account has been accessed by someone else. Follow these steps in order.',
    steps: [
      { id: 1, title: 'Secure your email account first', description: 'Your password reset goes to your email — lock it down first.', estimated_minutes: 10,
        instructions: ['Open your email provider on a trusted device', 'Change your email password immediately', 'Enable 2FA on your email if not already active', 'Sign out all other active sessions on your email account'] },
      { id: 2, title: "Use Instagram's official hacked account flow", description: 'Go to instagram.com/hacked — do not use third-party recovery services.', estimated_minutes: 15,
        officialLink: 'https://help.instagram.com/368191326593075', officialLinkLabel: 'Instagram Help: Hacked Account',
        instructions: ['Go to instagram.com/hacked on a trusted device', 'Tap "My account was hacked"', 'Follow the identity verification prompts', 'Do NOT pay anyone claiming to recover your account'] },
      { id: 3, title: 'Revoke all active sessions', description: 'Once you have access, log out every unrecognised device.', estimated_minutes: 5,
        instructions: ['Profile → Settings → Security → Login Activity', 'Review every device and location listed', 'Log out of every session you don\'t recognise'] },
      { id: 4, title: 'Change password and enable 2FA', description: 'Use an authenticator app — not SMS.', estimated_minutes: 10,
        officialLink: 'https://help.instagram.com/566810106808145', officialLinkLabel: 'Instagram 2FA Setup Guide',
        instructions: ['Settings → Security → Password — create a new strong password', 'Settings → Security → Two-Factor Authentication', 'Select "Authentication App" and scan the QR code', 'Save your backup codes to your AEFORYN vault'] },
      { id: 5, title: 'Audit connected third-party apps', description: 'Hackers often grant themselves access via connected apps.', estimated_minutes: 5,
        instructions: ['Settings → Security → Apps and Websites → Active', 'Remove any app you didn\'t personally authorise', 'Remove anything you don\'t recognise in Expired tab too'] },
    ],
  },
  instagram_cant_login: {
    platform: 'instagram', incident_type: 'cant_login',
    title: "Instagram: Can't Log In",
    description: "You're locked out of your Instagram account. Work through these steps to regain access.",
    steps: [
      { id: 1, title: 'Try the standard password reset', description: 'Start with the simplest fix first.', estimated_minutes: 5,
        officialLink: 'https://help.instagram.com/374546259294234', officialLinkLabel: 'Instagram Login Help',
        instructions: ['Open Instagram and tap "Forgot password?"', 'Enter your username, email, or phone number', 'Follow the reset link sent to your email or phone', 'Set a new strong password immediately'] },
      { id: 2, title: 'Use the Video Selfie verification', description: 'If email/phone access is lost, Instagram offers identity verification.', estimated_minutes: 15,
        officialLink: 'https://help.instagram.com/182492381886913', officialLinkLabel: 'Instagram Identity Verification',
        instructions: ['On the login screen tap "Get more help"', 'Select "I can\'t access this email or phone number"', 'Follow the prompts to record a video selfie', 'Instagram will review within 24–48 hours'] },
      { id: 3, title: 'Recover access to your linked email or phone', description: 'If your email was also compromised, recover it first.', estimated_minutes: 20,
        instructions: ['Contact your email provider\'s account recovery team', 'Use any backup codes or backup email/phone on record', 'Once email is recovered, retry Instagram password reset'] },
      { id: 4, title: 'Contact Instagram support directly', description: 'As a last resort, submit a support request.', estimated_minutes: 10,
        officialLink: 'https://help.instagram.com/contact/505535973176353', officialLinkLabel: 'Instagram Support Form',
        instructions: ['Fill in the Instagram Help form with your account username', 'Describe the issue clearly and include when you last had access', 'Check your email for follow-up from Instagram\'s team'] },
    ],
  },
  instagram_posts_deleted: {
    platform: 'instagram', incident_type: 'posts_deleted',
    title: 'Instagram: Posts Removed',
    description: 'Your posts have been taken down. This could be a policy violation or a mistake — appeal it.',
    steps: [
      { id: 1, title: 'Check for removal notifications', description: 'Instagram sends a notification when it removes content.', estimated_minutes: 5,
        instructions: ['Open your notifications — look for a content removal notice', 'Note the exact reason given (nudity, spam, copyright, etc.)', 'Screenshot the notification for your records'] },
      { id: 2, title: 'Appeal the removal in-app', description: 'Most removals can be appealed directly.', estimated_minutes: 10,
        officialLink: 'https://help.instagram.com/111100069910823', officialLinkLabel: 'Instagram Content Appeals',
        instructions: ['In the removal notification, tap "Request Review"', 'Explain clearly why your content did not violate policy', 'Submit and wait up to 24 hours for a decision'] },
      { id: 3, title: 'If hacked — recover account first', description: 'If someone else deleted your posts, secure the account first.', estimated_minutes: 5,
        instructions: ['Check Login Activity (Settings → Security → Login Activity)', 'If you see unknown devices, follow the Account Hacked playbook', 'Deleted posts cannot be restored — document what was removed'] },
      { id: 4, title: 'Document and restore content from backups', description: 'Prepare for future incidents.', estimated_minutes: 15,
        instructions: ['Download your Instagram data: Settings → Account → Download Data', 'Upload your content to your AEFORYN Vault as backup', 'Consider reposting content that was wrongfully removed after appeal'] },
    ],
  },
  instagram_account_suspended: {
    platform: 'instagram', incident_type: 'account_suspended',
    title: 'Instagram Account Suspended',
    description: 'Your account has been disabled by Instagram. Follow this appeal process.',
    steps: [
      { id: 1, title: 'Understand the reason for suspension', description: 'Instagram will usually tell you why your account was disabled.', estimated_minutes: 5,
        officialLink: 'https://help.instagram.com/366993040048856', officialLinkLabel: 'Instagram: Disabled Accounts',
        instructions: ['Open Instagram — if disabled you\'ll see a "Account Disabled" message', 'Note the specific policy that was cited', 'Do not create a new account — this can make the ban permanent'] },
      { id: 2, title: 'Submit an appeal', description: 'Request a review of the decision.', estimated_minutes: 10,
        officialLink: 'https://help.instagram.com/contact/606967319425038', officialLinkLabel: 'Instagram Disabled Account Form',
        instructions: ['On the disabled screen, tap "Learn More" then "Request Review"', 'Submit your legal name and a photo of your government ID', 'Explain clearly why you believe the suspension was a mistake', 'Wait 5–10 business days for a response'] },
      { id: 3, title: 'Follow up if no response', description: 'Persistence matters — appeals can take multiple submissions.', estimated_minutes: 10,
        instructions: ['If no response in 10 days, resubmit the appeal form', 'Reach out via Instagram\'s Facebook page if the form is unresponsive', 'Gather evidence: posts, messages, or anything showing you follow the rules'] },
      { id: 4, title: 'Back up your data', description: 'Request your data before the account is permanently deleted.', estimated_minutes: 5,
        officialLink: 'https://help.instagram.com/181231772500920', officialLinkLabel: 'Request Instagram Data Download',
        instructions: ['If you can still log in, go to Settings → Account → Download Data', 'Request your data immediately — suspended accounts may be deleted', 'Save followers list, posts, and messages to your AEFORYN vault'] },
    ],
  },
  instagram_impersonation: {
    platform: 'instagram', incident_type: 'impersonation',
    title: 'Instagram Impersonation',
    description: 'Someone is posing as you on Instagram. Act quickly to get the fake account removed.',
    steps: [
      { id: 1, title: 'Document the impersonating account', description: 'Collect evidence before reporting — Instagram may act quickly.', estimated_minutes: 10,
        instructions: ['Screenshot the fake account\'s profile, bio, and posts', 'Note the exact username of the impersonating account', 'Screenshot any messages they\'ve sent impersonating you'] },
      { id: 2, title: 'Report the account to Instagram', description: 'Use Instagram\'s built-in impersonation report.', estimated_minutes: 5,
        officialLink: 'https://help.instagram.com/455666784375750', officialLinkLabel: 'Instagram: Report Impersonation',
        instructions: ['Visit the fake account\'s profile', 'Tap the three-dot menu → Report → It\'s pretending to be someone else', 'Select "Me" and submit the report', 'If you don\'t have an account, use the Help Center form'] },
      { id: 3, title: 'Alert your audience', description: 'Warn your followers before they get scammed.', estimated_minutes: 10,
        instructions: ['Post a Story and Feed post warning your audience of the fake account', 'Ask trusted followers to also report the impersonator', 'Tell followers your only verified account username'] },
      { id: 4, title: 'Verify your account to prevent future impersonation', description: 'A blue tick makes impersonation harder.', estimated_minutes: 10,
        officialLink: 'https://help.instagram.com/854227311295302', officialLinkLabel: 'Apply for Instagram Verification',
        instructions: ['Settings → Account → Request Verification', 'Submit your full name and a government-issued ID', 'You\'ll hear back within 30 days'] },
    ],
  },

  // ── FACEBOOK ─────────────────────────────────────────────
  facebook_account_hacked: {
    platform: 'facebook', incident_type: 'account_hacked',
    title: 'Facebook Account Compromised',
    description: "Someone has gained access to your Facebook account. Use Facebook's official recovery tool.",
    steps: [
      { id: 1, title: 'Go to facebook.com/hacked immediately', description: "This is Facebook's dedicated recovery portal.", estimated_minutes: 10,
        officialLink: 'https://www.facebook.com/hacked', officialLinkLabel: 'Facebook Hacked Account Portal',
        instructions: ['Open facebook.com/hacked on a trusted device', 'Select "My account is compromised"', 'Find your account by email, phone, or name', 'Follow the steps to secure your account'] },
      { id: 2, title: 'Review and revoke active sessions', description: "Log out every device you don't recognise.", estimated_minutes: 10,
        officialLink: 'https://www.facebook.com/settings?tab=security', officialLinkLabel: 'Facebook Security Settings',
        instructions: ['Settings → Security and Login → Where You\'re Logged In', 'Review every device listed', 'Click "Log Out" on any device you don\'t recognise', 'Click "Log Out of All Sessions" as a precaution'] },
      { id: 3, title: 'Change your password', description: 'Your old password is compromised — replace it now.', estimated_minutes: 5,
        instructions: ['Settings → Security and Login → Change Password', 'Use a unique password of at least 16 characters', 'Save it in a password manager', 'Never reuse passwords across sites'] },
      { id: 4, title: 'Enable two-factor authentication', description: "Add a second layer so hackers can't get back in.", estimated_minutes: 10,
        officialLink: 'https://www.facebook.com/settings?tab=security', officialLinkLabel: 'Facebook 2FA Settings',
        instructions: ['Settings → Security and Login → Two-Factor Authentication', 'Choose "Authentication App" and scan the QR code', 'Save your backup codes somewhere secure', 'Remove any phone numbers used as 2FA you don\'t control'] },
    ],
  },
  facebook_cant_login: {
    platform: 'facebook', incident_type: 'cant_login',
    title: "Facebook: Can't Log In",
    description: "You've been locked out of your Facebook account. Follow this recovery process.",
    steps: [
      { id: 1, title: 'Use the Forgot Password flow', description: "Facebook's standard reset works for most cases.", estimated_minutes: 5,
        officialLink: 'https://www.facebook.com/login/identify', officialLinkLabel: 'Facebook Account Recovery',
        instructions: ['Go to facebook.com and click "Forgot password?"', 'Enter your email, phone, name, or username', 'Follow the instructions sent to your email or phone'] },
      { id: 2, title: 'Use a Trusted Contact if you set one up', description: 'Trusted Contacts can send you recovery codes.', estimated_minutes: 10,
        officialLink: 'https://www.facebook.com/help/119897751441086', officialLinkLabel: 'Facebook Trusted Contacts',
        instructions: ['On the login screen, click "Forgot password?" → "No longer have access"', 'Select "Reveal My Trusted Contacts"', 'Contact 3–5 trusted friends for recovery codes', 'Enter all codes to unlock your account'] },
      { id: 3, title: 'Submit a support request with ID', description: 'If all else fails, Facebook can verify your identity manually.', estimated_minutes: 15,
        officialLink: 'https://www.facebook.com/help/contact/183000765122339', officialLinkLabel: 'Facebook ID Verification Form',
        instructions: ['Fill in Facebook\'s account access form', 'Upload a photo of your government-issued ID', 'Wait 3–5 business days for a response'] },
    ],
  },
  facebook_posts_deleted: {
    platform: 'facebook', incident_type: 'posts_deleted',
    title: 'Facebook: Content Removed',
    description: 'Facebook has removed your posts. Appeal the decision or restore from backup.',
    steps: [
      { id: 1, title: 'Find the removal notification', description: 'Facebook notifies you when content is removed.', estimated_minutes: 5,
        officialLink: 'https://www.facebook.com/help/4281866018674943', officialLinkLabel: 'Facebook Content Removal Help',
        instructions: ['Check your Support Inbox (Help → Support Inbox)', 'Note the specific policy violation cited', 'Screenshot the notice for your records'] },
      { id: 2, title: 'Request a review', description: 'Most removals can be appealed.', estimated_minutes: 10,
        instructions: ['In the Support Inbox notification, click "Request Review"', 'Explain why your content doesn\'t violate the policy', 'Submit and wait up to 5 business days'] },
      { id: 3, title: 'Submit to the Oversight Board if rejected', description: "For significant removals, escalate to Facebook's independent board.", estimated_minutes: 15,
        officialLink: 'https://oversightboard.com/submit-a-case/', officialLinkLabel: 'Facebook Oversight Board',
        instructions: ['Go to oversightboard.com', 'Submit your case with full context and evidence', "The Oversight Board can reverse Facebook's decisions"] },
    ],
  },
  facebook_account_suspended: {
    platform: 'facebook', incident_type: 'account_suspended',
    title: 'Facebook Account Disabled',
    description: 'Your Facebook account has been disabled. Follow the appeal process.',
    steps: [
      { id: 1, title: 'Confirm the reason for disabling', description: 'Facebook usually shows a reason when you try to log in.', estimated_minutes: 5,
        officialLink: 'https://www.facebook.com/help/103873106370583', officialLinkLabel: 'Facebook Disabled Accounts Help',
        instructions: ['Attempt to log in — read the message shown carefully', 'Note whether it\'s a Terms violation, authentic identity, or other reason', 'Do not create a new account — this worsens the situation'] },
      { id: 2, title: 'Submit the disabled account appeal form', description: "Request a review from Facebook's team.", estimated_minutes: 15,
        officialLink: 'https://www.facebook.com/help/contact/260749603972907', officialLinkLabel: 'Facebook Disabled Account Form',
        instructions: ['Fill in the Disabled Account form completely', "Upload a government-issued ID (passport, driver's licence)", 'Clearly explain why you believe the disable was in error', 'Submit and wait up to 10 business days'] },
      { id: 3, title: 'Follow up persistently', description: 'Facebook appeals sometimes require multiple attempts.', estimated_minutes: 10,
        instructions: ['If no reply in 10 days, resubmit the form', 'Try reaching Facebook via @FacebookForMedia on X if you have a public presence', 'Document all submissions with dates and reference numbers'] },
    ],
  },
  facebook_impersonation: {
    platform: 'facebook', incident_type: 'impersonation',
    title: 'Facebook Impersonation',
    description: 'Someone has created a fake Facebook profile pretending to be you.',
    steps: [
      { id: 1, title: 'Document the fake profile', description: 'Collect full evidence before reporting.', estimated_minutes: 10,
        instructions: ['Screenshot the fake profile, photos, bio, and any posts', 'Note the profile URL and name used', "Check if they've sent messages to your contacts"] },
      { id: 2, title: 'Report the fake profile to Facebook', description: 'Facebook takes impersonation seriously for public figures.', estimated_minutes: 5,
        officialLink: 'https://www.facebook.com/help/contact/295309487309948', officialLinkLabel: 'Facebook Impersonation Report',
        instructions: ['Visit the fake profile', 'Click the three-dot menu → Find Support or Report Profile', 'Select "Pretending to be someone" → "Me"', 'Submit the report with your evidence'] },
      { id: 3, title: 'Warn your audience', description: "Alert your followers before they're scammed.", estimated_minutes: 10,
        instructions: ['Post a warning on your real Facebook page and other platforms', 'Ask friends to also report the fake account', 'Tell followers your only official account URL'] },
      { id: 4, title: 'Apply for verification', description: 'A verified badge deters future impersonation.', estimated_minutes: 10,
        officialLink: 'https://www.facebook.com/help/196050490547892', officialLinkLabel: 'Facebook Verification Help',
        instructions: ['Settings → General → Page Verification (for Pages)', 'For profiles, submit ID via the Help Center', 'Verification significantly reduces impersonation risk'] },
    ],
  },

  // ── TIKTOK ─────────────────────────────────────────────
  tiktok_account_hacked: {
    platform: 'tiktok', incident_type: 'account_hacked',
    title: 'TikTok Account Compromised',
    description: 'Your TikTok account has been accessed by an unauthorised party.',
    steps: [
      { id: 1, title: "Submit TikTok's account compromise form", description: 'TikTok has a dedicated security form for compromised accounts.', estimated_minutes: 10,
        officialLink: 'https://support.tiktok.com/en/account-and-privacy/account-safety', officialLinkLabel: 'TikTok Account Safety Help',
        instructions: ['Go to TikTok\'s Help Center → Account Safety', 'Select "My account has been hacked"', 'Fill in your username and registered email/phone', 'Submit and check your email for next steps'] },
      { id: 2, title: 'Revoke linked device access', description: "Disconnect any devices you don't recognise.", estimated_minutes: 10,
        instructions: ['In TikTok: Profile → ☰ → Settings → Security → Manage Devices', "Remove any device you don't recognise", 'Change your password immediately after'] },
      { id: 3, title: 'Secure your linked email and phone', description: 'If your email was compromised, the hacker can keep getting back in.', estimated_minutes: 15,
        instructions: ['Change your linked email password', 'Enable 2FA on your email', 'Change your phone account PIN if you use SMS 2FA'] },
      { id: 4, title: 'Enable two-step verification on TikTok', description: 'Prevent repeat attacks with an authenticator app.', estimated_minutes: 10,
        instructions: ['Profile → ☰ → Settings → Security → 2-Step Verification', 'Select "Authenticator App"', 'Scan the QR code with Google Authenticator or Authy', 'Save your backup codes'] },
    ],
  },
  tiktok_cant_login: {
    platform: 'tiktok', incident_type: 'cant_login',
    title: "TikTok: Can't Log In",
    description: "You're locked out of your TikTok account.",
    steps: [
      { id: 1, title: 'Reset via email or phone', description: "TikTok's standard password reset.", estimated_minutes: 5,
        officialLink: 'https://support.tiktok.com/en/account-and-privacy/account-information/sign-in-to-tiktok', officialLinkLabel: 'TikTok Sign-in Help',
        instructions: ['On TikTok login screen, tap "Forgot password?"', 'Choose email or phone number recovery', 'Enter the verification code sent to you', 'Create a new strong password'] },
      { id: 2, title: 'Try logging in with linked social accounts', description: 'If you signed up with Google, Facebook, or Apple.', estimated_minutes: 5,
        instructions: ['On the login screen, tap your original sign-in method', 'Try "Continue with Google", "Continue with Apple", or similar', 'If that account is locked, recover it first'] },
      { id: 3, title: 'Contact TikTok support directly', description: "If self-service doesn't work, open a support ticket.", estimated_minutes: 10,
        officialLink: 'https://support.tiktok.com/en/account-and-privacy/account-information', officialLinkLabel: 'TikTok Support Centre',
        instructions: ['Visit TikTok\'s Help Center and click "Contact Us"', 'Select "Account Issue" → "Login problem"', 'Provide your username and the email/phone you registered with', 'Check your email for support replies'] },
    ],
  },
  tiktok_posts_deleted: {
    platform: 'tiktok', incident_type: 'posts_deleted',
    title: 'TikTok: Videos Removed',
    description: 'TikTok has removed your videos. Appeal to get them restored.',
    steps: [
      { id: 1, title: 'Check your TikTok inbox for the removal notice', description: 'TikTok sends a notification with the reason for removal.', estimated_minutes: 5,
        instructions: ['Go to your TikTok inbox → Activity tab', 'Find any content removal notifications', 'Note the policy violation cited'] },
      { id: 2, title: 'Appeal the removal', description: 'Most TikTok content removals can be appealed in-app.', estimated_minutes: 10,
        officialLink: 'https://support.tiktok.com/en/safety-hc/account-and-user-safety/content-violations-and-bans', officialLinkLabel: 'TikTok Content Appeals',
        instructions: ['In the removal notification, tap "Appeal"', 'Write a clear explanation of why your content complies with Community Guidelines', 'Submit — TikTok typically responds within 24–72 hours'] },
      { id: 3, title: 'Download your TikTok data', description: 'Back up your content before further action.', estimated_minutes: 10,
        instructions: ['Profile → ☰ → Settings → Privacy → Download Your Data', 'Request your data (takes up to 4 days)', 'Upload important videos to your AEFORYN vault'] },
    ],
  },
  tiktok_account_suspended: {
    platform: 'tiktok', incident_type: 'account_suspended',
    title: 'TikTok Account Banned',
    description: 'Your TikTok account has been permanently or temporarily banned.',
    steps: [
      { id: 1, title: 'Understand the type of ban', description: 'TikTok issues temporary bans and permanent bans for different violations.', estimated_minutes: 5,
        officialLink: 'https://support.tiktok.com/en/account-and-privacy/account-information/account-bans', officialLinkLabel: 'TikTok Account Bans',
        instructions: ['Check your TikTok inbox for a ban notification', "Note whether it's temporary (days/weeks) or permanent", 'Read the specific Community Guideline cited'] },
      { id: 2, title: 'Appeal the ban', description: 'Both temporary and permanent bans can be appealed.', estimated_minutes: 15,
        officialLink: 'https://support.tiktok.com/en/safety-hc/account-and-user-safety/content-violations-and-bans', officialLinkLabel: 'TikTok Appeal a Ban',
        instructions: ['In the ban notification, tap "Appeal"', 'Provide a thorough explanation with evidence if available', "Wait for TikTok's response (typically 5–10 business days)"] },
      { id: 3, title: 'Back up your content and audience data', description: 'In case the ban is permanent, capture what you can.', estimated_minutes: 10,
        instructions: ['From another device, visit your TikTok profile and note your follower count', 'Request a data download if still able to log in', 'Redirect your audience to your other platforms'] },
    ],
  },
  tiktok_impersonation: {
    platform: 'tiktok', incident_type: 'impersonation',
    title: 'TikTok Impersonation',
    description: 'Someone is posing as you on TikTok.',
    steps: [
      { id: 1, title: 'Document the fake account', description: 'Capture all evidence before reporting.', estimated_minutes: 10,
        instructions: ['Screenshot the fake account\'s username, bio, profile photo, and videos', 'Note the exact TikTok username (@handle)', "Check if they're scamming your followers in comments or DMs"] },
      { id: 2, title: 'Report the account via TikTok', description: 'TikTok has a dedicated impersonation report flow.', estimated_minutes: 5,
        officialLink: 'https://support.tiktok.com/en/safety-hc/report-a-problem/report-an-account', officialLinkLabel: 'TikTok: Report an Account',
        instructions: ['Visit the fake account\'s profile', 'Tap the Share button → Report', 'Select "Impersonating someone" → "Me"', 'Submit with your evidence'] },
      { id: 3, title: 'Warn your followers on TikTok and other platforms', description: "Alert your community before they're scammed.", estimated_minutes: 10,
        instructions: ['Post a TikTok video or Live clarifying you only have one account', 'Pin a comment on recent videos with your real username', 'Post warnings on all your other social platforms'] },
    ],
  },

  // ── YOUTUBE ─────────────────────────────────────────────
  youtube_account_hacked: {
    platform: 'youtube', incident_type: 'account_hacked',
    title: 'YouTube / Google Account Compromised',
    description: 'Your YouTube channel is controlled by your Google account. Securing Google secures YouTube.',
    steps: [
      { id: 1, title: "Run Google's Account Recovery", description: "Google's recovery flow is the primary path for a hacked account.", estimated_minutes: 15,
        officialLink: 'https://accounts.google.com/signin/v2/recoveryidentifier', officialLinkLabel: 'Google Account Recovery',
        instructions: ['Go to accounts.google.com/signin/recovery', 'Enter your Google email address', 'Follow the verification steps (backup email, phone, or security questions)', 'Once in, change your password immediately'] },
      { id: 2, title: 'Review and revoke active Google sessions', description: "Remove all devices you don't recognise.", estimated_minutes: 10,
        officialLink: 'https://myaccount.google.com/security', officialLinkLabel: 'Google Security Check',
        instructions: ['Go to myaccount.google.com → Security → Your Devices', "Sign out of any device you don't recognise", 'Also check "Recent Security Activity" for anomalies'] },
      { id: 3, title: 'Secure your YouTube channel permissions', description: 'If you have Channel Managers, audit them.', estimated_minutes: 10,
        officialLink: 'https://studio.youtube.com', officialLinkLabel: 'YouTube Studio',
        instructions: ['Open YouTube Studio → Settings → Permissions', "Remove any manager or editor you didn't add", 'Revoke any suspicious third-party app access'] },
      { id: 4, title: 'Enable 2-Step Verification on Google', description: 'Use an authenticator app or a physical security key.', estimated_minutes: 10,
        officialLink: 'https://myaccount.google.com/signinoptions/two-step-verification', officialLinkLabel: 'Google 2-Step Verification',
        instructions: ['myaccount.google.com → Security → 2-Step Verification', 'Add an authenticator app (Google Authenticator or Authy)', 'Remove SMS as 2FA if possible — use an authenticator app instead', 'Save backup codes to your AEFORYN vault'] },
    ],
  },
  youtube_cant_login: {
    platform: 'youtube', incident_type: 'cant_login',
    title: "YouTube: Can't Log In",
    description: "You're locked out of the Google account linked to your YouTube channel.",
    steps: [
      { id: 1, title: "Use Google's sign-in troubleshooter", description: 'Google has a guided recovery process for most scenarios.', estimated_minutes: 10,
        officialLink: 'https://support.google.com/accounts/troubleshooter/6949360', officialLinkLabel: 'Google Sign-in Troubleshooter',
        instructions: ['Go to the Google account recovery page', 'Enter your email and follow the recovery steps', 'Use a backup email, phone, or trusted device to verify'] },
      { id: 2, title: 'Prove account ownership via Google support', description: 'If automated recovery fails, request human review.', estimated_minutes: 15,
        officialLink: 'https://support.google.com/youtube/contact/mc_channel_disabled', officialLinkLabel: 'YouTube Support Contact',
        instructions: ['Fill in YouTube\'s support form explaining you can\'t access your channel', 'Provide your channel URL, creation date, and any purchase history on the account', 'Wait for Google support to respond via email'] },
    ],
  },
  youtube_posts_deleted: {
    platform: 'youtube', incident_type: 'posts_deleted',
    title: 'YouTube: Videos Removed',
    description: 'YouTube removed your video. You have the right to appeal.',
    steps: [
      { id: 1, title: 'Check your YouTube Studio for removal notices', description: 'YouTube notifies you of every removal via email and Studio.', estimated_minutes: 5,
        officialLink: 'https://studio.youtube.com', officialLinkLabel: 'YouTube Studio',
        instructions: ['Open YouTube Studio → Content', 'Look for any videos marked "Removed" or showing a warning icon', 'Click on the video to see the specific violation'] },
      { id: 2, title: 'Appeal a Community Guidelines removal', description: 'If YouTube removed for guideline violation.', estimated_minutes: 10,
        officialLink: 'https://support.google.com/youtube/answer/185111', officialLinkLabel: 'YouTube Appeal a Removal',
        instructions: ['In Studio, click "Appeal" next to the removed video', 'Write a detailed explanation of why your video complies', 'Submit — YouTube typically responds within 24–48 hours'] },
      { id: 3, title: 'Dispute a copyright claim', description: 'If removed for copyright, you can counter-dispute if you own the content.', estimated_minutes: 15,
        officialLink: 'https://support.google.com/youtube/answer/2807684', officialLinkLabel: 'YouTube Copyright Counter-Notice',
        instructions: ['In Studio, go to Copyright Notices under your video', 'Click "Submit a Counter Notification"', 'Provide your full legal name and explain your rights to the content', 'YouTube will reinstate within 10 business days if no court action is filed'] },
    ],
  },
  youtube_account_suspended: {
    platform: 'youtube', incident_type: 'account_suspended',
    title: 'YouTube Channel Terminated',
    description: 'Your YouTube channel has been terminated. Appeal the decision.',
    steps: [
      { id: 1, title: 'Review the termination reason', description: 'YouTube emails you when terminating a channel.', estimated_minutes: 5,
        officialLink: 'https://support.google.com/youtube/answer/2802168', officialLinkLabel: 'YouTube Channel Termination',
        instructions: ['Check the email associated with your channel', 'Read the specific policy (spam, impersonation, repeated violations, etc.)', 'Note whether your Google account was also suspended'] },
      { id: 2, title: 'Submit a channel appeal', description: 'Request a manual review of the termination.', estimated_minutes: 15,
        officialLink: 'https://support.google.com/youtube/contact/mc_channel_disabled', officialLinkLabel: 'YouTube Channel Appeal Form',
        instructions: ['Go to the YouTube channel appeal form', 'Enter your channel URL and explain your case thoroughly', 'Provide evidence that your channel complied with policies', 'Wait 5–10 business days for a response'] },
      { id: 3, title: 'Back up your content and subscriber data', description: 'Preserve everything you can.', estimated_minutes: 10,
        instructions: ['If you had a backup or downloaded your content previously, locate it now', 'Note your subscriber count and channel analytics for documentation', 'Redirect your audience to alternative platforms in the meantime'] },
    ],
  },
  youtube_impersonation: {
    platform: 'youtube', incident_type: 'impersonation',
    title: 'YouTube Impersonation',
    description: 'A fake YouTube channel is pretending to be you.',
    steps: [
      { id: 1, title: 'Document the fake channel', description: 'Collect all evidence before reporting.', estimated_minutes: 10,
        instructions: ['Screenshot the fake channel\'s name, banner, avatar, and "About" section', 'Note the channel URL (youtube.com/channel/...)', "Check if they're running scam livestreams impersonating you"] },
      { id: 2, title: 'Report the channel to YouTube', description: "Use YouTube's impersonation reporting tool.", estimated_minutes: 5,
        officialLink: 'https://support.google.com/youtube/answer/2801895', officialLinkLabel: 'YouTube: Report Impersonation',
        instructions: ['Visit the fake channel\'s page', 'Click the flag icon → Report User', 'Select "Impersonation" and choose "Pretending to be me"', 'Submit with screenshots as evidence'] },
      { id: 3, title: 'Warn your audience across platforms', description: "Alert your subscribers before they're scammed.", estimated_minutes: 10,
        instructions: ['Post a Community post or video clarifying your official channel', 'Pin a comment on recent videos with your channel URL', 'Warn your audience on all other platforms too'] },
    ],
  },

  // ── EMAIL / GMAIL ─────────────────────────────────────────────
  email_account_hacked: {
    platform: 'email', incident_type: 'account_hacked',
    title: 'Gmail / Google Account Compromised',
    description: 'Someone has access to your Gmail account. Act immediately — email access enables access to everything else.',
    steps: [
      { id: 1, title: "Run the Google Account Recovery flow", description: "If you're locked out, use Google's recovery to get back in first.", estimated_minutes: 10,
        officialLink: 'https://accounts.google.com/signin/v2/recoveryidentifier', officialLinkLabel: 'Google Account Recovery',
        instructions: ['Go to accounts.google.com/signin/recovery', 'Answer the account verification steps', 'Use a backup phone, backup email, or trusted device'] },
      { id: 2, title: 'Review all active sessions and sign out everywhere', description: "Remove the attacker's active session immediately.", estimated_minutes: 10,
        officialLink: 'https://myaccount.google.com/security', officialLinkLabel: 'Google Security Dashboard',
        instructions: ['myaccount.google.com → Security → Your Devices', 'Click "Select all" then "Sign Out" on all devices', 'Check "Recent Security Activity" for suspicious logins'] },
      { id: 3, title: 'Change your Google password immediately', description: "Use a unique, strong password you've never used before.", estimated_minutes: 5,
        instructions: ['myaccount.google.com → Security → Password', 'Create a password of at least 20 characters', 'Save it in a password manager — never reuse it'] },
      { id: 4, title: 'Enable 2-Step Verification with an authenticator app', description: 'SMS 2FA can be bypassed — use an app.', estimated_minutes: 10,
        officialLink: 'https://myaccount.google.com/signinoptions/two-step-verification', officialLinkLabel: 'Google 2-Step Verification',
        instructions: ['myaccount.google.com → Security → 2-Step Verification', 'Add Google Authenticator or Authy', 'Remove SMS as 2FA if possible', 'Download and store backup codes in your AEFORYN vault'] },
      { id: 5, title: 'Check for forwarding rules set by the attacker', description: 'Hackers often set up silent email forwarding.', estimated_minutes: 5,
        instructions: ['Gmail → Settings (gear) → See all settings → Forwarding and POP/IMAP', "Remove any forwarding addresses you didn't set", 'Also check Filters and Blocked Addresses for anything suspicious'] },
    ],
  },
  email_cant_login: {
    platform: 'email', incident_type: 'cant_login',
    title: "Gmail: Can't Log In",
    description: "You're locked out of your Google/Gmail account.",
    steps: [
      { id: 1, title: "Use Google's sign-in troubleshooter", description: "Follow Google's guided recovery flow.", estimated_minutes: 10,
        officialLink: 'https://support.google.com/accounts/troubleshooter/6949360', officialLinkLabel: 'Google Sign-in Troubleshooter',
        instructions: ['Visit the Google Account Recovery page', 'Enter your email and work through the verification steps', 'Use a backup phone number, secondary email, or trusted device'] },
      { id: 2, title: 'Verify your identity via security questions or previous passwords', description: 'Google may ask you to confirm past activity.', estimated_minutes: 10,
        instructions: ['Answer "When did you create this account?"', 'Enter a previous password if you remember one', "Confirm devices you've signed into before"] },
      { id: 3, title: 'Request manual identity verification', description: 'As a last resort, Google can review your case.', estimated_minutes: 15,
        officialLink: 'https://support.google.com/accounts/contact/disabled_g_apps', officialLinkLabel: 'Google Support Contact',
        instructions: ['Fill in Google\'s account access support form', 'Describe how you used the account (purchase history, sent emails, etc.)', 'Wait for a response — this can take 3–5 business days'] },
    ],
  },
  email_posts_deleted: {
    platform: 'email', incident_type: 'posts_deleted',
    title: 'Gmail: Emails Deleted',
    description: "Your emails have been deleted — try to recover them from Gmail's trash.",
    steps: [
      { id: 1, title: 'Check the Trash folder immediately', description: 'Deleted emails stay in Trash for 30 days.', estimated_minutes: 5,
        instructions: ['In Gmail, click "Trash" in the left sidebar', 'Look for your deleted emails — they\'re kept for 30 days', 'Select emails and click "Move to Inbox" to restore them'] },
      { id: 2, title: 'Check if a filter is auto-deleting new emails', description: 'An attacker may have set up deletion filters.', estimated_minutes: 5,
        instructions: ['Gmail → Settings → Filters and Blocked Addresses', 'Look for any filter with "Delete it" action that you didn\'t create', 'Delete any suspicious filters immediately'] },
      { id: 3, title: 'Contact Google support for bulk deletion recovery', description: 'Google may be able to restore emails deleted within the last few days.', estimated_minutes: 15,
        officialLink: 'https://support.google.com/mail/contact/web_app_error', officialLinkLabel: 'Gmail Support',
        instructions: ['Contact Gmail support explaining the situation', 'Provide the approximate date and time of deletion', 'Google can sometimes restore bulk-deleted mail within 72 hours of deletion'] },
    ],
  },
  email_account_suspended: {
    platform: 'email', incident_type: 'account_suspended',
    title: 'Gmail: Account Suspended / Disabled',
    description: "Your Google account has been disabled. Follow Google's reinstatement process.",
    steps: [
      { id: 1, title: 'Understand why your account was disabled', description: 'Google sends an email to your recovery address explaining the reason.', estimated_minutes: 5,
        officialLink: 'https://support.google.com/accounts/troubleshooter/6357590', officialLinkLabel: 'Google Account Disabled Help',
        instructions: ['Check any recovery email for a message from Google', 'Try to log in — Google will show the reason on the disabled screen', "Note whether it's a Terms of Service, spam, or payment issue"] },
      { id: 2, title: 'Submit the account reinstatement request', description: 'Request a manual review.', estimated_minutes: 15,
        officialLink: 'https://accounts.google.com/signin/v2/recoveryidentifier', officialLinkLabel: 'Google Account Reinstatement',
        instructions: ['Go to the Google account recovery page', 'Follow the steps to verify your identity', 'Submit your reinstatement request explaining the situation', 'Wait up to 5 business days for a response'] },
    ],
  },
  email_impersonation: {
    platform: 'email', incident_type: 'impersonation',
    title: 'Email Impersonation / Phishing',
    description: 'Someone is sending emails pretending to be you, or spoofing your email address.',
    steps: [
      { id: 1, title: 'Determine if your account is spoofed or hacked', description: 'Spoofing fakes your "from" address; hacking uses your actual account.', estimated_minutes: 10,
        instructions: ['Check your Gmail Sent folder for emails you didn\'t send', "If Sent folder is clean, it's email spoofing (not account access)", 'Ask recipients to forward suspicious emails so you can inspect the headers'] },
      { id: 2, title: 'Report phishing emails to Google', description: 'Help Google block the spoofed domain.', estimated_minutes: 5,
        officialLink: 'https://support.google.com/mail/answer/8253', officialLinkLabel: 'Report Phishing to Google',
        instructions: ['In Gmail, open the suspicious email', 'Click the three-dot menu → Report phishing', 'This helps Google block the sender for everyone'] },
      { id: 3, title: 'Alert your contacts and explain what happened', description: 'Warn anyone who may have received a fake email from "you".', estimated_minutes: 15,
        instructions: ['Send a genuine email to your contacts explaining the situation', 'Tell them to delete and not click any links in emails claiming to be from you', 'Give them a way to verify they\'re speaking to the real you (call or meet)'] },
      { id: 4, title: 'Set up email authentication (DMARC/DKIM/SPF)', description: 'If you own a domain, proper DNS records prevent spoofing.', estimated_minutes: 20,
        officialLink: 'https://support.google.com/a/answer/33786', officialLinkLabel: 'Google Workspace SPF/DKIM Setup',
        instructions: ['Contact your domain registrar or IT admin', 'Set up SPF, DKIM, and DMARC records on your domain', 'These prevent others from spoofing your exact domain address'] },
    ],
  },

  // ── X (TWITTER) ─────────────────────────────────────────────
  x_account_hacked: {
    platform: 'x', incident_type: 'account_hacked',
    title: 'X (Twitter) Account Compromised',
    description: 'Your X account has been accessed by an unauthorised party.',
    steps: [
      { id: 1, title: "Submit X's compromised account form", description: 'X has a specific form for hacked accounts.', estimated_minutes: 10,
        officialLink: 'https://help.twitter.com/en/forms/account-access/hacked-or-compromised', officialLinkLabel: 'X: Hacked Account Form',
        instructions: ['Go to X\'s Help Center → Hacked Account form', 'Enter your username and the email associated with the account', "Follow X's recovery instructions sent to your email"] },
      { id: 2, title: 'Change your password and log out all devices', description: "Once you're back in, evict the intruder.", estimated_minutes: 10,
        instructions: ['Settings → Security and Account Access → Password → Change your password', 'Settings → Security → Sessions → Log out of all other sessions', 'Review "Connected Apps" and remove any you didn\'t authorise'] },
      { id: 3, title: 'Enable two-factor authentication', description: 'Use an authenticator app (SMS 2FA requires X Premium).', estimated_minutes: 10,
        officialLink: 'https://help.twitter.com/en/managing-your-account/two-factor-authentication', officialLinkLabel: 'X Two-Factor Authentication',
        instructions: ['Settings → Security → Two-factor authentication', 'Select "Authentication app" and scan the QR code', 'Save your backup code somewhere secure'] },
    ],
  },
  x_cant_login: {
    platform: 'x', incident_type: 'cant_login',
    title: "X: Can't Log In",
    description: "You're locked out of your X (Twitter) account.",
    steps: [
      { id: 1, title: 'Reset your password via email or phone', description: "X's standard reset flow.", estimated_minutes: 5,
        officialLink: 'https://help.twitter.com/en/managing-your-account/change-twitter-password', officialLinkLabel: 'X Password Reset',
        instructions: ['On X\'s login page, click "Forgot password?"', 'Enter your username, email, or phone number', 'Follow the reset link or code sent to you'] },
      { id: 2, title: 'Contact X support if reset fails', description: 'Submit a support request with identity proof.', estimated_minutes: 15,
        officialLink: 'https://help.twitter.com/en/forms/account-access/login-issues', officialLinkLabel: 'X Support: Login Issues',
        instructions: ['Go to X Help Center → Account Access → Login Issues', 'Complete the form with your username and registered contact info', 'X support will respond via email'] },
    ],
  },
  x_posts_deleted: {
    platform: 'x', incident_type: 'posts_deleted',
    title: 'X: Posts Removed',
    description: 'Your X posts have been removed by X or by a hacker.',
    steps: [
      { id: 1, title: 'Check your X notifications for policy removal notices', description: 'X notifies you when it removes a post.', estimated_minutes: 5,
        instructions: ['Check your X notifications and email for removal notices', 'Note the specific rule cited (e.g. hateful conduct, misinformation)', 'Screenshot the notice for your records'] },
      { id: 2, title: 'Appeal the removal', description: "X allows appeals for policy-based removals.", estimated_minutes: 10,
        officialLink: 'https://help.twitter.com/en/forms/account-access/appeals', officialLinkLabel: 'X Content Appeal Form',
        instructions: ['Go to X\'s appeals form', 'Enter your username and describe the removed content', "Explain clearly why it did not violate X's rules", 'Submit and wait up to 7 days'] },
      { id: 3, title: 'If posts were deleted by a hacker — secure the account first', description: 'Follow the Account Hacked playbook first, then document what was deleted.', estimated_minutes: 5,
        instructions: ['Run the Account Hacked playbook to reclaim your account', 'Deleted posts cannot be recovered — document what was lost', 'Consider reposting from screenshots or drafts'] },
    ],
  },
  x_account_suspended: {
    platform: 'x', incident_type: 'account_suspended',
    title: 'X: Account Suspended',
    description: "Your X account has been suspended. Appeal through X's official process.",
    steps: [
      { id: 1, title: 'Review the suspension reason', description: 'X emails the reason when suspending an account.', estimated_minutes: 5,
        officialLink: 'https://help.twitter.com/en/managing-your-account/suspended-twitter-accounts', officialLinkLabel: 'X: Suspended Accounts',
        instructions: ['Check your registered email for a suspension notice from X', 'Note the specific rule violated', 'Do not create a new account — X permanently bans repeat offenders'] },
      { id: 2, title: "Submit an appeal via X's form", description: 'Request a human review of the suspension.', estimated_minutes: 15,
        officialLink: 'https://help.twitter.com/en/forms/account-access/appeals', officialLinkLabel: 'X Account Appeal Form',
        instructions: ['Go to X\'s appeals form', 'Enter your suspended account username', 'Clearly explain why you believe the suspension was a mistake', 'Provide evidence if available (screenshots, context)', 'Wait up to 7–14 business days for a response'] },
    ],
  },
  x_impersonation: {
    platform: 'x', incident_type: 'impersonation',
    title: 'X: Impersonation',
    description: 'Someone is pretending to be you on X (Twitter).',
    steps: [
      { id: 1, title: 'Document the impersonating account', description: 'Capture all evidence.', estimated_minutes: 10,
        instructions: ['Screenshot the fake account\'s profile, bio, posts, and any DMs sent to others', 'Note the exact @handle of the impersonating account'] },
      { id: 2, title: 'Report the account to X', description: "Use X's impersonation report.", estimated_minutes: 5,
        officialLink: 'https://help.twitter.com/en/safety-and-security/report-twitter-impersonation', officialLinkLabel: 'X: Report Impersonation',
        instructions: ['Visit the fake account\'s profile on X', 'Click the three-dot menu → Report', 'Select "They\'re pretending to be me or someone I know"', 'Follow the prompts and submit your evidence'] },
      { id: 3, title: 'Apply for X verification', description: 'A verified badge makes impersonation much harder.', estimated_minutes: 10,
        officialLink: 'https://help.twitter.com/en/managing-your-account/verification-faq', officialLinkLabel: 'X Verification FAQ',
        instructions: ['Verification on X requires X Premium subscription', 'Subscribe to X Premium and ensure your account meets the requirements', 'A checkmark makes it obvious which account is real'] },
    ],
  },

  // ── LINKEDIN ─────────────────────────────────────────────
  linkedin_account_hacked: {
    platform: 'linkedin', incident_type: 'account_hacked',
    title: 'LinkedIn Account Compromised',
    description: 'Your LinkedIn account has been accessed without your permission.',
    steps: [
      { id: 1, title: 'Sign in and change your password immediately', description: 'If you can still get in, act now.', estimated_minutes: 5,
        officialLink: 'https://www.linkedin.com/help/linkedin/answer/56363', officialLinkLabel: 'LinkedIn Hacked Account Help',
        instructions: ['Go to linkedin.com and sign in on a trusted device', 'Click your profile photo → Settings → Sign in & Security → Change Password', 'Use a strong, unique password not used anywhere else'] },
      { id: 2, title: 'Sign out of all sessions', description: "Log out every device you don't recognise.", estimated_minutes: 5,
        instructions: ['Settings → Sign in & Security → Where You\'re Signed In', 'Click "Sign out" on all unrecognised sessions', 'Select "Sign out of all sessions" as a precaution'] },
      { id: 3, title: 'Enable two-step verification', description: 'Add an extra layer of security.', estimated_minutes: 10,
        officialLink: 'https://www.linkedin.com/help/linkedin/answer/531', officialLinkLabel: 'LinkedIn Two-Step Verification',
        instructions: ['Settings → Sign in & Security → Two-Step Verification → Set up', 'Choose Authenticator App for strongest security', 'Save your backup codes'] },
      { id: 4, title: 'Review and revoke connected apps', description: "Remove any app with LinkedIn access you didn't authorise.", estimated_minutes: 5,
        instructions: ['Settings → Data Privacy → Other applications', 'Review every app listed under "Permitted Services"', "Remove any you don't recognise or no longer use"] },
    ],
  },
  linkedin_cant_login: {
    platform: 'linkedin', incident_type: 'cant_login',
    title: "LinkedIn: Can't Log In",
    description: "You're locked out of your LinkedIn account.",
    steps: [
      { id: 1, title: 'Reset your password', description: "Use LinkedIn's forgotten password flow.", estimated_minutes: 5,
        officialLink: 'https://www.linkedin.com/uas/request-password-reset', officialLinkLabel: 'LinkedIn Password Reset',
        instructions: ['Click "Forgot password?" on the LinkedIn login page', 'Enter your email address or phone number', 'Follow the reset link sent to you'] },
      { id: 2, title: 'Contact LinkedIn support', description: "If reset doesn't work, request support.", estimated_minutes: 15,
        officialLink: 'https://www.linkedin.com/help/linkedin/ask/cs-aao', officialLinkLabel: 'LinkedIn Support Request',
        instructions: ['Go to LinkedIn Help Center → Contact Us', 'Select "Account Access" → "I can\'t sign in"', 'Provide your full name, email, and any profile information to verify ownership', 'Wait for an email response from LinkedIn'] },
    ],
  },
  linkedin_posts_deleted: {
    platform: 'linkedin', incident_type: 'posts_deleted',
    title: 'LinkedIn: Content Removed',
    description: 'LinkedIn has removed your post or article.',
    steps: [
      { id: 1, title: 'Check your notifications for a removal notice', description: 'LinkedIn notifies you when content is removed.', estimated_minutes: 5,
        instructions: ['Check LinkedIn notifications and your registered email', 'Note the specific policy violation cited', 'Save a screenshot of the notice'] },
      { id: 2, title: 'Appeal the removal', description: 'Contact LinkedIn support to appeal.', estimated_minutes: 15,
        officialLink: 'https://www.linkedin.com/help/linkedin/ask/cs-mpuv', officialLinkLabel: 'LinkedIn Content Appeal',
        instructions: ['Go to LinkedIn Help → Contact Support', 'Select "Content" → "I believe my content was removed in error"', "Explain clearly why your content complies with LinkedIn's Professional Community Policies", 'Include the original post text and context'] },
    ],
  },
  linkedin_account_suspended: {
    platform: 'linkedin', incident_type: 'account_suspended',
    title: 'LinkedIn Account Restricted',
    description: 'Your LinkedIn account has been restricted or permanently closed by LinkedIn.',
    steps: [
      { id: 1, title: 'Understand the restriction type', description: 'LinkedIn restricts accounts for different reasons.', estimated_minutes: 5,
        officialLink: 'https://www.linkedin.com/help/linkedin/answer/82934', officialLinkLabel: 'LinkedIn: Restricted Accounts',
        instructions: ['Try to log in and read the message shown', "Note whether it's a temporary or permanent restriction", 'Check your email for a message from LinkedIn explaining the reason'] },
      { id: 2, title: 'Submit a restriction appeal', description: 'Request manual review of your account status.', estimated_minutes: 15,
        officialLink: 'https://www.linkedin.com/help/linkedin/ask/cs-raa', officialLinkLabel: 'LinkedIn Restriction Appeal',
        instructions: ['Go to LinkedIn Help → Contact Us → Account Access', 'Select "My account is restricted"', 'Provide your full name, email, and a detailed explanation', 'Upload your ID if requested'] },
    ],
  },
  linkedin_impersonation: {
    platform: 'linkedin', incident_type: 'impersonation',
    title: 'LinkedIn: Fake Profile Impersonating You',
    description: 'Someone has created a LinkedIn profile pretending to be you.',
    steps: [
      { id: 1, title: 'Document the fake profile', description: 'Collect evidence before reporting.', estimated_minutes: 10,
        instructions: ['Screenshot the fake profile\'s full name, headline, photo, and work history', 'Note the profile URL (linkedin.com/in/...)', "Check if they've connected with your real network"] },
      { id: 2, title: 'Report the fake profile to LinkedIn', description: 'LinkedIn takes professional impersonation seriously.', estimated_minutes: 5,
        officialLink: 'https://www.linkedin.com/help/linkedin/answer/56347', officialLinkLabel: 'LinkedIn: Report Impersonation',
        instructions: ['Visit the fake profile', 'Click "More" → Report/Block → Report this profile', 'Select "Pretending to be someone" → "Me"', 'Submit with supporting information'] },
      { id: 3, title: 'Alert your professional network', description: "Warn your connections before they're scammed.", estimated_minutes: 10,
        instructions: ['Post an update from your real profile warning about the fake', 'Directly message key contacts who might be targeted', 'Tell them your real profile URL and how to verify it\'s you'] },
    ],
  },

  // ── SNAPCHAT ─────────────────────────────────────────────
  snapchat_account_hacked: {
    platform: 'snapchat', incident_type: 'account_hacked',
    title: 'Snapchat Account Compromised',
    description: 'Your Snapchat account has been accessed by an unauthorised party.',
    steps: [
      { id: 1, title: 'Change your Snapchat password immediately', description: 'Do this before the hacker changes it.', estimated_minutes: 5,
        officialLink: 'https://accounts.snapchat.com/accounts/password_reset', officialLinkLabel: 'Snapchat Password Reset',
        instructions: ['Go to accounts.snapchat.com/accounts/password_reset', 'Enter the email linked to your Snapchat account', 'Follow the reset link and set a new strong password'] },
      { id: 2, title: 'Enable Two-Factor Authentication', description: 'Prevent the hacker from getting back in.', estimated_minutes: 10,
        officialLink: 'https://support.snapchat.com/en-US/a/two-factor-auth', officialLinkLabel: 'Snapchat 2FA Guide',
        instructions: ['Profile → ⚙️ Settings → Two-Factor Authentication', 'Choose "Authentication App" and scan the QR code', 'Save your recovery code somewhere safe'] },
      { id: 3, title: 'Check for and remove unfamiliar linked accounts', description: 'Review connected devices and third-party apps.', estimated_minutes: 5,
        instructions: ['Settings → Connected Apps — remove anything you don\'t recognise', 'Check your email for any account change notifications from Snapchat', 'If your username was changed, contact Snapchat support to restore it'] },
      { id: 4, title: 'Contact Snapchat support if locked out', description: "If the hacker changed your password, get Snapchat's help.", estimated_minutes: 10,
        officialLink: 'https://support.snapchat.com/en-US/i-need-help', officialLinkLabel: 'Snapchat Support',
        instructions: ['Visit Snapchat\'s support site', 'Select "Account & Security" → "I\'ve been hacked"', 'Provide your username and the email you registered with', 'Follow instructions from the Snapchat team'] },
    ],
  },
  snapchat_cant_login: {
    platform: 'snapchat', incident_type: 'cant_login',
    title: "Snapchat: Can't Log In",
    description: "You're locked out of Snapchat.",
    steps: [
      { id: 1, title: 'Reset your password', description: 'Snapchat sends a reset link to your registered email.', estimated_minutes: 5,
        officialLink: 'https://accounts.snapchat.com/accounts/password_reset', officialLinkLabel: 'Snapchat Password Reset',
        instructions: ['Go to the Snapchat login screen → "Forgot your password?"', 'Choose to reset via email or phone number', 'Follow the link sent and set a new password'] },
      { id: 2, title: 'Contact Snapchat support if reset fails', description: 'Open a support ticket with account details.', estimated_minutes: 10,
        officialLink: 'https://support.snapchat.com/en-US/i-need-help', officialLinkLabel: 'Snapchat Support',
        instructions: ['Visit Snapchat\'s Help Center', 'Select "My Account Login" issue', 'Provide your username, email, and registered phone number', 'Snapchat support will verify your identity and assist'] },
    ],
  },
  snapchat_posts_deleted: {
    platform: 'snapchat', incident_type: 'posts_deleted',
    title: 'Snapchat: Stories / Spotlight Removed',
    description: 'Snapchat has removed your content.',
    steps: [
      { id: 1, title: 'Check for a policy violation notice', description: 'Snapchat notifies you when it removes content.', estimated_minutes: 5,
        instructions: ['Check your Snapchat notifications and registered email', 'Note the Community Guidelines section cited', 'Screenshot the notice'] },
      { id: 2, title: 'Appeal via Snapchat support', description: 'Contact Snapchat if you believe the removal was a mistake.', estimated_minutes: 10,
        officialLink: 'https://support.snapchat.com/en-US/i-need-help', officialLinkLabel: 'Snapchat Support',
        instructions: ['Go to Snapchat Help → "Content was removed"', 'Describe the content and why it complied with guidelines', 'Provide context and submit your appeal'] },
    ],
  },
  snapchat_account_suspended: {
    platform: 'snapchat', incident_type: 'account_suspended',
    title: 'Snapchat Account Locked / Banned',
    description: 'Your Snapchat account has been locked or permanently banned.',
    steps: [
      { id: 1, title: "Determine if it's a temporary or permanent lock", description: 'Snapchat may lock accounts temporarily for suspicious activity.', estimated_minutes: 5,
        officialLink: 'https://support.snapchat.com/en-US/a/locked-account', officialLinkLabel: 'Snapchat Locked Account Help',
        instructions: ['Try to log in and note the message shown', 'Temporary locks resolve after 24 hours', 'Permanent bans require an appeal'] },
      { id: 2, title: 'Submit an appeal for a permanent ban', description: 'Request a manual review if you believe the ban was wrong.', estimated_minutes: 10,
        officialLink: 'https://support.snapchat.com/en-US/i-need-help', officialLinkLabel: 'Snapchat Appeal Form',
        instructions: ['Go to Snapchat support and select "My account has been locked"', 'Explain clearly why you believe the ban was a mistake', 'Provide your username and registered email', "Wait for Snapchat's response"] },
    ],
  },
  snapchat_impersonation: {
    platform: 'snapchat', incident_type: 'impersonation',
    title: 'Snapchat: Impersonation',
    description: 'Someone is pretending to be you on Snapchat.',
    steps: [
      { id: 1, title: 'Document the fake account', description: 'Gather evidence before reporting.', estimated_minutes: 10,
        instructions: ['Screenshot the fake account\'s username, Bitmoji, and any messages sent to your contacts', 'Note the exact Snapchat username'] },
      { id: 2, title: 'Report the account to Snapchat', description: "Use Snapchat's built-in report flow.", estimated_minutes: 5,
        officialLink: 'https://support.snapchat.com/en-US/a/report-abuse-in-app', officialLinkLabel: 'Snapchat: Report In-App',
        instructions: ['Open the fake account\'s profile in Snapchat', 'Tap the three-dot menu → Report', 'Select "They\'re pretending to be me"', 'Submit your report'] },
      { id: 3, title: 'Warn your contacts', description: 'Let your Snapchat contacts know about the fake account.', estimated_minutes: 10,
        instructions: ['Send a message to close contacts warning about the impersonator', 'Post a Story from your real account explaining the situation', 'Let them know your verified username'] },
    ],
  },

  // ── PINTEREST ─────────────────────────────────────────────
  pinterest_account_hacked: {
    platform: 'pinterest', incident_type: 'account_hacked',
    title: 'Pinterest Account Compromised',
    description: 'Your Pinterest account has been accessed without your permission.',
    steps: [
      { id: 1, title: 'Change your password immediately', description: 'Lock down the account before doing anything else.', estimated_minutes: 5,
        officialLink: 'https://help.pinterest.com/en/article/change-your-password', officialLinkLabel: 'Pinterest Password Help',
        instructions: ['Go to pinterest.com and log in on a trusted device', 'Profile → ⚙️ Settings → Account Settings → Change password', 'Use a unique strong password'] },
      { id: 2, title: 'Sign out of all devices', description: "Remove the hacker's active session.", estimated_minutes: 5,
        instructions: ['Settings → Security → Active Sessions', 'Click "End Session" on any device you don\'t recognise', 'End all sessions as a precaution'] },
      { id: 3, title: 'Enable two-factor authentication', description: 'Prevent repeat attacks.', estimated_minutes: 10,
        officialLink: 'https://help.pinterest.com/en/article/two-factor-authentication', officialLinkLabel: 'Pinterest 2FA Setup',
        instructions: ['Settings → Security → Two-factor authentication → Turn on', 'Download an authenticator app and scan the QR code', 'Save your recovery codes'] },
      { id: 4, title: 'Contact Pinterest if locked out', description: "If the hacker changed your credentials, get Pinterest support.", estimated_minutes: 10,
        officialLink: 'https://help.pinterest.com/en/contact', officialLinkLabel: 'Pinterest Support',
        instructions: ['Visit Pinterest Help → "I think my account was hacked"', 'Provide your username and email address', 'Follow the verification steps from Pinterest support'] },
    ],
  },
  pinterest_cant_login: {
    platform: 'pinterest', incident_type: 'cant_login',
    title: "Pinterest: Can't Log In",
    description: "You're locked out of your Pinterest account.",
    steps: [
      { id: 1, title: 'Reset your password', description: "Pinterest's standard forgotten password flow.", estimated_minutes: 5,
        officialLink: 'https://help.pinterest.com/en/article/reset-your-password', officialLinkLabel: 'Pinterest Password Reset',
        instructions: ['On pinterest.com, click "Log in" then "Forgot password?"', 'Enter your email address', 'Check your email for a reset link and follow it'] },
      { id: 2, title: 'Contact Pinterest support', description: "If the reset doesn't arrive or work.", estimated_minutes: 10,
        officialLink: 'https://help.pinterest.com/en/contact', officialLinkLabel: 'Pinterest Support',
        instructions: ['Visit Pinterest Help Center → Contact Us', "Select \"I'm having trouble logging in\"", 'Provide your username and registered email', "Wait for Pinterest's response"] },
    ],
  },
  pinterest_posts_deleted: {
    platform: 'pinterest', incident_type: 'posts_deleted',
    title: 'Pinterest: Pins / Boards Removed',
    description: 'Pinterest has removed your pins or boards.',
    steps: [
      { id: 1, title: 'Check for a content removal notification', description: 'Pinterest notifies you of removals via email.', estimated_minutes: 5,
        instructions: ['Check your registered email for a notice from Pinterest', 'Note the Community Guidelines section cited', 'Screenshot the notification'] },
      { id: 2, title: 'Appeal the removal', description: 'Contact Pinterest support to dispute the removal.', estimated_minutes: 10,
        officialLink: 'https://help.pinterest.com/en/contact', officialLinkLabel: 'Pinterest Support',
        instructions: ['Go to Pinterest Help → Contact Us', 'Select "My content was removed"', "Explain why your pin/board complied with Pinterest's guidelines", 'Submit with any supporting context'] },
    ],
  },
  pinterest_account_suspended: {
    platform: 'pinterest', incident_type: 'account_suspended',
    title: 'Pinterest Account Suspended',
    description: 'Your Pinterest account has been suspended or deactivated.',
    steps: [
      { id: 1, title: 'Review the suspension reason', description: 'Pinterest sends an email explaining the reason.', estimated_minutes: 5,
        officialLink: 'https://help.pinterest.com/en/article/your-account-was-suspended-or-deactivated', officialLinkLabel: 'Pinterest: Suspended Accounts',
        instructions: ['Check your registered email for a notice from Pinterest', 'Note the specific policy violation cited', 'Do not create a new account'] },
      { id: 2, title: 'Submit an appeal', description: 'Contact Pinterest to request a review.', estimated_minutes: 10,
        officialLink: 'https://help.pinterest.com/en/contact', officialLinkLabel: 'Pinterest Appeal',
        instructions: ['Go to Pinterest Help → Contact Us → "My account is suspended"', 'Explain clearly why the suspension was a mistake', 'Provide your account email and username', "Wait for Pinterest's response (typically 3–7 business days)"] },
    ],
  },
  pinterest_impersonation: {
    platform: 'pinterest', incident_type: 'impersonation',
    title: 'Pinterest: Impersonation',
    description: 'Someone is pretending to be you on Pinterest.',
    steps: [
      { id: 1, title: 'Document the fake account', description: 'Collect screenshots before reporting.', estimated_minutes: 10,
        instructions: ['Screenshot the fake account\'s profile, username, bio, and boards', 'Note the exact Pinterest username and profile URL'] },
      { id: 2, title: 'Report the fake account to Pinterest', description: 'Pinterest has an impersonation report flow.', estimated_minutes: 5,
        officialLink: 'https://help.pinterest.com/en/article/report-something-on-pinterest', officialLinkLabel: 'Pinterest: Report Content',
        instructions: ['Visit the fake account\'s profile', 'Click the flag/report icon on their profile', 'Select "Impersonating someone" → submit your report'] },
      { id: 3, title: 'Warn your Pinterest audience', description: 'Alert your followers.', estimated_minutes: 10,
        instructions: ['Create a pin or board post warning your followers about the fake account', 'Share your real Pinterest profile URL across your other platforms'] },
    ],
  },
}

function getPlaybook(platform: string, incident_type: string): Playbook {
  const key = `${platform}_${incident_type}`
  if (PLAYBOOKS[key]) return PLAYBOOKS[key]

  const platformLabel = PLATFORM_LABELS[platform] || platform
  const incidentLabel = INCIDENT_TYPES.find(i => i.id === incident_type)?.label || incident_type.replace(/_/g, ' ')

  return {
    platform,
    incident_type,
    title: `${platformLabel}: ${incidentLabel}`,
    description: `Step-by-step guide to resolve your ${incidentLabel.toLowerCase()} issue on ${platformLabel}.`,
    steps: [
      { id: 1, title: 'Secure your linked email account first', description: 'Your email is the master key — secure it before anything else.', estimated_minutes: 10,
        instructions: ['Change your email password on a trusted device', 'Enable 2FA on your email if not already active', 'Sign out of all other email sessions'] },
      { id: 2, title: `Go to ${platformLabel}'s official Help Center`, description: 'Find the account recovery page relevant to your issue.', estimated_minutes: 15,
        instructions: [`Search "${platformLabel} ${incidentLabel.toLowerCase()} help" in your browser`, 'Navigate to the official help page (verify the domain is official)', 'Follow the guided recovery steps provided'] },
      { id: 3, title: 'Change your password and enable 2FA', description: 'Once you have access, harden your account.', estimated_minutes: 10,
        instructions: ['Change your password to something unique and strong (20+ characters)', 'Enable two-factor authentication using an authenticator app', 'Save your backup codes to your AEFORYN vault'] },
      { id: 4, title: 'Document and report the incident', description: 'Keep a record for future reference.', estimated_minutes: 10,
        instructions: ['Screenshot everything relevant to the incident', 'Note dates, times, and any communications with the platform', 'Upload documentation to your AEFORYN vault'] },
    ],
  }
}

export default function Recovery() {
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [selectedIncident, setSelectedIncident] = useState('')
  const [activeSession, setActiveSession] = useState<{ session: RecoverySession; playbook: Playbook } | null>(null)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [completed, setCompleted] = useState(false)
  const [incidentReport, setIncidentReport] = useState<Record<string, unknown> | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const isPro = user?.plan_tier === 'pro' || user?.plan_tier === 'enterprise' || user?.plan_tier === 'agency'

  const { data: sessions = [] } = useQuery({
    queryKey: ['recovery-sessions'],
    queryFn: async () => {
      const { data } = await api.get<RecoverySession[]>('/api/recovery/sessions')
      return data
    },
    placeholderData: [],
  })

  const startMutation = useMutation({
    mutationFn: async ({ platform, incident_type }: { platform: string; incident_type: string }) => {
      const { data } = await api.post('/api/recovery/sessions', { platform, incident_type })
      return data as { session: RecoverySession; playbook: Playbook }
    },
    onSuccess: (data) => {
      setActiveSession(data)
      setCompletedSteps([])
      setCompleted(false)
    },
    onError: () => {
      const playbook = getPlaybook(selectedPlatform, selectedIncident)
      const demoSession: RecoverySession = {
        id: 'demo',
        user_id: 'demo',
        platform: selectedPlatform,
        incident_type: selectedIncident,
        steps_completed: 0,
        total_steps: playbook.steps.length,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      }
      setActiveSession({ session: demoSession, playbook })
      setCompletedSteps([])
      setCompleted(false)
    },
  })

  const completeMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data } = await api.post(`/api/recovery/sessions/${sessionId}/complete`, {})
      return data as { incident_report: Record<string, unknown> }
    },
    onSuccess: (data) => {
      setCompleted(true)
      setIncidentReport(data.incident_report)
      queryClient.invalidateQueries({ queryKey: ['recovery-sessions'] })
    },
    onError: () => {
      setCompleted(true)
      setIncidentReport({
        platform: selectedPlatform,
        incident_type: selectedIncident,
        completed_at: new Date().toISOString(),
        steps_completed: completedSteps.length,
        total_steps: activeSession?.playbook.steps.length || 0,
        time_taken_minutes: Math.round((Date.now() - new Date(activeSession?.session.started_at || Date.now()).getTime()) / 60000),
      })
    },
  })

  const markStep = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      const newCompleted = [...completedSteps, stepId]
      setCompletedSteps(newCompleted)
      if (activeSession?.session.id && activeSession.session.id !== 'demo') {
        api.patch(`/api/recovery/sessions/${activeSession.session.id}/step`, { steps_completed: newCompleted.length }).catch(() => {})
      }
    }
  }

  const handleStart = () => {
    if (!selectedPlatform || !selectedIncident) { toast.error('Select a platform and incident type'); return }
    startMutation.mutate({ platform: selectedPlatform, incident_type: selectedIncident })
  }

  const handleComplete = () => {
    if (activeSession) completeMutation.mutate(activeSession.session.id)
  }

  const reset = () => {
    setActiveSession(null)
    setSelectedPlatform('')
    setSelectedIncident('')
    setCompletedSteps([])
    setCompleted(false)
    setIncidentReport(null)
  }

  if (completed && incidentReport) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto space-y-6">
        <div className="card-static text-center py-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)' }}>
            <CheckCircle className="w-10 h-10 text-safe" />
          </motion.div>
          <h2 className="heading-section text-safe mb-2">Recovery Complete</h2>
          <p className="text-text-secondary text-sm">You've worked through all the steps. Your account should now be secure.</p>
        </div>
        <div className="card-static space-y-4">
          <h3 className="heading-card">Incident Report</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Platform', value: PLATFORM_LABELS[(incidentReport.platform as string)] || String(incidentReport.platform || '') },
              { label: 'Incident', value: String(incidentReport.incident_type || '').replace(/_/g, ' ') },
              { label: 'Completed', value: new Date(String(incidentReport.completed_at || '')).toLocaleDateString() },
              { label: 'Time taken', value: `${incidentReport.time_taken_minutes || 0} minutes` },
              { label: 'Steps completed', value: `${incidentReport.steps_completed}/${incidentReport.total_steps}` },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 rounded-xl" style={{ background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.08)' }}>
                <p className="text-xs text-text-secondary mb-1 uppercase" style={{ fontSize: '10px', letterSpacing: '1.5px' }}>{label}</p>
                <p className="text-sm font-medium text-text-primary capitalize">{value}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => { navigator.clipboard.writeText(JSON.stringify(incidentReport, null, 2)); toast.success('Report copied') }}>
              <Copy className="w-4 h-4" /> Copy Report
            </Button>
            <Button variant="primary" className="flex-1" onClick={reset}>Start New Recovery</Button>
          </div>
        </div>
      </motion.div>
    )
  }

  if (activeSession) {
    const { playbook } = activeSession
    const currentStepIndex = completedSteps.length
    const FREE_STEP_LIMIT = 3
    const isStepLocked = !isPro && currentStepIndex >= FREE_STEP_LIMIT
    const currentStep = isStepLocked ? null : playbook.steps[currentStepIndex]
    const allDone = completedSteps.length >= playbook.steps.length
    const progressPct = Math.round((completedSteps.length / playbook.steps.length) * 100)

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card-static">
          <div className="flex items-center justify-between mb-3">
            <button onClick={reset} className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <span className="mono-text text-xs text-gold">Step {currentStepIndex + 1} of {playbook.steps.length}</span>
          </div>
          <h2 className="heading-card mb-4">{playbook.title}</h2>
          <ProgressBar value={progressPct} color="gold" size="lg" showLabel />
        </motion.div>

        {completedSteps.length > 0 && (
          <div className="space-y-2">
            {playbook.steps.filter((s) => completedSteps.includes(s.id)).map((step) => (
              <div key={step.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <CheckCircle className="w-4 h-4 text-safe flex-shrink-0" />
                <span className="text-sm text-safe">{step.title}</span>
              </div>
            ))}
          </div>
        )}

        {!allDone && isStepLocked && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-static text-center py-10">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}>
              <Lock className="w-6 h-6 text-gold" />
            </div>
            <h3 className="heading-card mb-2">Steps 4+ are Pro-only</h3>
            <p className="text-text-secondary text-sm mb-6">Free plan includes the first 3 recovery steps. Upgrade to access all steps and generate an incident report.</p>
            <Link to="/billing"><button className="btn-primary">Upgrade to Pro</button></Link>
          </motion.div>
        )}

        {!allDone && !isStepLocked && currentStep != null && (
          <motion.div key={(currentStep as PlaybookStep).id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card-static">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(201,168,76,0.15)', border: '2px solid rgba(201,168,76,0.4)' }}>
                <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#C9A84C' }}>{currentStep.id}</span>
              </div>
              <div>
                <h3 className="heading-card">{currentStep.title}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-text-secondary" />
                  <span className="text-xs text-text-secondary">~{currentStep.estimated_minutes} minutes</span>
                </div>
              </div>
            </div>

            <p className="text-text-secondary text-sm mb-5 leading-relaxed">{currentStep.description}</p>

            <ol className="space-y-3 mb-5">
              {currentStep.instructions.map((instruction, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(45,212,191,0.1)', color: '#2DD4BF', border: '1px solid rgba(45,212,191,0.2)', fontSize: '11px' }}>
                    {i + 1}
                  </span>
                  <p className="text-sm text-text-primary leading-relaxed">{instruction}</p>
                </li>
              ))}
            </ol>

            {currentStep.officialLink && (
              <a href={currentStep.officialLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs mb-5 transition-colors hover:underline" style={{ color: '#2DD4BF' }}>
                <ChevronRight className="w-3.5 h-3.5" />
                {currentStep.officialLinkLabel || 'Official recovery page'} ↗
              </a>
            )}

            <div className="flex flex-col gap-3">
              <Button variant="primary" className="w-full" onClick={() => markStep(currentStep.id)}>
                <CheckCircle className="w-4 h-4" /> Mark Step Complete
              </Button>
              <Link to="/ai" className="flex items-center justify-center gap-2 text-sm text-teal hover:text-teal-mid transition-colors py-2">
                <Bot className="w-4 h-4" /> I need help with this step
              </Link>
            </div>
          </motion.div>
        )}

        {allDone && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-static text-center py-8">
            <CheckCircle className="w-12 h-12 text-safe mx-auto mb-4" />
            <h3 className="heading-card text-safe mb-2">All steps completed!</h3>
            <p className="text-text-secondary text-sm mb-6">Generate your incident report to document what happened.</p>
            <Button variant="primary" className="w-full" onClick={handleComplete} loading={completeMutation.isPending}>
              Generate Incident Report
            </Button>
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-4" style={{ letterSpacing: '1.5px' }}>
          Which platform are you having issues with?
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {PLATFORMS.map((p) => (
            <button key={p.id} onClick={() => { setSelectedPlatform(p.id); setSelectedIncident('') }}
              className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-left font-semibold transition-all duration-150"
              style={{
                fontFamily: 'Space Grotesk, sans-serif', fontSize: '13px',
                background: selectedPlatform === p.id ? 'rgba(201,168,76,0.1)' : 'rgba(7,20,38,0.7)',
                border: `1px solid ${selectedPlatform === p.id ? 'rgba(201,168,76,0.5)' : 'rgba(245,158,11,0.1)'}`,
                color: selectedPlatform === p.id ? '#C9A84C' : '#F0FDF4',
                boxShadow: selectedPlatform === p.id ? '0 0 12px rgba(245,158,11,0.15)' : 'none',
              }}>
              <PlatformIcon platform={p.id} size={16} className="flex-shrink-0" />
              <span className="truncate">{p.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedPlatform && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-4" style={{ letterSpacing: '1.5px' }}>
              What happened?
            </p>
            <div className="space-y-2">
              {INCIDENT_TYPES.map((incident) => (
                <button key={incident.id} onClick={() => setSelectedIncident(incident.id)}
                  className="w-full flex items-center justify-between p-4 rounded-xl text-left transition-all duration-150"
                  style={{
                    background: selectedIncident === incident.id ? 'rgba(201,168,76,0.08)' : '#0A2422',
                    border: `1px solid ${selectedIncident === incident.id ? 'rgba(201,168,76,0.4)' : 'rgba(45,212,191,0.08)'}`,
                  }}>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{incident.label}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{incident.description}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-colors ${selectedIncident === incident.id ? 'text-gold' : 'text-text-secondary'}`} />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPlatform && selectedIncident && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {!isPro && (
              <div className="flex items-center gap-3 p-4 rounded-xl mb-4"
                style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}>
                <Lock className="w-5 h-5 text-gold flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gold">First 3 steps free — full playbook requires Pro</p>
                  <p className="text-xs text-text-secondary">Upgrade to access all steps and generate incident reports.</p>
                </div>
                <Link to="/billing" className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap">Upgrade</Link>
              </div>
            )}
            <Button variant="primary" className="w-full" onClick={handleStart} loading={startMutation.isPending}>
              <LifeBuoy className="w-5 h-5" />
              Start Recovery for {PLATFORM_LABELS[selectedPlatform] || selectedPlatform}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {sessions.length > 0 && (
        <div>
          <button onClick={() => setHistoryOpen(!historyOpen)}
            className="w-full flex items-center justify-between px-5 py-4 rounded-xl"
            style={{ background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.1)' }}>
            <span className="text-sm font-medium text-text-primary">Recovery History ({sessions.length})</span>
          </button>
          {historyOpen && (
            <div className="mt-2 space-y-2">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background: '#0A2422', border: '1px solid rgba(45,212,191,0.06)' }}>
                  <div>
                    <p className="text-sm font-medium text-text-primary capitalize">
                      {PLATFORM_LABELS[session.platform] || session.platform} — {session.incident_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">{session.steps_completed}/{session.total_steps} steps · {session.status}</p>
                  </div>
                  <span className={`badge ${session.status === 'completed' ? 'badge-safe' : 'badge-gold'}`}>{session.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
