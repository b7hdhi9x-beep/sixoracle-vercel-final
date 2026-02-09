"use client";

import Link from "next/link";
import { Moon, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen mystical-bg flex items-center justify-center px-4">
      <div className="text-center">
        <Moon className="w-16 h-16 text-amber-400 mx-auto mb-6" />
        <h1 className="text-6xl font-serif font-bold gradient-text mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">
          お探しのページは見つかりませんでした
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}
