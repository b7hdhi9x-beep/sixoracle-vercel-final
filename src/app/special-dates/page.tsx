"use client";
import dynamic from "next/dynamic";

const SpecialDatesContent = dynamic(() => import("@/components/SpecialDatesContent"), { ssr: false });

export default function SpecialDatesPage() {
  return <SpecialDatesContent />;
}
