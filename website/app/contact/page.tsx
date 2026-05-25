import type { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = {
  title: "Contact — AEFORYN",
  description:
    "Get in touch with the AEFORYN team. Send us a message or email us directly at hello@aeforyn.com.",
  openGraph: {
    title: "Contact — AEFORYN",
    description: "Reach out to the AEFORYN team. We'd love to hear from you.",
    url: "https://aeforyn.com/contact",
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
