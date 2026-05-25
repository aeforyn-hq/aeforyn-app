"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

const navLinks = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileOpen
          ? "bg-[#071426]/90 backdrop-blur-md border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 hover:text-[#F59E0B] ${
                  pathname === link.href ? "text-[#F59E0B]" : "text-white/80"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://aeforyn-app.vercel.app/login"
              className="text-sm font-medium text-white/80 hover:text-white border border-white/30 hover:border-white/60 px-4 py-2 rounded-lg transition-all duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sign In
            </a>
            <a
              href="https://aeforyn-app.vercel.app/signup"
              className="text-sm font-semibold bg-[#F59E0B] hover:bg-[#D97706] text-[#071426] px-4 py-2 rounded-lg transition-all duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Started Free
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-md hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle mobile menu"
          >
            <span
              className={`block w-5 h-0.5 bg-white transition-all duration-300 ${
                mobileOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-white transition-all duration-300 ${
                mobileOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-white transition-all duration-300 ${
                mobileOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#071426]/95 backdrop-blur-md">
          <div className="px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-base font-medium transition-colors duration-200 hover:text-[#F59E0B] ${
                  pathname === link.href ? "text-[#F59E0B]" : "text-white/80"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
              <a
                href="https://aeforyn-app.vercel.app/login"
                className="text-center text-sm font-medium text-white/80 border border-white/30 px-4 py-2.5 rounded-lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sign In
              </a>
              <a
                href="https://aeforyn-app.vercel.app/signup"
                className="text-center text-sm font-semibold bg-[#F59E0B] text-[#071426] px-4 py-2.5 rounded-lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get Started Free
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
