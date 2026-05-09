import { Link } from 'react-router-dom'
import { AeforynLogo } from '@/components/ui/AeforynLogo'
import { ArrowLeft } from 'lucide-react'

export default function Terms() {
  return (
    <div className="min-h-screen" style={{ background: '#050D0A' }}>
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
            Terms of Service
          </h1>
          <p className="text-text-secondary mt-4 text-lg">Effective date: 1 January 2025 · Last updated: 1 May 2025</p>
        </div>

        <div className="space-y-10" style={{ fontFamily: 'Inter, sans-serif', color: '#86EFAC', lineHeight: 1.8 }}>

          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '24px', color: '#F0FDF4', marginBottom: '12px' }}>1. Agreement to terms</h2>
            <p>By creating an AEFORYN account or accessing the AEFORYN platform at app.aeforyn.com, you agree to be bound by these Terms of Service and our Privacy Policy. These terms form a legally binding agreement between you and Co-Plot (Pty) Ltd, trading as AEFORYN ("we", "us", "our").</p>
            <p className="mt-3">If you do not agree to these terms, do not use AEFORYN.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '24px', color: '#F0FDF4', marginBottom: '12px' }}>2. The AEFORYN service</h2>
            <p>AEFORYN is a cybersecurity platform designed for creators, freelancers, and remote workers. We provide:</p>
            <ul className="mt-3 space-y-2" style={{ paddingLeft: '20px' }}>
              {[
                'Platform monitoring and threat detection for connected social media accounts',
                'Encrypted content vault (Cloudflare R2 storage)',
                'AI-powered phishing and scam message analysis',
                'Account recovery playbooks',
                'AI security assistant',
                'Breach alerts and security notifications',
              ].map((s) => <li key={s} style={{ listStyleType: 'disc' }}>{s}</li>)}
            </ul>
            <p className="mt-4">AEFORYN is a security assistance tool. We do not guarantee prevention of all security incidents. No cybersecurity product can offer 100% protection.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '24px', color: '#F0FDF4', marginBottom: '12px' }}>3. Account registration</h2>
            <p>To use AEFORYN, you must:</p>
            <ul className="mt-3 space-y-2" style={{ paddingLeft: '20px' }}>
              <li style={{ listStyleType: 'disc' }}>Be at least 18 years old, or 13 years old with parental consent</li>
              <li style={{ listStyleType: 'disc' }}>Provide a valid email address</li>
              <li style={{ listStyleType: 'disc' }}>Keep your password secure and not share your account</li>
              <li style={{ listStyleType: 'disc' }}>Notify us immediately if you suspect unauthorised access to your account</li>
              <li style={{ listStyleType: 'disc' }}>Provide accurate information and keep your account details current</li>
            </ul>
            <p className="mt-4">You are responsible for all activity that occurs under your account.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '24px', color: '#F0FDF4', marginBottom: '12px' }}>4. Subscriptions and payment</h2>
            <p>AEFORYN offers Free, Standard ($29/month), Pro ($49/month), and Enterprise (custom) plans. Prices are in USD.</p>
            <ul className="mt-3 space-y-2" style={{ paddingLeft: '20px' }}>
              <li style={{ listStyleType: 'disc' }}>Paid subscriptions are billed monthly or annually in advance</li>
              <li style={{ listStyleType: 'disc' }}>Annual plans are billed as a single payment for 12 months of service</li>
              <li style={{ listStyleType: 'disc' }}>All payments are processed by Stripe and subject to their terms</li>
              <li style={{ listStyleType: 'disc' }}>We do not offer refunds for partial months on monthly plans</li>
              <li style={{ listStyleType: 'disc' }}>Annual plans may receive a pro-rata refund within 14 days of payment if you cancel</li>
              <li style={{ listStyleType: 'disc' }}>We reserve the right to change pricing with 30 days notice to existing subscribers</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '24px', color: '#F0FDF4', marginBottom: '12px' }}>5. Cancellation</h2>
            <p>You may cancel your subscription at any time via Settings → Billing or by contacting support@aeforyn.com. Upon cancellation:</p>
            <ul className="mt-3 space-y-2" style={{ paddingLeft: '20px' }}>
              <li style={{ listStyleType: 'disc' }}>Your plan will remain active until the end of the current billing period</li>
              <li style={{ listStyleType: 'disc' }}>Your account will revert to the Free plan after the period ends</li>
              <li style={{ listStyleType: 'disc' }}>Vault files above the Free plan storage limit will be inaccessible but not deleted for 30 days</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '24px', color: '#F0FDF4', marginBottom: '12px' }}>6. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul className="mt-3 space-y-2" style={{ paddingLeft: '20px' }}>
              {[
                'Use AEFORYN for any illegal purpose or in violation of any applicable law',
                'Upload content to the vault that infringes third-party intellectual property rights',
                'Attempt to reverse engineer, decompile, or access AEFORYN\'s source code',
                'Attempt to access another user\'s account or data',
                'Use AEFORYN to send spam, phishing messages, or malicious content',
                'Overload or attack the AEFORYN infrastructure',
                'Resell or sublicense access to AEFORYN without an Enterprise or White Label agreement',
              ].map((s) => <li key={s} style={{ listStyleType: 'disc' }}>{s}</li>)}
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '24px', color: '#F0FDF4', marginBottom: '12px' }}>7. Your content</h2>
            <p>Files you upload to the AEFORYN vault and messages you submit for scanning remain your property. By uploading content, you grant AEFORYN a limited, non-exclusive licence to store and process that content solely to provide the service.</p>
            <p className="mt-3">We do not claim ownership of your content. We do not use your vault content or AI conversations to train AI models without your explicit consent.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '24px', color: '#F0FDF4', marginBottom: '12px' }}>8. Limitation of liability</h2>
            <p>To the maximum extent permitted by applicable law, AEFORYN and Co-Plot (Pty) Ltd shall not be liable for:</p>
            <ul className="mt-3 space-y-2" style={{ paddingLeft: '20px' }}>
              <li style={{ listStyleType: 'disc' }}>Any security incident that occurs despite using AEFORYN</li>
              <li style={{ listStyleType: 'disc' }}>Loss of revenue, data, or business resulting from account compromises</li>
              <li style={{ listStyleType: 'disc' }}>Indirect, consequential, or incidental damages</li>
              <li style={{ listStyleType: 'disc' }}>Inaccuracies in AI-generated security analysis</li>
            </ul>
            <p className="mt-4">Our maximum aggregate liability to you for any claim arising under these terms shall not exceed the amount you paid for AEFORYN in the 12 months preceding the claim.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '24px', color: '#F0FDF4', marginBottom: '12px' }}>9. Disclaimer of warranties</h2>
            <p>AEFORYN is provided "as is" and "as available" without warranties of any kind, express or implied. We do not warrant that the service will be uninterrupted, error-free, or that it will detect all security threats. Cybersecurity is inherently a probabilistic discipline — no tool can guarantee complete protection.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '24px', color: '#F0FDF4', marginBottom: '12px' }}>10. Intellectual property</h2>
            <p>All AEFORYN branding, software, design, content, and documentation are the property of Co-Plot (Pty) Ltd and are protected by intellectual property laws. The AEFORYN name, hexagon logo, and trade dress may not be used without our written permission.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '24px', color: '#F0FDF4', marginBottom: '12px' }}>11. Termination</h2>
            <p>We may suspend or terminate your account if you breach these terms, engage in fraudulent activity, or if required by law. We will provide notice where reasonably possible. You may terminate your account at any time via Settings → Privacy → Delete Account.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '24px', color: '#F0FDF4', marginBottom: '12px' }}>12. Governing law</h2>
            <p>These terms are governed by the laws of the Republic of South Africa. Any disputes shall be subject to the jurisdiction of the courts of South Africa. For EU/EEA users, nothing in these terms limits your rights under applicable EU consumer protection law.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '24px', color: '#F0FDF4', marginBottom: '12px' }}>13. Changes to terms</h2>
            <p>We may update these Terms from time to time. We will notify you by email at least 14 days before material changes take effect. Continued use of AEFORYN after the effective date constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '24px', color: '#F0FDF4', marginBottom: '12px' }}>14. Contact</h2>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.1)' }}>
              <p style={{ color: '#F0FDF4' }}>Co-Plot (Pty) Ltd, trading as AEFORYN</p>
              <p>General: <a href="mailto:hello@aeforyn.com" style={{ color: '#2DD4BF' }}>hello@aeforyn.com</a></p>
              <p>Legal: <a href="mailto:legal@aeforyn.com" style={{ color: '#2DD4BF' }}>legal@aeforyn.com</a></p>
              <p>Support: <a href="mailto:support@aeforyn.com" style={{ color: '#2DD4BF' }}>support@aeforyn.com</a></p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
