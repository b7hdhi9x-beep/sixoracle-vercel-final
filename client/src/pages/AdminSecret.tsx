import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * 管理者専用の秘密URL
 * このページにアクセスすると、自動的に管理者画面にリダイレクトします
 * 認証チェックは管理者画面側で行われます
 */
export default function AdminSecret() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // 管理者画面にリダイレクト
    setLocation("/admin");
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">管理者画面に移動中...</p>
      </div>
    </div>
  );
}
