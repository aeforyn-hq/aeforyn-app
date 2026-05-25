"use client";

import { motion } from "framer-motion";
import Link from "next/link";

function HexCluster() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute right-0 top-0 w-full h-full opacity-10"
        viewBox="0 0 800 600"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Large hex cluster - decorative background */}
        {[
          { cx: 600, cy: 150, r: 120 },
          { cx: 720, cy: 270, r: 120 },
          { cx: 480, cy: 270, r: 120 },
          { cx: 600, cy: 390, r: 120 },
          { cx: 720, cy: 150, r: 120 },
          { cx: 480, cy: 150, r: 120 },
        ].map((h, i) => (
          <polygon
            key={i}
            points={hexPoints(h.cx, h.cy, h.r)}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="1.5"
            opacity={0.6 - i * 0.07}
          />
        ))}
        {[
          { cx: 600, cy: 150, r: 60 },
          { cx: 720, cy: 270, r: 60 },
          { cx: 480, cy: 270, r: 60 },
        ].map((h, i) => (
          <polygon
            key={`fill-${i}`}
            points={hexPoints(h.cx, h.cy, h.r)}
            fill="#F59E0B"
            opacity={0.08 - i * 0.02}
          />
        ))}
      </svg>
    </div>
  );
}

function hexPoints(cx: number, cy: number, r: number): string {
  const angles = [0, 60, 120, 180, 240, 300];
  return angles
    .map((a) => {
      const rad = ((a - 30) * Math.PI) / 180;
      return `${cx + r * Math.cos(rad)},${cy + r * Math.sin(rad)}`;
    })
    .join(" ");
}

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center bg-[#071426] overflow-hidden">
      <HexCluster />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#071426] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-semibold uppercase tracking-wider mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
              Cybersecurity for the Digital Age
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Your Account.
            <br />
            Your Income.
            <br />
            <span className="text-[#F59E0B]">Protected.</span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-white/70 mb-10 max-w-2xl leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            The cybersecurity platform built for creators, freelancers, and
            remote workers. Real-time threat detection, phishing protection, and
            AI-powered security — so you can focus on what you do best.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <a
              href="https://aeforyn-app.vercel.app/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#071426] font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200 shadow-lg shadow-[#F59E0B]/25"
            >
              Get Started Free
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 border border-white/30 hover:border-white/60 text-white/80 hover:text-white font-medium px-8 py-4 rounded-xl text-base transition-all duration-200"
            >
              See How It Works
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </a>
          </motion.div>

          <motion.p
            className="mt-6 text-white/40 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            No credit card required. Free plan available.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
