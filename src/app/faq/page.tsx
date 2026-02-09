"use client";
import dynamic from "next/dynamic";
const FAQContent = dynamic(() => import("@/components/FAQContent"), { ssr: false });
export default function FAQPage() {
  return <FAQContent />;
}
