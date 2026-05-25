"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

type SubmitStatus = "idle" | "loading" | "success" | "error";

export default function ContactPageClient() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please check your connection and try again.");
    }
  };

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-white pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              {/* Left: Info */}
              <AnimatedSection>
                <span className="inline-block px-3 py-1 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-semibold uppercase tracking-wider mb-6">
                  Get in Touch
                </span>
                <h1
                  className="text-5xl sm:text-6xl font-bold text-[#071426] mb-5"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  We&apos;d love to
                  <br />
                  <span className="text-[#F59E0B]">hear from you.</span>
                </h1>
                <p className="text-[#071426]/70 text-lg leading-relaxed mb-8">
                  Have a question about AEFORYN? Need help with your account?
                  Want to explore a partnership? Send us a message and we&apos;ll
                  get back to you as soon as possible.
                </p>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-[#071426]/50 font-medium uppercase tracking-wider">Email</div>
                      <a
                        href="mailto:hello@aeforyn.com"
                        className="text-[#071426] font-semibold hover:text-[#3B82F6] transition-colors"
                      >
                        hello@aeforyn.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#14B8A6]/10 flex items-center justify-center text-[#14B8A6]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        <path d="M9 12l2 2 4-4"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-[#071426]/50 font-medium uppercase tracking-wider">Operated by</div>
                      <span className="text-[#071426] font-semibold">Co-Plot (Pty) Ltd, South Africa</span>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* Right: Form */}
              <AnimatedSection delay={0.15}>
                <div className="bg-[#f8fafc] border border-[#071426]/10 rounded-2xl p-8">
                  {status === "success" ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-[#14B8A6]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" fill="#14B8A6" opacity="0.2" />
                          <path d="M9 12l2 2 4-4" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <h3
                        className="text-2xl font-bold text-[#071426] mb-2"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        Message sent!
                      </h3>
                      <p className="text-[#071426]/60">
                        Thanks for reaching out. We&apos;ll get back to you shortly.
                      </p>
                      <button
                        onClick={() => setStatus("idle")}
                        className="mt-6 text-sm text-[#3B82F6] hover:underline"
                      >
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-[#071426]/70 mb-1.5"
                          >
                            Full Name
                          </label>
                          <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Jane Smith"
                            className="w-full px-4 py-3 border border-[#071426]/15 rounded-xl bg-white text-[#071426] placeholder-[#071426]/30 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-[#071426]/70 mb-1.5"
                          >
                            Email Address
                          </label>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={form.email}
                            onChange={handleChange}
                            placeholder="jane@example.com"
                            className="w-full px-4 py-3 border border-[#071426]/15 rounded-xl bg-white text-[#071426] placeholder-[#071426]/30 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="subject"
                          className="block text-sm font-medium text-[#071426]/70 mb-1.5"
                        >
                          Subject
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          required
                          value={form.subject}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-[#071426]/15 rounded-xl bg-white text-[#071426] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all text-sm"
                        >
                          <option value="">Select a subject...</option>
                          <option value="General Enquiry">General Enquiry</option>
                          <option value="Technical Support">Technical Support</option>
                          <option value="Billing Question">Billing Question</option>
                          <option value="Partnership Opportunity">Partnership Opportunity</option>
                          <option value="Press / Media">Press / Media</option>
                          <option value="Report a Security Issue">Report a Security Issue</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="message"
                          className="block text-sm font-medium text-[#071426]/70 mb-1.5"
                        >
                          Message
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          required
                          rows={5}
                          value={form.message}
                          onChange={handleChange}
                          placeholder="Tell us how we can help..."
                          className="w-full px-4 py-3 border border-[#071426]/15 rounded-xl bg-white text-[#071426] placeholder-[#071426]/30 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all text-sm resize-none"
                        />
                      </div>

                      {status === "error" && (
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                          <p className="text-red-700 text-sm">{errorMessage}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full bg-[#F59E0B] hover:bg-[#D97706] disabled:bg-[#F59E0B]/50 text-[#071426] font-semibold py-3.5 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2"
                      >
                        {status === "loading" ? (
                          <>
                            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.4 31.4" />
                            </svg>
                            Sending...
                          </>
                        ) : (
                          "Send Message"
                        )}
                      </button>

                      <p className="text-center text-xs text-[#071426]/40">
                        Or email us directly at{" "}
                        <a
                          href="mailto:hello@aeforyn.com"
                          className="text-[#3B82F6] hover:underline"
                        >
                          hello@aeforyn.com
                        </a>
                      </p>
                    </form>
                  )}
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
