"use client";
import dynamic from "next/dynamic";
const OracleProfileContent = dynamic(() => import("@/components/OracleProfileContent"), { ssr: false });

export default function OracleProfilePage() {
  return <OracleProfileContent />;
}
