"use client";

import { AnimatedSection, AnimatedCard } from "../ui/AnimatedSection";

const threats = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: "Account Takeover",
    description:
      "Attackers hijack your social media, freelance platforms, and banking accounts — cutting off your income overnight. Creators lose thousands in seconds.",
    stat: "63% of creators",
    statSub: "have experienced unauthorised account access",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    title: "Phishing Attacks",
    description:
      "Fake brand deals, fraudulent client enquiries, and spoofed platform emails trick creators into handing over credentials or clicking malicious links.",
    stat: "1 in 3 freelancers",
    statSub: "fall victim to invoice or payment phishing",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    title: "Impersonation",
    description:
      "Fake profiles using your name, content, and brand scam your audience, destroy your reputation, and divert revenue streams you worked years to build.",
    stat: "R450M+",
    statSub: "lost to creator impersonation scams in 2024",
  },
];

export default function ProblemSection() {
  return (
    <section className="bg-[#0D1F35] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-semibold uppercase tracking-wider mb-4">
            The Threat Reality
          </span>
          <h2
            className="text-4xl sm:text-5xl font-bold text-white mb-5"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Creators are the new target
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            As your digital presence grows, so does your attack surface.
            Cybercriminals specifically target creators, freelancers, and remote
            workers — because you have valuable accounts, audiences, and income
            streams with minimal protection.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {threats.map((threat, i) => (
            <AnimatedCard
              key={threat.title}
              delay={i * 0.15}
              className="relative bg-[#112240] border border-white/10 rounded-2xl p-6 overflow-hidden group hover:border-[#3B82F6]/40 transition-all duration-300"
            >
              {/* Red accent */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 opacity-70" />

              <div className="text-red-400 mb-4">{threat.icon}</div>
              <h3
                className="text-white text-xl font-bold mb-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {threat.title}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                {threat.description}
              </p>
              <div className="border-t border-white/10 pt-4">
                <div className="text-[#F59E0B] text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {threat.stat}
                </div>
                <div className="text-white/40 text-xs mt-0.5">{threat.statSub}</div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
}
