"use client";
import dynamic from "next/dynamic";
const MessageSettingsContent = dynamic(() => import("@/components/MessageSettingsContent"), { ssr: false });
export default function MessageSettingsPage() { return <MessageSettingsContent />; }
