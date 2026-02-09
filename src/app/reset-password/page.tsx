
'use client';
import dynamic from 'next/dynamic';

const ResetPasswordContent = dynamic(
  () => import('@/components/ResetPasswordContent'),
  { ssr: false }
);

export default function ResetPasswordPage() {
  return <ResetPasswordContent />;
}
