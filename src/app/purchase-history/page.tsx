"use client";
import dynamic from "next/dynamic";

const PurchaseHistoryContent = dynamic(() => import("@/components/PurchaseHistoryContent"), { ssr: false });

export default function PurchaseHistoryPage() {
  return <PurchaseHistoryContent />;
}
