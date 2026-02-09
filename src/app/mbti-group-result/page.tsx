"use client";
import dynamic from "next/dynamic";

// Assuming the component is placed in the conventional `components` directory
const MBTIGroupResultContent = dynamic(() => import("@/components/MBTIGroupResultContent"), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] text-white font-serif">読み込み中...</div>
});

export default function MBTIGroupResultPage() {
  return <MBTIGroupResultContent />;
}
