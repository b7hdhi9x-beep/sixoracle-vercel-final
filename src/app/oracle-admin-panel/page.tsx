"use client";

import AdminPanelContent from "@/components/AdminPanelContent";
import { Suspense } from "react";

export default function OracleAdminPanelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center mystical-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500" />
      </div>
    }>
      <AdminPanelContent />
    </Suspense>
  );
}
