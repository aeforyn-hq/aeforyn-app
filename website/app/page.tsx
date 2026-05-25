import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import StatsBar from "@/components/sections/StatsBar";
import ProblemSection from "@/components/sections/ProblemSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import PricingSection from "@/components/sections/PricingSection";
import WhySection from "@/components/sections/WhySection";

export const metadata: Metadata = {
  title: "AEFORYN — Your Account. Your Income. Protected.",
  description:
    "The cybersecurity platform built for creators, freelancers, and remote workers. Real-time threat detection, phishing scanner, secure vault, and AI security assistant.",
  openGraph: {
    title: "AEFORYN — Your Account. Your Income. Protected.",
    description:
      "The cybersecurity platform built for creators, freelancers, and remote workers.",
    url: "https://aeforyn.com",
  },
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StatsBar />
        <ProblemSection />
        <FeaturesSection />
        <PricingSection />
        <WhySection />
      </main>
      <Footer />
    </>
  );
}
