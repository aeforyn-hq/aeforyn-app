import type { Metadata } from "next";
import PricingPageClient from "./PricingPageClient";

export const metadata: Metadata = {
  title: "Pricing — AEFORYN",
  description:
    "Simple, transparent pricing. Free plan available. Creator $29/mo, Pro $49/mo, Agency $99/mo. All plans in USD or ZAR.",
  openGraph: {
    title: "Pricing — AEFORYN",
    description:
      "Simple, transparent pricing for creators, freelancers, and agencies.",
    url: "https://aeforyn.com/pricing",
  },
};

export default function PricingPage() {
  return <PricingPageClient />;
}
