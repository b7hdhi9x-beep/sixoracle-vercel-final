"use client";
import dynamic from "next/dynamic";

const CouponContent = dynamic(() => import("@/components/CouponContent"), { ssr: false });

export default function CouponPage() {
  return <CouponContent />;
}
