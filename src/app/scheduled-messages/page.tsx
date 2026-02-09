"use client";
import dynamic from "next/dynamic";

const ScheduledMessagesContent = dynamic(() => import("@/components/ScheduledMessagesContent"), { ssr: false });

export default function ScheduledMessagesPage() {
  return <ScheduledMessagesContent />;
}
