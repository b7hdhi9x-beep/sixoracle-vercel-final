
"use client";
import dynamic from "next/dynamic";

const ForgotPasswordContent = dynamic(() => import("@/components/ForgotPasswordContent"), { ssr: false });

export default function ForgotPasswordPage() {
  return <ForgotPasswordContent />;
}
