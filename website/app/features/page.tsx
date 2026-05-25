import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AnimatedSection, AnimatedCard } from "@/components/ui/AnimatedSection";

export const metadata: Metadata = {
  title: "Features — AEFORYN",
  description:
    "Explore all AEFORYN security features: real-time threat detection, phishing scanner, secure vault, impersonation detection, AI security assistant, and account recovery.",
  openGraph: {
    title: "Features — AEFORYN",
    description:
      "Enterprise-grade cybersecurity features built for creators and freelancers.",
    url: "https://aeforyn.com/features",
  },
};

const features = [
  {
    id: "threat-detection",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    ),
    title: "Threat Detection",
    subtitle: "Real-time account monitoring across every platform",
    description:
      "AEFORYN continuously monitors your connected platforms for signs of compromise, suspicious login attempts, unusual activity patterns, and known attack signatures. The moment something looks wrong, you're alerted — with a clear explanation of what's happening and what to do next.",
    details: [
      "24/7 automated monitoring across all connected accounts",
      "Unusual login detection (new device, location, or time)",
      "Breach database cross-referencing",
      "Behavioural anomaly detection",
      "Instant push, email, and SMS alerts",
      "Threat severity scoring (low, medium, high, critical)",
    ],
    tiers: ["Creator", "Pro", "Agency"],
    dark: true,
    color: "#3B82F6",
  },
  {
    id: "phishing-scanner",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    title: "Phishing Scanner",
    subtitle: "Stop phishing before you click",
    description:
      "Phishing is the #1 vector used to target creators and freelancers. AEFORYN's scanner analyses emails, messages, and links in real time — flagging suspicious senders, spoofed domains, fake brand deal emails, and malicious URLs before they can do damage.",
    details: [
      "URL safety analysis with live threat intelligence",
      "Email header and sender verification",
      "Domain spoofing detection",
      "Brand impersonation email identification",
      "Attachment risk scanning",
      "Safe browsing integration",
    ],
    tiers: ["Free (basic)", "Creator", "Pro", "Agency"],
    dark: false,
    color: "#14B8A6",
  },
  {
    id: "secure-vault",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        <circle cx="12" cy="16" r="1" fill="currentColor"/>
      </svg>
    ),
    title: "Secure Vault",
    subtitle: "AES-256 encrypted storage for your most sensitive data",
    description:
      "Store credentials, API keys, contracts, invoices, and sensitive documents in a zero-knowledge encrypted vault. Only you can decrypt your data — AEFORYN cannot access it even if compelled. Your vault is backed up securely and accessible from any device.",
    details: [
      "AES-256 end-to-end encryption",
      "Zero-knowledge architecture",
      "Secure credential storage",
      "API key and token manager",
      "Document storage (contracts, ID copies, etc.)",
      "Cross-device sync with secure key derivation",
    ],
    tiers: ["Creator (5GB)", "Pro (25GB)", "Agency (100GB)"],
    dark: true,
    color: "#F59E0B",
  },
  {
    id: "impersonation-detection",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
        <path d="M17 11l2 2 4-4"/>
      </svg>
    ),
    title: "Impersonation Detection",
    subtitle: "Monitor the web for fake versions of you",
    description:
      "As your following grows, so does the risk of impersonation. AEFORYN monitors social platforms, marketplaces, and the wider web for fake profiles using your name, content, images, or brand — alerting you immediately so you can take action before your audience is scammed.",
    details: [
      "Social media impersonation monitoring",
      "Name and handle similarity scanning",
      "Profile image reverse-search monitoring",
      "Brand and domain typosquatting detection",
      "Marketplace and freelance platform monitoring",
      "Takedown request guidance",
    ],
    tiers: ["Creator", "Pro", "Agency"],
    dark: false,
    color: "#8B5CF6",
  },
  {
    id: "ai-security-assistant",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
        <path d="M7 10h1M12 7v6M16 9l-2 2"/>
      </svg>
    ),
    title: "AI Security Assistant",
    subtitle: "Your personal cybersecurity advisor, 24/7",
    description:
      "Not everyone has a security expert on call — but with AEFORYN, you do. Our AI Security Assistant answers your questions in plain language, analyses potential threats, explains alerts, and gives you personalised recommendations based on your specific situation and platforms.",
    details: [
      "Plain-language threat explanations",
      "Personalised security recommendations",
      "Real-time alert interpretation",
      "Step-by-step remediation guidance",
      "Proactive security tips for your platforms",
      "Available 24/7 via dashboard and mobile",
    ],
    tiers: ["Creator (50 queries/mo)", "Pro (unlimited)", "Agency (unlimited)"],
    dark: true,
    color: "#EC4899",
  },
  {
    id: "account-recovery",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10"/>
        <polyline points="23 20 23 14 17 14"/>
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
      </svg>
    ),
    title: "Account Recovery",
    subtitle: "Guided recovery when the worst happens",
    description:
      "Getting locked out of your accounts can mean losing your income. AEFORYN's Account Recovery feature walks you through the exact steps needed to regain access to compromised accounts, contact platform support effectively, and lock out attackers permanently.",
    details: [
      "Platform-specific recovery checklists",
      "Evidence collection for support tickets",
      "Prioritised action plans",
      "Direct platform contact guidance",
      "Post-recovery security hardening",
      "Ongoing monitoring post-recovery",
    ],
    tiers: ["Creator", "Pro (priority)", "Agency (dedicated)"],
    dark: false,
    color: "#14B8A6",
  },
];

