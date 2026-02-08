import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Monitor, Smartphone, Tablet, Globe, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

// Device icon component
function DeviceIcon({ deviceType }: { deviceType: string | null }) {
  switch (deviceType) {
    case "mobile":
      return <Smartphone className="w-5 h-5" />;
    case "tablet":
      return <Tablet className="w-5 h-5" />;
    default:
      return <Monitor className="w-5 h-5" />;
  }
}

// Login method badge
function LoginMethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    email: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    phone: "bg-green-500/20 text-green-400 border-green-500/30",
    oauth: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  };

  const labels: Record<string, string> = {
    email: "メール",
    phone: "電話番号",
    oauth: "OAuth",
  };

  return (
    <span className={`px-2 py-0.5 text-xs rounded-full border ${colors[method] || "bg-gray-500/20 text-gray-400"}`}>
      {labels[method] || method}
    </span>
  );
}

export default function LoginHistory() {
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading, error } = trpc.auth.getLoginHistory.useQuery(
    { limit: 20 },
    { enabled: !!user }
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">ログインが必要です</p>
            <Link href="/login">
              <Button>ログイン</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">ログイン履歴</h1>
            <p className="text-sm text-muted-foreground">
              過去のログイン記録を確認できます
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <Card className="mb-6 border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="pt-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-500 mb-1">セキュリティのお知らせ</p>
              <p className="text-muted-foreground">
                身に覚えのないログインがある場合は、すぐにパスワードを変更してください。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Login History List */}
        {error ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-red-500">履歴の取得に失敗しました</p>
            </CardContent>
          </Card>
        ) : data?.history.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">ログイン履歴がありません</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {data?.history.map((entry, index) => (
              <Card key={entry.id} className={index === 0 ? "border-primary/30" : ""}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Device info */}
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${entry.success ? "bg-green-500/10" : "bg-red-500/10"}`}>
                        <DeviceIcon deviceType={entry.deviceType} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {entry.browser || "不明なブラウザ"}
                          </span>
                          <LoginMethodBadge method={entry.loginMethod} />
                          {index === 0 && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary border border-primary/30">
                              現在のセッション
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-0.5">
                          <p>{entry.os || "不明なOS"} • {entry.deviceType === "mobile" ? "モバイル" : entry.deviceType === "tablet" ? "タブレット" : "デスクトップ"}</p>
                          <div className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            <span>{entry.ipAddress}</span>
                            {entry.city && entry.country && (
                              <span>• {entry.city}, {entry.country}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Time and status */}
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 justify-end mb-1">
                        {entry.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className={entry.success ? "text-green-500" : "text-red-500"}>
                          {entry.success ? "成功" : "失敗"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground justify-end">
                        <Clock className="w-3 h-3" />
                        <span>
                          {format(new Date(entry.createdAt), "M月d日 HH:mm", { locale: ja })}
                        </span>
                      </div>
                      {entry.failureReason && (
                        <p className="text-xs text-red-400 mt-1">{entry.failureReason}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          最新20件のログイン履歴を表示しています
        </p>
      </div>
    </div>
  );
}
