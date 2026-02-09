"use client";
import dynamic from "next/dynamic";

const SubscriptionContent = dynamic(() => import("@/components/SubscriptionContent"), { ssr: false });

export default function SubscriptionPage() {
  return <SubscriptionContent />;
}
