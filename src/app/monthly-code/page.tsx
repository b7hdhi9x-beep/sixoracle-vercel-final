"use client";
import dynamic from "next/dynamic";

const MonthlyCodeContent = dynamic(() => import("@/components/MonthlyCodeContent"), { ssr: false });

export default function MonthlyCodePage() {
  return <MonthlyCodeContent />;
}
