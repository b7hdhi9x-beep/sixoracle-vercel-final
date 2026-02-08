"use client";

import dynamic from "next/dynamic";

const PrivacyContent = dynamic(() => import("@/components/PrivacyContent"), { ssr: false });

export default function PrivacyPage() {
  return <PrivacyContent />;
}