export default function FeaturesPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-[#071426] pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimatedSection>
              <span className="inline-block px-3 py-1 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-semibold uppercase tracking-wider mb-6">
                Platform Features
              </span>
              <h1
                className="text-5xl sm:text-6xl font-bold text-white mb-5"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Everything you need,
                <br />
                <span className="text-[#F59E0B]">nothing you don&apos;t</span>
              </h1>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Six powerful security tools working together to protect your
                accounts, income, and digital identity — built specifically for
                creators and freelancers.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Feature sections */}
        {features.map((feature, i) => (
          <section
            key={feature.id}
            id={feature.id}
            className={
              feature.dark ? "bg-[#0D1F35] py-20" : "bg-white py-20"
            }
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div
                className={`flex flex-col lg:flex-row items-center gap-12 ${
                  i % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Icon / visual */}
                <AnimatedCard className="flex-shrink-0" delay={0}>
                  <div
                    className={`w-24 h-24 rounded-3xl flex items-center justify-center`}
                    style={{
                      backgroundColor: `${feature.color}20`,
                      color: feature.color,
                    }}
                  >
                    {feature.icon}
                  </div>
                </AnimatedCard>

                {/* Content */}
                <div className="flex-1">
                  <AnimatedSection delay={0.1}>
                    <div
                      className="text-xs font-semibold uppercase tracking-wider mb-3"
                      style={{ color: feature.color }}
                    >
                      {feature.subtitle}
                    </div>
                    <h2
                      className={`text-3xl sm:text-4xl font-bold mb-4 ${
                        feature.dark ? "text-white" : "text-[#071426]"
                      }`}
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {feature.title}
                    </h2>
                    <p
                      className={`text-base leading-relaxed mb-8 ${
                        feature.dark ? "text-white/60" : "text-[#071426]/60"
                      }`}
                    >
                      {feature.description}
                    </p>

                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                      {feature.details.map((detail) => (
                        <li key={detail} className="flex items-start gap-2.5">
                          <svg
                            className="flex-shrink-0 mt-0.5"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              fill={feature.color}
                              opacity="0.15"
                            />
                            <path
                              d="M9 12l2 2 4-4"
                              stroke={feature.color}
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span
                            className={`text-sm ${
                              feature.dark ? "text-white/70" : "text-[#071426]/70"
                            }`}
                          >
                            {detail}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`text-xs font-medium ${
                          feature.dark ? "text-white/40" : "text-[#071426]/40"
                        }`}
                      >
                        Available on:
                      </span>
                      {feature.tiers.map((tier) => (
                        <span
                          key={tier}
                          className="text-xs px-2.5 py-1 rounded-full border"
                          style={{
                            borderColor: `${feature.color}40`,
                            color: feature.color,
                            backgroundColor: `${feature.color}10`,
                          }}
                        >
                          {tier}
                        </span>
                      ))}
                    </div>
                  </AnimatedSection>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* CTA */}
        <section className="bg-[#071426] py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimatedSection>
              <h2
                className="text-4xl font-bold text-white mb-5"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Ready to protect your income?
              </h2>
              <p className="text-white/60 mb-8">
                Get started with AEFORYN for free. Upgrade when you need more.
              </p>
              <a
                href="https://aeforyn-app.vercel.app/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#071426] font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200"
              >
                Get Started Free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </AnimatedSection>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
