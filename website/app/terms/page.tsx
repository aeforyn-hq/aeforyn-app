import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Terms of Service — AEFORYN",
  description:
    "AEFORYN Terms of Service. Please read these terms carefully before using the AEFORYN cybersecurity platform.",
  openGraph: {
    title: "Terms of Service — AEFORYN",
    url: "https://aeforyn.com/terms",
  },
};

export default function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="text-[#071426]/50 text-sm">
              Last updated: 1 May 2026 &nbsp;|&nbsp; Effective: 1 May 2026
            </p>
          </div>

          <div className="prose prose-gray max-w-none text-[#071426]/80 text-base leading-relaxed space-y-8">
            <section>
              <p>
                These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of
                the AEFORYN platform, including the website at aeforyn.com and all
                associated services (&ldquo;Service&rdquo;), operated by Co-Plot (Pty) Ltd,
                trading as AEFORYN, a company registered in South Africa
                (&ldquo;AEFORYN&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;).
              </p>
              <p>
                By accessing or using the Service, you agree to be bound by these
                Terms. If you do not agree to these Terms, do not use the Service.
              </p>
            </section>

            <section>
              <h2
                className="text-2xl font-bold text-[#071426] mb-3 mt-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                1. Eligibility
              </h2>
              <p>
                You must be at least 18 years of age to use the Service. By
                using the Service, you represent that you are 18 or older and
                have the legal capacity to enter into these Terms. If you are
                using the Service on behalf of a company or organisation, you
                represent that you have authority to bind that entity.
              </p>
            </section>

            <section>
              <h2
                className="text-2xl font-bold text-[#071426] mb-3 mt-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                2. Account Registration
              </h2>
              <p>
                To access most features of the Service, you must register for an
                account. You agree to:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Provide accurate, current, and complete information during registration.</li>
                <li>Maintain and promptly update your account information.</li>
                <li>Keep your password secure and confidential.</li>
                <li>Notify us immediately of any unauthorised use of your account.</li>
                <li>Be responsible for all activity that occurs under your account.</li>
              </ul>
              <p className="mt-3">
                We reserve the right to suspend or terminate your account if any
                information provided is found to be inaccurate, false, or incomplete.
              </p>
            </section>

            <section>
              <h2
                className="text-2xl font-bold text-[#071426] mb-3 mt-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                3. Subscription Plans and Payments
              </h2>
              <p>
                AEFORYN offers both free and paid subscription plans. Paid plans
                are billed monthly and renew automatically unless cancelled.
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  <strong>Billing:</strong> By subscribing to a paid plan, you authorise
                  us to charge the applicable fees to your payment method on a recurring basis.
                </li>
                <li>
                  <strong>Cancellation:</strong> You may cancel your subscription at any
                  time. Cancellation takes effect at the end of the current billing period.
                  No refunds are issued for partial billing periods.
                </li>
                <li>
                  <strong>Price changes:</strong> We reserve the right to modify pricing
                  at any time. We will provide at least 30 days&apos; notice of any price
                  increase via email.
                </li>
                <li>
                  <strong>Taxes:</strong> Prices are exclusive of VAT and other applicable
                  taxes, which will be added where required by law.
                </li>
              </ul>
            </section>

            <section>
              <h2
                className="text-2xl font-bold text-[#071426] mb-3 mt-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                4. Permitted Use
              </h2>
              <p>
                You may use the Service only for lawful purposes and in accordance
                with these Terms. You agree not to:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Use the Service in any way that violates applicable law or regulation.</li>
                <li>Attempt to gain unauthorised access to any part of the Service.</li>
                <li>Use the Service to harass, harm, or threaten others.</li>
                <li>Transmit any malicious code, malware, or harmful software.</li>
                <li>Reverse engineer, decompile, or disassemble any component of the Service.</li>
                <li>Sell, resell, or sublicense the Service without our written consent.</li>
                <li>Use the Service to build a competing product or service.</li>
                <li>Scrape, crawl, or extract data from the Service without authorisation.</li>
              </ul>
            </section>

            <section>
              <h2
                className="text-2xl font-bold text-[#071426] mb-3 mt-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                5. Intellectual Property
              </h2>
              <p>
                The Service and all associated content, features, and functionality
                — including but not limited to the AEFORYN name, logo, software,
                text, graphics, and interface — are owned by Co-Plot (Pty) Ltd and
                are protected by copyright, trademark, and other intellectual
                property laws.
              </p>
              <p className="mt-3">
                You are granted a limited, non-exclusive, non-transferable licence
                to access and use the Service for your personal or internal business
                purposes. This licence does not include any right to resell or
                commercially exploit the Service.
              </p>
            </section>

            <section>
              <h2
                className="text-2xl font-bold text-[#071426] mb-3 mt-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                6. Your Content
              </h2>
              <p>
                You retain ownership of any data, files, or content you upload to
                the Service (&ldquo;Your Content&rdquo;). By uploading content to the Service,
                you grant AEFORYN a limited, non-exclusive licence to store and
                process Your Content solely for the purpose of providing the Service.
              </p>
              <p className="mt-3">
                You are solely responsible for Your Content and represent that you
                have all necessary rights to upload it. You agree not to upload
                content that is illegal, harmful, defamatory, or infringes the
                rights of any third party.
              </p>
            </section>

            <section>
              <h2
                className="text-2xl font-bold text-[#071426] mb-3 mt-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                7. Security Services Disclaimer
              </h2>
              <p>
                AEFORYN provides cybersecurity tools and information to help you
                protect your digital accounts and identity. However:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>
                  No security solution can guarantee 100% protection against all
                  cyber threats.
                </li>
                <li>
                  The Service is a tool to assist you — it does not replace
                  sound personal security practices.
                </li>
                <li>
                  AEFORYN is not responsible for any losses arising from security
                  incidents that occur despite use of the Service.
                </li>
                <li>
                  Threat detection and phishing alerts are based on available
                  threat intelligence and may not detect all threats.
                </li>
              </ul>
            </section>

            <section>
              <h2
                className="text-2xl font-bold text-[#071426] mb-3 mt-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                8. Third-Party Integrations
              </h2>
              <p>
                The Service may connect to or integrate with third-party platforms
                and services. AEFORYN is not responsible for the practices,
                availability, or content of third-party services. Your use of
                third-party services is subject to their own terms and privacy
                policies.
              </p>
            </section>

            <section>
              <h2
                className="text-2xl font-bold text-[#071426] mb-3 mt-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                9. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by applicable law, AEFORYN and
                Co-Plot (Pty) Ltd shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages, including but not
                limited to loss of profits, data, business, or goodwill, arising
                out of or in connection with your use of or inability to use the
                Service.
              </p>
              <p className="mt-3">
                Our total liability to you for any claims arising under these
                Terms shall not exceed the amount you paid to AEFORYN in the
                12 months preceding the claim.
              </p>
            </section>

            <section>
              <h2
                className="text-2xl font-bold text-[#071426] mb-3 mt-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                10. Indemnification
              </h2>
              <p>
                You agree to indemnify, defend, and hold harmless AEFORYN and
                Co-Plot (Pty) Ltd, and our officers, directors, employees, and
                agents, from and against any claims, liabilities, damages, losses,
                and expenses arising out of or in connection with your use of the
                Service, Your Content, or your violation of these Terms.
              </p>
            </section>

            <section>
              <h2
                className="text-2xl font-bold text-[#071426] mb-3 mt-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                11. Service Availability and Modifications
              </h2>
              <p>
                We reserve the right to modify, suspend, or discontinue the Service
                or any part thereof at any time, with or without notice. We will
                endeavour to provide reasonable advance notice of significant
                changes. We are not liable to you or any third party for any
                modification, suspension, or discontinuation.
              </p>
            </section>

            <section>
              <h2
                className="text-2xl font-bold text-[#071426] mb-3 mt-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                12. Termination
              </h2>
              <p>
                We may terminate or suspend your account and access to the Service
                at our sole discretion, without prior notice, for conduct that we
                believe violates these Terms or is harmful to other users, the
                Service, or third parties, or for any other reason.
              </p>
              <p className="mt-3">
                Upon termination, your right to use the Service will immediately
                cease. You may request a copy of your data within 30 days of
                termination, after which your data may be deleted.
              </p>
            </section>

            <section>
              <h2
                className="text-2xl font-bold text-[#071426] mb-3 mt-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                13. Governing Law and Jurisdiction
              </h2>
              <p>
                These Terms are governed by and construed in accordance with the
                laws of the Republic of South Africa. Any disputes arising from
                these Terms shall be subject to the exclusive jurisdiction of the
                courts of South Africa.
              </p>
            </section>

            <section>
              <h2
                className="text-2xl font-bold text-[#071426] mb-3 mt-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                14. Changes to These Terms
              </h2>
              <p>
                We reserve the right to update these Terms at any time. We will
                notify you of material changes via email or a prominent notice
                within the Service at least 14 days before the changes take
                effect. Your continued use of the Service after the effective
                date constitutes your acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2
                className="text-2xl font-bold text-[#071426] mb-3 mt-8"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                15. Contact Us
              </h2>
              <p>
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="mt-3 p-4 bg-[#071426]/5 rounded-xl border border-[#071426]/10">
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
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
