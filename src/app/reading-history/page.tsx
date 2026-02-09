"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const ReadingHistoryContent = dynamic(() => import("@/components/ReadingHistoryContent"), { ssr: false });

function ReadingHistoryPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ReadingHistoryContent />
        </Suspense>
    );
}

export default ReadingHistoryPage;
