"use client";
import dynamic from "next/dynamic";

const LoginHistoryContent = dynamic(() => import("@/components/LoginHistoryContent"), { ssr: false });

export default function LoginHistoryPage() {
  return <LoginHistoryContent />;
}
