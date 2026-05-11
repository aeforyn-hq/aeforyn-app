import Anthropic from '@anthropic-ai/sdk'
import { env } from '../config/env.js'

const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })

const PLATFORM_REPORT_URLS: Record<string, string> = {
  instagram: 'https://help.instagram.com/contact/636276399721841',
  tiktok: 'https://support.tiktok.com/en/safety-hc/report-a-problem/report-an-impersonation-account',
  youtube: 'https://support.google.com/youtube/answer/2801947',
  x: 'https://help.twitter.com/en/safety-and-security/report-twitter-impersonation',
  twitter: 'https://help.twitter.com/en/safety-and-security/report-twitter-impersonation',
  facebook: 'https://www.facebook.com/help/174210519303259',
  linkedin: 'https://www.linkedin.com/help/linkedin/answer/a1336664',
  snapchat: 'https://support.snapchat.com/en-US/i-need-help?start=5135615',
  pinterest: 'https://help.pinterest.com/en/article/report-something-on-pinterest',
  reddit: 'https://www.reddit.com/report',
}

export async function analyseImpersonationMatch(
  fakeHandle: string,
  platform: string,
  userHandle: string,
  matchType: string
): Promise<{ riskLevel: 'low' | 'medium' | 'high' | 'confirmed'; explanation: string }> {
  const prompt = `You are a cybersecurity analyst specialising in social media impersonation for content creators.

Analyse this potential impersonation case:
- Victim's real handle: ${userHandle} on ${platform}
- Suspected fake account handle: ${fakeHandle}
- Match type detected: ${matchType}

Rate the risk level as one of: low, medium, high, confirmed
Then provide a 2-3 sentence plain-English explanation of why this is concerning and what it means for the creator.

Respond in JSON:
{"riskLevel": "low|medium|high|confirmed", "explanation": "..."}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  })

  try {
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim())
    return {
      riskLevel: parsed.riskLevel || 'medium',
      explanation: parsed.explanation || 'Potential impersonation detected.',
    }
  } catch {
    return { riskLevel: 'medium', explanation: 'A potential impersonation was detected. Manual review recommended.' }
  }
}

export async function generateTakedownGuide(
  platform: string,
  fakeHandle: string,
  matchType: string
): Promise<{ steps: Array<{ step: number; instruction: string; officialUrl?: string }>; reportUrl: string }> {
  const reportUrl = PLATFORM_REPORT_URLS[platform.toLowerCase()] || ''

  const prompt = `You are a cybersecurity expert helping a content creator remove a fake account impersonating them.

Platform: ${platform}
Fake account handle: ${fakeHandle}
Match type: ${matchType}
Official report URL: ${reportUrl}

Write a numbered step-by-step takedown guide. Each step should be a single clear action. Include the official report URL in the relevant step. Maximum 7 steps.

Respond in JSON:
{"steps": [{"step": 1, "instruction": "...", "officialUrl": "optional url for this step"}, ...]}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  })

  try {
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim())
    return { steps: parsed.steps || [], reportUrl }
  } catch {
    return {
      steps: [
        { step: 1, instruction: `Go to the ${platform} report page and select "Impersonation".`, officialUrl: reportUrl },
        { step: 2, instruction: `Search for ${fakeHandle} and open their profile.` },
        { step: 3, instruction: 'Tap the three-dot menu and select "Report Account" or "Report Profile".' },
        { step: 4, instruction: 'Select "They\'re pretending to be me or someone else".' },
        { step: 5, instruction: 'Submit the report. Take a screenshot for your records.' },
        { step: 6, instruction: 'Alert your audience with a post noting the fake account exists.' },
      ],
      reportUrl,
    }
  }
}

export async function checkPhishingText(
  text: string
): Promise<{ verdict: 'Scam' | 'Likely Scam' | 'Legitimate' | 'Uncertain'; explanation: string; recommendedAction: string }> {
  const prompt = `You are a cybersecurity analyst protecting content creators from phishing, scams, and fraudulent brand deals.

Analyse the following message or email text and determine if it is a scam, likely scam, legitimate, or uncertain.

Text to analyse:
"""
${text.slice(0, 3000)}
"""

Consider: urgency language, suspicious domains, too-good-to-be-true offers, requests for personal info or upfront payment, grammatical errors, mismatched branding.

Respond in JSON:
{
  "verdict": "Scam|Likely Scam|Legitimate|Uncertain",
  "explanation": "2-3 sentences explaining the key signals",
  "recommendedAction": "One clear sentence on what to do"
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  })

  try {
    const text_resp = response.content[0].type === 'text' ? response.content[0].text : ''
    const parsed = JSON.parse(text_resp.replace(/```json\n?|\n?```/g, '').trim())
    return {
      verdict: parsed.verdict || 'Uncertain',
      explanation: parsed.explanation || 'Unable to analyse.',
      recommendedAction: parsed.recommendedAction || 'Do not respond until verified.',
    }
  } catch {
    return {
      verdict: 'Uncertain',
      explanation: 'Analysis could not be completed. Treat with caution.',
      recommendedAction: 'Do not click any links or provide personal information until you verify the sender.',
    }
  }
}

export async function generateMonthlyReport(
  userId: string,
  summary: { totalNew: number; totalResolved: number; totalActive: number; topPlatforms: string[] }
): Promise<string> {
  const prompt = `You are AEFORYN, a cybersecurity platform for content creators. Write a monthly security report card for a creator.

Data:
- New threats detected this month: ${summary.totalNew}
- Threats resolved: ${summary.totalResolved}
- Currently active threats: ${summary.totalActive}
- Most targeted platforms: ${summary.topPlatforms.join(', ')}

Write a concise, plain-English security report card (3-4 paragraphs). Be honest but not alarmist. End with 2 actionable recommendations for next month. Do not use bullet points — write in flowing prose.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  })

  return response.content[0].type === 'text'
    ? response.content[0].text
    : 'Monthly report generation failed. Please try again.'
}
