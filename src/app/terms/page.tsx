"use client";

import dynamic from "next/dynamic";

const TermsContent = dynamic(() => import("@/components/TermsContent"), { ssr: false });

export default function TermsPage() {
  return <TermsContent />;
}
