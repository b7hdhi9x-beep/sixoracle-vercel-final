"use client";

import dynamic from "next/dynamic";

const LegalContent = dynamic(() => import("@/components/LegalContent"), { ssr: false });

export default function LegalPage() {
  return <LegalContent />;
}
