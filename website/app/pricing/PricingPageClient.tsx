"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AnimatedSection, AnimatedCard } from "@/components/ui/AnimatedSection";

const plans = [
  {
    name: "Free",
    priceUSD: 0,
    priceZAR: 0,
    period: "",
    description: "Essential protection to get started.",
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Creator",
    priceUSD: 29,
    priceZAR: 549,
    period: "/month",
    description: "For individual creators and freelancers.",
    cta: "Start Creator Plan",
    highlighted: false,
  },
  {
    name: "Pro",
    priceUSD: 49,
    priceZAR: 899,
    period: "/month",
    description: "For serious creators with growing audiences.",
    cta: "Start Pro Plan",
    highlighted: true,
  },
  {
    name: "Agency",
    priceUSD: 99,
    priceZAR: 1799,
    period: "/month",
    description: "For agencies and multi-creator teams.",
    cta: "Start Agency Plan",
    highlighted: false,
  },
];

type FeatureValue = boolean | string;

const comparisonTable: {
  category: string;
  features: { name: string; values: [FeatureValue, FeatureValue, FeatureValue, FeatureValue] }[];
}[] = [
  {
    category: "Platform Coverage",
    features: [
      { name: "Connected platforms", values: ["1", "8", "16", "24"] },
      { name: "Team user accounts", values: [false, false, false, "Up to 5"] },
    ],
  },
  {
    category: "Threat Detection",
    features: [
      { name: "Real-time threat detection", values: [false, true, true, true] },
      { name: "Unusual login detection", values: [false, true, true, true] },
      { name: "Breach database monitoring", values: ["Basic", true, true, true] },
      { name: "Behavioural anomaly detection", values: [false, false, true, true] },
      { name: "Threat severity scoring", values: [false, true, true, true] },
    ],
  },
  {
    category: "Phishing Protection",
    features: [
      { name: "Phishing link scanner", values: ["Basic", true, true, true] },
      { name: "Email phishing detection", values: [false, true, true, true] },
      { name: "Deep phishing analysis", values: [false, false, true, true] },
      { name: "Domain spoofing detection", values: [false, true, true, true] },
    ],
  },
  {
    category: "Secure Vault",
    features: [
      { name: "Encrypted credential storage", values: [false, true, true, true] },
      { name: "Document storage", values: [false, "5GB", "25GB", "100GB"] },
      { name: "API key manager", values: [false, true, true, true] },
      { name: "Cross-device sync", values: [false, true, true, true] },
    ],
  },
  {
    category: "Impersonation & Brand",
    features: [
      { name: "Social media impersonation alerts", values: [false, true, true, true] },
      { name: "Brand monitoring", values: [false, false, true, true] },
      { name: "Domain typosquatting alerts", values: [false, false, true, true] },
      { name: "White-label reports", values: [false, false, false, true] },
    ],
  },
  {
    category: "AI Security Assistant",
    features: [
      { name: "AI Security Assistant", values: [false, "50/mo", "Unlimited", "Unlimited"] },
      { name: "Personalised recommendations", values: [false, true, true, true] },
      { name: "Remediation guidance", values: [false, true, true, true] },
    ],
  },
  {
    category: "Account Recovery",
    features: [
      { name: "Recovery checklists", values: [false, true, true, true] },
      { name: "Priority recovery assistance", values: [false, false, true, true] },
      { name: "Dedicated recovery manager", values: [false, false, false, true] },
    ],
  },
  {
    category: "Compliance",
    features: [
      { name: "POPIA + GDPR compliance", values: [true, true, true, true] },
      { name: "Compliance reports", values: [false, false, true, true] },
      { name: "Custom compliance reports", values: [false, false, false, true] },
    ],
  },
  {
    category: "Support",
    features: [
      { name: "Community support", values: [true, false, false, false] },
      { name: "Email support", values: [false, true, false, false] },
      { name: "Priority live chat", values: [false, false, true, false] },
      { name: "Dedicated account manager", values: [false, false, false, true] },
      { name: "SLA-backed support", values: [false, false, false, true] },
    ],
  },
];

