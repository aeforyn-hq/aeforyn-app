"use client";

import Link from "next/link";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <svg
        width="36"
        height="36"
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="AEFORYN hex logo"
      >
        <polygon
          points="32,4 44,11 44,25 32,32 20,25 20,11"
          fill="#F59E0B"
          opacity="0.95"
        />
        <polygon
          points="44,11 56,18 56,32 44,39 32,32 32,18"
          fill="#F59E0B"
          opacity="0.65"
        />
        <polygon
          points="20,11 32,18 32,32 20,39 8,32 8,18"
          fill="#F59E0B"
          opacity="0.65"
        />
        <polygon
          points="32,32 44,39 44,53 32,60 20,53 20,39"
          fill="#F59E0B"
          opacity="0.4"
        />
      </svg>
      <span
        className="text-[#F59E0B] font-bold text-xl tracking-wider"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        AEFORYN
      </span>
    </Link>
  );
}
