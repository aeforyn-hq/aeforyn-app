import { Link } from 'react-router-dom'
import { AeforynLogo } from '@/components/ui/AeforynLogo'
import { ArrowLeft } from 'lucide-react'

export default function Privacy() {
  return (
    <div className="min-h-screen" style={{ background: '#071E1C' }}>
      {/* Header */}
      <header className="border-b px-8 py-5 flex items-center justify-between" style={{ borderColor: 'rgba(45,212,191,0.08)' }}>
        <AeforynLogo size="sm" showWordmark />
        <Link to="/dashboard" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to app
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-8 py-16">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold mb-3" style={{ letterSpacing: '2px' }}>Legal</p>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '48px', letterSpacing: '-1px', color: '#F0FDF4', lineHeight: 1.1 }}>
            Privacy Policy
          </h1>
          <p className="text-text-secondary mt-4 text-lg">Effective date: 1 January 2025 · Last updated: 1 May 2025</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-10" style={{ fontFamily: 'Inter, sans-serif', color: '#86EFAC', lineHeight: 1.8 }}>

          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '24px', color: '#F0FDF4', marginBottom: '12px' }}>1. Who we are</h2>
            <p>AEFORYN is operated by Co-Plot (Pty) Ltd, a company registered in South Africa. References to "AEFORYN", "we", "us", or "our" in this policy refer to Co-Plot (Pty) Ltd trading as AEFORYN.</p>
            <p className="mt-3">This Privacy Policy governs all personal information collected through the AEFORYN platform at app.aeforyn.com and related services.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '24px', color: '#F0FDF4', marginBottom: '12px' }}>2. Information we collect</h2>
            <p>We collect the following categories of personal information:</p>
            <ul className="mt-3 space-y-2 list-none">
              {[
                ['Account information', 'Email address, password (hashed), creator handle'],
                ['Platform data', 'Social media handles and platform names you connect to AEFORYN'],
                ['Vault content', 'Files you upload to your encrypted vault (stored encrypted at rest)'],
                ['Threat & scan data', 'Messages you submit for phishing analysis, threat logs'],
                ['AI conversations', 'Messages exchanged with the AEFORYN AI assistant'],
                ['Payment data', 'Processed via Stripe — we never see your full card number'],
                ['Usage data', 'Pages visited, features used, timestamps (for security and product improvement)'],
              ].map(([label, desc]) => (
                <li key={label} className="flex gap-3">
                  <span className="text-gold font-semibold flex-shrink-0">{label}:</span>
                  <span>{desc}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '24px', color: '#F0FDF4', marginBottom: '12px' }}>3. How we use your information</h2>
            <p>We use your information to:</p>
            <ul className="mt-3 space-y-2" style={{ paddingLeft: '20px' }}>
              {[
                'Provide and improve the AEFORYN security platform',
                'Detect threats and security anomalies on your connected platforms',
                'Analyse messages you submit via the phishing scanner',
                'Generate AI-powered security responses in the AI assistant',
                'Send transactional emails (breach alerts, login notifications)',
                'Process payments via Stripe',
                'Comply with legal obligations under POPIA and GDPR',
              ].map((item) => (
                <li key={item} style={{ listStyleType: 'disc' }}>{item}</li>
              ))}
            </ul>
            <p className="mt-4 font-medium" style={{ color: '#F0FDF4' }}>We do not sell your personal information to any third party. We do not use your content for advertising.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '24px', color: '#F0FDF4', marginBottom: '12px' }}>4. Legal basis for processing (GDPR)</h2>
            <p>For users in the European Union and EEA, we process your personal data under the following legal bases:</p>
            <ul className="mt-3 space-y-2" style={{ paddingLeft: '20px' }}>
              <li style={{ listStyleType: 'disc' }}><strong style={{ color: '#F0FDF4' }}>Contract performance</strong> — to provide the AEFORYN service you subscribed to</li>
              <li style={{ listStyleType: 'disc' }}><strong style={{ color: '#F0FDF4' }}>Legitimate interests</strong> — fraud prevention, security, product improvement</li>
              <li style={{ listStyleType: 'disc' }}><strong style={{ color: '#F0FDF4' }}>Consent</strong> — for optional marketing communications</li>
              <li style={{ listStyleType: 'disc' }}><strong style={{ color: '#F0FDF4' }}>Legal obligation</strong> — where required by applicable law</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '24px', color: '#F0FDF4', marginBottom: '12px' }}>5. POPIA compliance (South Africa)</h2>
            <p>As a South African company, we comply with the Protection of Personal Information Act (POPIA). We are registered as a responsible party under POPIA. Your personal information is collected and processed lawfully, for a specific purpose, and we take reasonable security measures to protect it.</p>
            <p className="mt-3">You have the right to access, correct, and delete your personal information. Contact us at privacy@aeforyn.com to exercise these rights.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '24px', color: '#F0FDF4', marginBottom: '12px' }}>6. Data storage and security</h2>
            <p>Your data is stored using the following infrastructure:</p>
            <ul className="mt-3 space-y-2" style={{ paddingLeft: '20px' }}>
              <li style={{ listStyleType: 'disc' }}>Database: Supabase (PostgreSQL) with row-level security enabled on all tables</li>
              <li style={{ listStyleType: 'disc' }}>Vault files: Cloudflare R2 object storage, encrypted at rest with AES-256</li>
              <li style={{ listStyleType: 'disc' }}>Authentication: Supabase Auth with JWT tokens</li>
              <li style={{ listStyleType: 'disc' }}>Payments: Stripe (PCI-DSS compliant)</li>
            </ul>
            <p className="mt-4">All data is transmitted over TLS/HTTPS. We do not store passwords in plaintext — they are hashed using bcrypt via Supabase Auth.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '24px', color: '#F0FDF4', marginBottom: '12px' }}>7. Third-party services</h2>
            <p>We use the following third-party services to operate AEFORYN:</p>
            <ul className="mt-3 space-y-2" style={{ paddingLeft: '20px' }}>
              {[
                'Supabase — database and authentication',
                'Cloudflare R2 — encrypted file storage',
                'Stripe — payment processing',
                'Anthropic Claude API — AI phishing analysis and assistant',
                'Resend — transactional email delivery',
              ].map((s) => <li key={s} style={{ listStyleType: 'disc' }}>{s}</li>)}
            </ul>
            <p className="mt-4">Each service operates under its own privacy policy and data processing agreement. We have data processing agreements in place with all providers who process personal data on our behalf.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '24px', color: '#F0FDF4', marginBottom: '12px' }}>8. Data retention</h2>
            <p>We retain your personal information for as long as your account is active. When you delete your account:</p>
            <ul className="mt-3 space-y-2" style={{ paddingLeft: '20px' }}>
              <li style={{ listStyleType: 'disc' }}>All database records are immediately and permanently deleted</li>
              <li style={{ listStyleType: 'disc' }}>All vault files are deleted from Cloudflare R2</li>
              <li style={{ listStyleType: 'disc' }}>Your authentication record is deleted from Supabase</li>
              <li style={{ listStyleType: 'disc' }}>Stripe may retain payment records for their own legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '24px', color: '#F0FDF4', marginBottom: '12px' }}>9. Your rights</h2>
            <p>You have the following rights regarding your personal information:</p>
            <ul className="mt-3 space-y-2" style={{ paddingLeft: '20px' }}>
              {[
                'Right of access — request a copy of all data we hold about you',
                'Right to rectification — correct inaccurate personal information',
                'Right to erasure — delete your account and all associated data',
                'Right to data portability — export your data in JSON format (via Settings → Privacy)',
                'Right to object — object to processing based on legitimate interests',
                'Right to restriction — request we limit how we process your data',
              ].map((r) => <li key={r} style={{ listStyleType: 'disc' }}>{r}</li>)}
            </ul>
            <p className="mt-4">To exercise any of these rights, go to Settings → Privacy in your AEFORYN account, or contact us at privacy@aeforyn.com. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '24px', color: '#F0FDF4', marginBottom: '12px' }}>10. Cookies</h2>
            <p>AEFORYN uses essential cookies only — no tracking, advertising, or analytics cookies. We use:</p>
            <ul className="mt-3 space-y-2" style={{ paddingLeft: '20px' }}>
              <li style={{ listStyleType: 'disc' }}>Authentication cookies — to keep you logged in</li>
              <li style={{ listStyleType: 'disc' }}>Session cookies — to maintain your preferences during a session</li>
            </ul>
            <p className="mt-4">We do not use Google Analytics, Facebook Pixel, or any third-party tracking scripts.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '24px', color: '#F0FDF4', marginBottom: '12px' }}>11. Changes to this policy</h2>
            <p>We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page and notify you by email if the changes are material.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '24px', color: '#F0FDF4', marginBottom: '12px' }}>12. Contact</h2>
            <p>For privacy-related enquiries, contact our Privacy Officer:</p>
            <div className="mt-3 p-4 rounded-xl" style={{ background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.1)' }}>
              <p style={{ color: '#F0FDF4' }}>Co-Plot (Pty) Ltd, trading as AEFORYN</p>
              <p>Email: <a href="mailto:privacy@aeforyn.com" style={{ color: '#2DD4BF' }}>privacy@aeforyn.com</a></p>
              <p className="mt-2">South Africa Information Regulator: <a href="https://inforegulator.org.za" style={{ color: '#2DD4BF' }}>inforegulator.org.za</a></p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
