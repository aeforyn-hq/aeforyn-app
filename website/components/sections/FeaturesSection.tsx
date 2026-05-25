"use client";

import { AnimatedSection, AnimatedCard } from "../ui/AnimatedSection";

const features = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    ),
    title: "Threat Detection",
    description:
      "Real-time monitoring of your accounts and platforms. Get instant alerts the moment suspicious activity is detected — before damage is done.",
    color: "#3B82F6",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
        <circle cx="20" cy="20" r="3" fill="#EF4444" stroke="none"/>
        <path d="M20 18v2M20 22v.01" stroke="white" strokeWidth="1.5"/>
      </svg>
    ),
    title: "Phishing Scanner",
    description:
      "Automatically scan incoming emails, links, and messages for phishing indicators. AEFORYN flags threats before you click — protecting your credentials and income.",
    color: "#14B8A6",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        <circle cx="12" cy="16" r="1" fill="currentColor"/>
      </svg>
    ),
    title: "Secure Vault",
    description:
      "Store credentials, API keys, contracts, and sensitive documents in an encrypted vault. AES-256 encryption means your data stays yours — always.",
    color: "#F59E0B",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
        <path d="M17 11l2 2 4-4" />
      </svg>
    ),
    title: "Impersonation Detection",
    description:
      "We monitor the web for fake profiles, cloned accounts, and brand impersonators using your name or content. Get alerted and take action fast.",
    color: "#8B5CF6",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
        <path d="M7 10h1M12 7v6M16 9l-2 2"/>
      </svg>
    ),
    title: "AI Security Assistant",
    description:
      "Your personal cybersecurity advisor, available 24/7. Ask questions, get threat analysis, and receive personalised recommendations in plain language.",
    color: "#EC4899",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10"/>
        <polyline points="23 20 23 14 17 14"/>
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
      </svg>
    ),
    title: "Account Recovery",
    description:
      "If your account is compromised, AEFORYN's guided recovery process walks you through every step to regain access and lock out attackers quickly.",
    color: "#14B8A6",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-semibold uppercase tracking-wider mb-4">
            Platform Features
          </span>
          <h2
            className="text-4xl sm:text-5xl font-bold text-[#071426] mb-5"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Everything you need to stay secure
          </h2>
          <p className="text-[#071426]/60 text-lg max-w-2xl mx-auto">
            AEFORYN brings enterprise-grade security tools to individual
            creators and freelancers. No IT department needed.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <AnimatedCard
              key={feature.title}
              delay={i * 0.1}
              className="bg-[#071426]/5 hover:bg-[#071426]/8 border border-[#071426]/10 hover:border-[#071426]/20 rounded-2xl p-6 transition-all duration-300"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{
                  backgroundColor: `${feature.color}15`,
                  color: feature.color,
                }}
              >
                {feature.icon}
              </div>
              <h3
                className="text-[#071426] text-xl font-bold mb-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {feature.title}
              </h3>
              <p className="text-[#071426]/60 text-sm leading-relaxed">
                {feature.description}
              </p>
            </AnimatedCard>
          ))}
        </div>

        <AnimatedSection className="text-center mt-12">
          <a
            href="/features"
            className="inline-flex items-center gap-2 text-[#3B82F6] font-semibold hover:gap-3 transition-all duration-200"
          >
            View all features in detail
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </AnimatedSection>
      </div>
    </section>
  );
}
