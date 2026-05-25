import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AnimatedSection, AnimatedCard } from "@/components/ui/AnimatedSection";

export const metadata: Metadata = {
  title: "About — AEFORYN",
  description:
    "Learn why AEFORYN was built, our mission to protect creators and freelancers, and the problem we set out to solve.",
  openGraph: {
    title: "About — AEFORYN",
    description:
      "Our mission: enterprise-grade cybersecurity for the digital generation.",
    url: "https://aeforyn.com/about",
  },
};

const values = [
  {
    title: "Transparency",
    description:
      "We tell you exactly what we collect, why, and how it's protected. No buried clauses, no data broker networks, no surveillance capitalism.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  {
    title: "Creator-First Design",
    description:
      "Every feature is designed from the perspective of a creator, freelancer, or remote worker — not an enterprise IT department.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    title: "Privacy by Design",
    description:
      "Privacy isn&apos;t an afterthought — it&apos;s the foundation. Our zero-knowledge vault and minimal data collection are built into the architecture, not bolted on.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    title: "Accessibility",
    description:
      "Cybersecurity has long been gatekept by jargon and cost. AEFORYN makes meaningful protection accessible to anyone with a digital presence — at any budget.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero — light section */}
        <section className="bg-white pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <AnimatedSection>
                <span className="inline-block px-3 py-1 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-semibold uppercase tracking-wider mb-6">
                  Our Story
                </span>
                <h1
                  className="text-5xl sm:text-6xl font-bold text-[#071426] mb-6"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Built because creators
                  <br />
                  <span className="text-[#F59E0B]">deserve better.</span>
                </h1>
                <p className="text-[#071426]/70 text-lg leading-relaxed">
                  AEFORYN was born from a simple observation: the people most at
                  risk of cybercrime are often the least protected. Creators,
                  freelancers, and remote workers run their entire livelihoods
                  online — yet the tools available to them are either consumer
                  toys or enterprise solutions priced out of reach.
                </p>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Story — dark section */}
        <section className="bg-[#0D1F35] py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <AnimatedSection delay={0}>
                <h2
                  className="text-3xl font-bold text-white mb-5"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  The problem we set out to solve
                </h2>
                <div className="space-y-4 text-white/70 leading-relaxed">
                  <p>
                    Account takeovers, phishing scams, brand impersonation — these aren&apos;t
                    abstract threats. They happen every day, to real people, destroying
                    income streams that took years to build. A hacked Instagram account
                    for an influencer isn&apos;t a minor inconvenience. It&apos;s a career crisis.
                  </p>
                  <p>
                    A phishing email targeting a freelance designer doesn&apos;t just compromise
                    credentials — it can give attackers access to client files, payment
                    accounts, and years of work. And when a fake profile starts scamming
                    your audience, the damage to your reputation can outlast the attack itself.
                  </p>
                  <p>
                    We saw creators losing thousands — sometimes everything — to attacks
                    that could have been prevented with the right tools. Tools that existed
                    for corporations but had never been built for individuals.
                  </p>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.15}>
                <h2
                  className="text-3xl font-bold text-white mb-5"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Why we built AEFORYN
                </h2>
                <div className="space-y-4 text-white/70 leading-relaxed">
                  <p>
                    We believed the digital economy needed a security platform
                    that started from the creator&apos;s perspective — not the
                    enterprise&apos;s. One that spoke plain English, not tech jargon.
                    That worked across the platforms creators actually use. That
                    respected their privacy as much as it protected their security.
                  </p>
                  <p>
                    AEFORYN is that platform. Developed by Co-Plot (Pty) Ltd —
                    a South African technology company — with a focus on the
                    realities of the digital creator economy in Africa and beyond.
                    POPIA compliant. GDPR aligned. Built to serve real people,
                    not boardrooms.
                  </p>
                  <p>
                    Our mission is straightforward: make enterprise-grade
                    cybersecurity accessible, affordable, and genuinely useful
                    to every creator, freelancer, and remote worker — regardless
                    of their technical background or budget.
                  </p>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Mission statement */}
        <section className="bg-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimatedSection>
              <blockquote
                className="text-3xl sm:text-4xl font-bold text-[#071426] leading-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                &ldquo;Your digital presence is your livelihood.
                <br />
                <span className="text-[#3B82F6]">It deserves to be protected.</span>&rdquo;
              </blockquote>
              <p className="mt-4 text-[#071426]/50 text-sm">
                Co-Plot (Pty) Ltd — Trading as AEFORYN
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Values */}
        <section className="bg-[#112240] py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-14">
              <h2
                className="text-3xl sm:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                What we stand for
              </h2>
              <p className="text-white/60 max-w-xl mx-auto">
                Our values aren&apos;t wall decorations. They&apos;re the decisions we make
                every day about how AEFORYN is built, sold, and operated.
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, i) => (
                <AnimatedCard
                  key={value.title}
                  delay={i * 0.1}
                  className="bg-[#0D1F35] rounded-2xl p-6 border border-white/10"
                >
                  <div className="text-[#3B82F6] mb-4">{value.icon}</div>
                  <h3
                    className="text-white font-bold text-lg mb-2"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {value.title}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "24", label: "Platforms Monitored" },
                { value: "256-bit", label: "AES Encryption" },
                { value: "POPIA", label: "+ GDPR Compliant" },
                { value: "South Africa", label: "Built & Operated From" },
              ].map((stat, i) => (
                <AnimatedCard key={stat.label} delay={i * 0.1} className="text-center">
                  <div
                    className="text-3xl font-bold text-[#071426] mb-1"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-sm text-[#071426]/60">{stat.label}</div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#071426] py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimatedSection>
              <h2
                className="text-4xl font-bold text-white mb-5"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Join thousands of creators who
                <br />
                <span className="text-[#F59E0B]">choose to stay protected.</span>
              </h2>
              <p className="text-white/60 mb-8">
                Start for free. No credit card required.
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
