"use client";
import dynamic from "next/dynamic";
const HelpContent = dynamic(() => import("@/components/HelpContent"), { ssr: false });
export default function HelpPage() {
  return <HelpContent />;
}
