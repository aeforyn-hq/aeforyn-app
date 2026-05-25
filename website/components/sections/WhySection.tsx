"use client";

import { AnimatedSection, AnimatedCard } from "../ui/AnimatedSection";

const differentiators = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "Built for Creators, Not Corporations",
    description:
      "Enterprise security tools are designed for IT teams, not individuals. AEFORYN speaks your language — intuitive dashboards, plain-English alerts, and protection that works for your workflow, not against it.",
    color: "#3B82F6",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <line x1="9" y1="12" x2="15" y2="12"/>
      </svg>
    ),
    title: "Your Data Is Never Sold",
    description:
      "We don't monetise your data. Ever. Your information is encrypted, stored securely, and used solely to protect you. AEFORYN's business model is subscription — not surveillance.",
    color: "#14B8A6",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
        <line x1="9" y1="11" x2="15" y2="11"/>
      </svg>
    ),
    title: "POPIA + GDPR Compliant",
    description:
      "AEFORYN is built to meet South Africa's POPIA requirements and the EU's GDPR standards. Your personal data is handled lawfully, transparently, and with full respect for your rights.",
    color: "#F59E0B",
  },
];

export default function WhySection() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-semibold uppercase tracking-wider mb-4">
            Why Choose AEFORYN
          </span>
          <h2
            className="text-4xl sm:text-5xl font-bold text-[#071426] mb-5"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Security that respects you
          </h2>
          <p className="text-[#071426]/60 text-lg max-w-2xl mx-auto">
            We built AEFORYN because creators deserve the same level of
            protection as enterprises — without the complexity, cost, or
            data exploitation.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {differentiators.map((item, i) => (
            <AnimatedCard
              key={item.title}
              delay={i * 0.15}
              className="text-center flex flex-col items-center"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{
                  backgroundColor: `${item.color}15`,
                  color: item.color,
                }}
              >
                {item.icon}
              </div>
              <h3
                className="text-[#071426] text-xl font-bold mb-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {item.title}
              </h3>
              <p className="text-[#071426]/60 text-sm leading-relaxed">
                {item.description}
              </p>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  );
}
