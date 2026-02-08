"use client";

import dynamic from "next/dynamic";

const LoginContent = dynamic(() => import("@/components/LoginContent"), { ssr: false });

export default function LoginPage() {
  return <LoginContent />;
}
