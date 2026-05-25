import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — AEFORYN",
  description:
    "AEFORYN Privacy Policy. Learn how we collect, use, and protect your personal information in compliance with POPIA and GDPR.",
  openGraph: {
    title: "Privacy Policy — AEFORYN",
    url: "https://aeforyn.com/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <span className="inline-block px-3 py-1 rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-semibold uppercase tracking-wider mb-4">
              Legal
            </span>
            <h1
              className="text-4xl sm:text-5xl font-bold text-[#071426] mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Privacy Policy
            </h1>
            <p className="text-[#071426]/50 text-sm">
              Last updated: 1 May 2026 &nbsp;|&nbsp; Effective: 1 May 2026
            </p>
          </div>

          <div className="prose prose-gray max-w-none text-[#071426]/80 text-base leading-relaxed space-y-8">
            <section>
              <p>
                This Privacy Policy describes how Co-Plot (Pty) Ltd, trading as
                AEFORYN (&ldquo;AEFORYN&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) collects, uses, stores,
                and protects your personal information when you use the AEFORYN
                platform and website (&ldquo;Service&rdquo;).
              </p>
              <p>
                AEFORYN is committed to protecting your privacy and complying with
                the Protection of Personal Information Act, 4 of 2013 (POPIA) of
                South Africa, and the General Data Protection Regulation (GDPR)
                where applicable.
              </p>
            </section>

            <section>
              <h2
                className="text-2xl font-bold text-[#071426] mb-3 mt-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                1. Information We Collect
              </h2>
              <h3 className="text-lg font-semibold text-[#071426] mb-2">
                1.1 Information you provide directly
              </h3>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Name and email address (account registration)</li>
                <li>Payment information (processed securely by our payment provider — we do not store card details)</li>
                <li>Profile information you choose to provide</li>
                <li>Communications you send to us (support requests, contact form submissions)</li>
                <li>Content you upload to the Secure Vault</li>
              </ul>

              <h3 className="text-lg font-semibold text-[#071426] mt-5 mb-2">
                1.2 Information collected automatically
              </h3>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Log data (IP address, browser type, pages visited, timestamps)</li>
                <li>Device information (device type, operating system)</li>
                <li>Usage data (features used, actions taken within the platform)</li>
                <li>Cookies and similar tracking technologies (see Section 7)</li>
              </ul>

              <h3 className="text-lg font-semibold text-[#071426] mt-5 mb-2">
                1.3 Information from connected platforms
              </h3>
              <p>
                When you connect third-party platforms to AEFORYN for monitoring,
                we access only the data necessary to provide the security features
                you&apos;ve enabled. We do not read your private messages or post
                content on your behalf without your explicit instruction.
              </p>
            </section>

            <section>
              <h2
                className="text-2xl font-bold text-[#071426] mb-3 mt-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                2. How We Use Your Information
              </h2>
              <p>We use your personal information to:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Provide, operate, and improve the Service</li>
                <li>Create and manage your account</li>
                <li>Process payments and send receipts</li>
                <li>Send security alerts and threat notifications</li>
                <li>Provide customer support</li>
                <li>Send service-related communications (platform updates, policy changes)</li>
                <li>Analyse usage to improve our features</li>
                <li>Comply with legal obligations</li>
                <li>Detect and prevent fraud, abuse, and security incidents</li>
              </ul>
              <p className="mt-3">
                We do not sell your personal information to third parties. We do
                not use your data for advertising purposes or share it with data
                brokers.
              </p>
            </section>

            <section>
              <h2
                className="text-2xl font-bold text-[#071426] mb-3 mt-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                3. Legal Basis for Processing (GDPR)
              </h2>
              <p>
                For users in the European Economic Area, our legal bases for
                processing personal data are:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  <strong>Contract performance:</strong> Processing necessary to
                  provide the Service you&apos;ve subscribed to.
                </li>
                <li>
                  <strong>Legitimate interests:</strong> Processing for security
                  purposes, fraud prevention, and service improvement.
                </li>
                <li>
                  <strong>Legal obligation:</strong> Processing required to comply
                  with applicable law.
                </li>
                <li>
                  <strong>Consent:</strong> Where you have given us specific consent
                  (e.g., marketing communications).
                </li>
              </ul>
            </section>

            <section>
              <h2
                className="text-2xl font-bold text-[#071426] mb-3 mt-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                4. Data Security
              </h2>
              <p>
                We implement appropriate technical and organisational measures to
                protect your personal information:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>AES-256 encryption for stored data</li>
                <li>TLS/HTTPS encryption for data in transit</li>
                <li>Zero-knowledge architecture for the Secure Vault (we cannot access your vault contents)</li>
                <li>Access controls limiting employee access to personal data</li>
                <li>Regular security assessments and monitoring</li>
                <li>Incident response procedures</li>
              </ul>
              <p className="mt-3">
                While we take security seriously, no system is 100% impenetrable.
                We will notify you of any data breach affecting your personal
                information in accordance with POPIA and GDPR requirements.
              </p>
            </section>

            <section>
              <h2
                className="text-2xl font-bold text-[#071426] mb-3 mt-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                5. Data Sharing and Disclosure
              </h2>
              <p>
                We do not sell or rent your personal information. We may share
                your information in the following limited circumstances:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  <strong>Service providers:</strong> With trusted third-party
                  vendors who assist in operating the Service (hosting, payment
                  processing, email delivery), under strict data processing
                  agreements.
                </li>
                <li>
                  <strong>Legal requirements:</strong> When required by law, court
                  order, or governmental authority.
                </li>
                <li>
                  <strong>Business transfers:</strong> In connection with a merger,
                  acquisition, or sale of assets, with appropriate notice to you.
                </li>
                <li>
                  <strong>With your consent:</strong> When you have explicitly
                  authorised a specific disclosure.
                </li>
              </ul>
            </section>

            <section>
              <h2
                className="text-2xl font-bold text-[#071426] mb-3 mt-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                6. Data Retention
              </h2>
              <p>
                We retain your personal information for as long as your account
                is active or as needed to provide the Service. If you close your
                account, we will retain your data for a maximum of 90 days before
                deletion, unless we are required by law to retain it longer.
              </p>
              <p className="mt-3">
                Vault contents are deleted immediately upon account closure at
                your request.
              </p>
            </section>

            <section>
              <h2
                className="text-2xl font-bold text-[#071426] mb-3 mt-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                7. Cookies
              </h2>
              <p>
                We use cookies and similar technologies to operate and improve
                the Service. Types of cookies we use:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  <strong>Essential cookies:</strong> Required for the Service to
                  function (authentication, session management). These cannot be
                  disabled.
                </li>
                <li>
                  <strong>Analytics cookies:</strong> Help us understand how the
                  Service is used so we can improve it. You may opt out.
                </li>
              </ul>
              <p className="mt-3">
                We do not use advertising cookies or sell cookie data to third
                parties.
              </p>
            </section>

            <section>
              <h2
                className="text-2xl font-bold text-[#071426] mb-3 mt-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                8. Your Rights
              </h2>
              <p>
                Depending on your location, you have the following rights
                regarding your personal information:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  <strong>Access:</strong> Request a copy of the personal
                  information we hold about you.
                </li>
                <li>
                  <strong>Correction:</strong> Request correction of inaccurate
                  or incomplete information.
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal
                  information (subject to legal obligations).
                </li>
                <li>
                  <strong>Portability:</strong> Receive your data in a structured,
                  machine-readable format.
                </li>
                <li>
                  <strong>Objection:</strong> Object to certain processing of
                  your data.
                </li>
                <li>
                  <strong>Restriction:</strong> Request restriction of processing
                  in certain circumstances.
                </li>
                <li>
                  <strong>Withdraw consent:</strong> Where processing is based on
                  consent, withdraw it at any time.
                </li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, contact us at{" "}
                <a
                  href="mailto:hello@aeforyn.com"
                  className="text-[#3B82F6] hover:underline"
                >
                  hello@aeforyn.com
                </a>
                . We will respond within 30 days as required by POPIA, or within
                the applicable timeframe under GDPR.
              </p>
            </section>

            <section>
              <h2
                className="text-2xl font-bold text-[#071426] mb-3 mt-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                9. International Data Transfers
              </h2>
              <p>
                AEFORYN is operated from South Africa. If you access the Service
                from outside South Africa, your information may be transferred to
                and processed in South Africa or other countries where our service
                providers operate.
              </p>
              <p className="mt-3">
                For transfers to countries without adequate data protection laws,
                we implement appropriate safeguards such as standard contractual
                clauses approved by relevant data protection authorities.
              </p>
            </section>

            <section>
              <h2
                className="text-2xl font-bold text-[#071426] mb-3 mt-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                10. Children&apos;s Privacy
              </h2>
              <p>
                The Service is not directed to children under the age of 18. We
                do not knowingly collect personal information from children. If
                you become aware that a child has provided us with personal
                information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2
                className="text-2xl font-bold text-[#071426] mb-3 mt-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                11. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. We will
                notify you of material changes via email or a prominent notice
                within the Service. Your continued use of the Service after the
                effective date of any changes constitutes your acceptance of the
                updated policy.
              </p>
            </section>

            <section>
              <h2
                className="text-2xl font-bold text-[#071426] mb-3 mt-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                12. Contact Our Privacy Officer
              </h2>
              <p>
                For any privacy-related questions, complaints, or to exercise your
                rights, contact us:
              </p>
              <div className="mt-3 p-4 bg-[#071426]/5 rounded-xl border border-[#071426]/10">
                <p><strong>Privacy Officer</strong></p>
                <p><strong>Co-Plot (Pty) Ltd — Trading as AEFORYN</strong></p>
                <p>
                  Email:{" "}
                  <a
                    href="mailto:hello@aeforyn.com"
                    className="text-[#3B82F6] hover:underline"
                  >
                    hello@aeforyn.com
                  </a>
                </p>
                <p>Country: South Africa</p>
              </div>
              <p className="mt-4 text-sm text-[#071426]/60">
                If you are not satisfied with our response, you have the right to
                lodge a complaint with the Information Regulator of South Africa
                (for POPIA) or your relevant national data protection authority
                (for GDPR).
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
