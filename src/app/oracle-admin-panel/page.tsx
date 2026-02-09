"use client";
import dynamic from "next/dynamic";
const AdminPanelContent = dynamic(() => import("@/components/AdminPanelContent"), { ssr: false });

export default function OracleAdminPanelPage() {
  return <AdminPanelContent />;
}
