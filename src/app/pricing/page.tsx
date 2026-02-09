"use client";
import dynamic from "next/dynamic";
const PricingContent = dynamic(() => import("@/components/PricingContent"), { ssr: false });

export default function PricingPage() {
  return <PricingContent />;
}
