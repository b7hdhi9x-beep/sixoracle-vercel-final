"use client";
import dynamic from "next/dynamic";
const FeedbackContent = dynamic(() => import("@/components/FeedbackContent"), { ssr: false });
export default function FeedbackPage() {
  return <FeedbackContent />;
}
