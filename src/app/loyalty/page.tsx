"use client";
import dynamic from "next/dynamic";

const LoyaltyContent = dynamic(() => import("@/components/LoyaltyContent"), { ssr: false });

export default function LoyaltyPage() {
  return <LoyaltyContent />;
}
