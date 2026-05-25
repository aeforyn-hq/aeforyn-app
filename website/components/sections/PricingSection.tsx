"use client";

import { useState } from "react";
import { AnimatedSection, AnimatedCard } from "../ui/AnimatedSection";

const plans = [
  {
    name: "Free",
    priceUSD: 0,
    priceZAR: 0,
    period: "",
    description: "Get started with essential protection.",
    features: [
      "1 connected platform",
      "Basic threat alerts",
      "Phishing link scanner",
      "Community support",
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Creator",
    priceUSD: 29,
    priceZAR: 549,
    period: "/month",
    description: "For individual creators and freelancers.",
    features: [
      "Up to 8 connected platforms",
      "Real-time threat detection",
      "Phishing scanner + email alerts",
      "Secure Vault (5GB)",
      "Impersonation monitoring",
      "AI Security Assistant (50 queries/mo)",
      "Account recovery guide",
      "Priority email support",
    ],
    cta: "Start Creator Plan",
    highlighted: false,
  },
  {
    name: "Pro",
    priceUSD: 49,
    priceZAR: 899,
    period: "/month",
    description: "For serious creators with bigger audiences.",
    features: [
      "Up to 16 connected platforms",
      "Advanced threat detection",
      "Deep phishing analysis",
      "Secure Vault (25GB)",
      "Impersonation + brand monitoring",
      "AI Security Assistant (unlimited)",
      "Priority account recovery",
      "POPIA + GDPR compliance reports",
      "Priority live chat support",
    ],
    cta: "Start Pro Plan",
    highlighted: true,
  },
  {
    name: "Agency",
    priceUSD: 99,
    priceZAR: 1799,
    period: "/month",
    description: "For agencies and multi-creator teams.",
    features: [
      "24 connected platforms",
      "Team accounts (up to 5 users)",
      "All Pro features",
      "Secure Vault (100GB)",
      "Team threat dashboard",
      "Dedicated account manager",
      "Custom compliance reports",
      "SLA-backed support",
      "White-label reports",
    ],
    cta: "Start Agency Plan",
    highlighted: false,
  },
];

export default function PricingSection() {
  const [currency, setCurrency] = useState<"USD" | "ZAR">("USD");

  return (
    <section className="bg-[#0D1F35] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-semibold uppercase tracking-wider mb-4">
            Pricing Plans
          </span>
          <h2
            className="text-4xl sm:text-5xl font-bold text-white mb-5"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Protection for every level
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
            Start free and upgrade as your digital presence grows.
            No hidden fees. Cancel any time.
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
              USD
            </button>
            <button
              onClick={() => setCurrency("ZAR")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                currency === "ZAR"
                  ? "bg-[#F59E0B] text-[#071426]"
                  : "text-white/70 hover:text-white"
              }`}
            >
              ZAR
            </button>
          </div>
        </AnimatedSection>

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

              <div className="mb-6">
                <h3
                  className="text-white text-xl font-bold mb-1"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {plan.name}
                </h3>
                <p className="text-white/50 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
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
              </div>

              <ul className="flex flex-col gap-2.5 mb-8 flex-grow">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <svg
                      className="flex-shrink-0 mt-0.5"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle cx="12" cy="12" r="10" fill="#14B8A6" opacity="0.2" />
                      <path
                        d="M9 12l2 2 4-4"
                        stroke="#14B8A6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-white/70 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="https://aeforyn-app.vercel.app/signup"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
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
  );
}
