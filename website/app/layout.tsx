import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aeforyn.com"),
  title: "AEFORYN — Cybersecurity for Creators & Freelancers",
  description:
    "AEFORYN protects your income, accounts, and digital identity. Built for creators, freelancers, and remote workers. Threat detection, phishing scanner, secure vault, and more.",
  keywords: [
    "cybersecurity",
    "creator security",
    "freelancer protection",
    "account protection",
    "phishing scanner",
    "POPIA",
    "GDPR",
  ],
  authors: [{ name: "AEFORYN" }],
  creator: "Co-Plot (Pty) Ltd",
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "https://aeforyn.com",
    title: "AEFORYN — Cybersecurity for Creators & Freelancers",
    description:
      "The cybersecurity platform built for creators, freelancers, and remote workers. Protect your accounts, income, and identity.",
    siteName: "AEFORYN",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AEFORYN Cybersecurity Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AEFORYN — Cybersecurity for Creators & Freelancers",
    description:
      "Protect your accounts, income, and digital identity with AEFORYN.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#071426] text-white">
        {children}
      </body>
    </html>
  );
}
