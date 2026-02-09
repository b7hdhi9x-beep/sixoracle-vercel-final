"use client";
import dynamic from "next/dynamic";

const FavoritesContent = dynamic(() => import("@/components/FavoritesContent"), { ssr: false });

export default function FavoritesPage() {
  return <FavoritesContent />;
}
