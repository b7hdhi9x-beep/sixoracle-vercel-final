"use client";

import AdminDashboard from "@/components/AdminDashboard";
import { Suspense } from "react";

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center mystical-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold" />
      </div>
    }>
      <AdminDashboard />
    </Suspense>
  );
}
