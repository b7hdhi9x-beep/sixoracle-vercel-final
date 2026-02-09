"use client";
import dynamic from "next/dynamic";
const HistoryContent = dynamic(() => import("@/components/HistoryContent"), { ssr: false });
export default function HistoryPage() { return <HistoryContent />; }