function CheckIcon({ color = "#14B8A6" }: { color?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mx-auto">
      <circle cx="12" cy="12" r="10" fill={color} opacity="0.2" />
      <path d="M9 12l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mx-auto">
      <line x1="18" y1="6" x2="6" y2="18" stroke="#ffffff30" strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="6" x2="18" y2="18" stroke="#ffffff30" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function FeatureCell({ value, highlighted }: { value: FeatureValue; highlighted: boolean }) {
  if (value === true) {
    return <CheckIcon color={highlighted ? "#F59E0B" : "#14B8A6"} />;
  }
  if (value === false) {
    return <CrossIcon />;
  }
  return (
    <span className={`text-xs font-medium ${highlighted ? "text-[#F59E0B]" : "text-white/70"}`}>
      {value}
    </span>
  );
}

export default function PricingPageClient() {
  const [currency, setCurrency] = useState<"USD" | "ZAR">("USD");

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-[#071426] pt-32 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimatedSection>
              <span className="inline-block px-3 py-1 rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-semibold uppercase tracking-wider mb-6">
                Pricing
              </span>
              <h1
                className="text-5xl sm:text-6xl font-bold text-white mb-5"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Protection for every level
              </h1>
              <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
                Start free. Upgrade when you&apos;re ready. No hidden fees, no long-term
                contracts. Cancel any time.
              </p>

              {/* Currency toggle */}
              <div className="inline-flex items-center gap-1 bg-white/10 rounded-xl p-1">
                <button
                  onClick={() => setCurrency("USD")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    currency === "USD"
                      ? "bg-[#F59E0B] text-[#071426]"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  USD ($)
                </button>
                <button
                  onClick={() => setCurrency("ZAR")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    currency === "ZAR"
                      ? "bg-[#F59E0B] text-[#071426]"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  ZAR (R)
                </button>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Plan cards */}
        <section className="bg-[#0D1F35] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {plans.map((plan, i) => (
                <AnimatedCard
                  key={plan.name}
                  delay={i * 0.1}
                  className={`relative rounded-2xl p-6 flex flex-col ${
                    plan.highlighted
                      ? "bg-[#112240] border-2 border-[#F59E0B]"
                      : "bg-[#112240] border border-white/10"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-[#F59E0B] text-[#071426] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3
                    className="text-white text-xl font-bold mb-1"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {plan.name}
                  </h3>
                  <p className="text-white/50 text-sm mb-4">{plan.description}</p>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-white/60 text-lg">
                      {currency === "USD" ? "$" : "R"}
                    </span>
                    <span
                      className="text-4xl font-bold text-white"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {currency === "USD"
                        ? plan.priceUSD.toLocaleString()
                        : plan.priceZAR.toLocaleString()}
                    </span>
                    <span className="text-white/50 text-sm">{plan.period}</span>
                  </div>

                  <a
                    href="https://aeforyn-app.vercel.app/signup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition-all duration-200 mt-auto ${
                      plan.highlighted
                        ? "bg-[#F59E0B] hover:bg-[#D97706] text-[#071426]"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                  >
                    {plan.cta}
                  </a>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section className="bg-[#071426] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-12">
              <h2
                className="text-3xl font-bold text-white mb-3"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Full feature comparison
              </h2>
              <p className="text-white/50">See exactly what&apos;s included in each plan.</p>
            </AnimatedSection>

            <AnimatedSection>
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 px-4 text-white/50 text-sm font-medium w-1/3">
                        Feature
                      </th>
                      {plans.map((plan) => (
                        <th
                          key={plan.name}
                          className={`text-center py-4 px-4 text-sm font-bold ${
                            plan.highlighted ? "text-[#F59E0B]" : "text-white"
                          }`}
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {plan.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonTable.map((section) => (
                      <>
                        <tr
                          key={section.category}
                          className="border-t border-white/5 bg-white/5"
                        >
                          <td
                            colSpan={5}
                            className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-[#3B82F6]"
                          >
                            {section.category}
                          </td>
                        </tr>
                        {section.features.map((feature) => (
                          <tr
                            key={feature.name}
                            className="border-t border-white/5 hover:bg-white/3 transition-colors"
                          >
                            <td className="py-3.5 px-4 text-white/70 text-sm">
                              {feature.name}
                            </td>
                            {feature.values.map((value, vi) => (
                              <td
                                key={vi}
                                className="py-3.5 px-4 text-center"
                              >
                                <FeatureCell
                                  value={value}
                                  highlighted={plans[vi].highlighted}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* FAQ / Trust */}
        <section className="bg-[#0D1F35] py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimatedSection>
              <h2
                className="text-3xl font-bold text-white mb-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Questions? We&apos;ve got answers.
              </h2>
              <div className="space-y-4 text-left">
                {[
                  {
                    q: "Can I change plans at any time?",
                    a: "Yes. Upgrade, downgrade, or cancel your subscription at any time from your account dashboard. Changes take effect at the next billing cycle.",
                  },
                  {
                    q: "Is there a free trial?",
                    a: "Yes — the Free plan is permanently free. For paid plans, sign up and explore the platform before committing.",
                  },
                  {
                    q: "Are ZAR prices charged in South African Rand?",
                    a: "ZAR pricing is indicative. Payments are processed in USD via our secure payment provider. The exchange rate is locked at checkout.",
                  },
                  {
                    q: "Is my data safe?",
                    a: "Absolutely. We use AES-256 encryption, a zero-knowledge vault architecture, and are fully POPIA and GDPR compliant. Your data is never sold or shared.",
                  },
                ].map(({ q, a }) => (
                  <div
                    key={q}
                    className="bg-[#112240] rounded-xl p-5 border border-white/10"
                  >
                    <h3
                      className="text-white font-semibold mb-2"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {q}
                    </h3>
                    <p className="text-white/60 text-sm">{a}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <a
                  href="https://aeforyn-app.vercel.app/signup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#071426] font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200"
                >
                  Get Started Free
                </a>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
