import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ArrowLeft, Receipt, CreditCard, Sparkles, Users, RefreshCw, Loader2, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Link } from "wouter";

// Oracle name mapping
const oracleNames: Record<string, string> = {
  soma: "蒼真",
  reiran: "玲蘭",
  sakuya: "朔夜",
  akari: "灯",
  yui: "結衣",
  gen: "玄",
  shion: "紫苑",
  seiran: "星蘭",
  tsukuyo: "月夜",
  hikaru: "光",
  rin: "凛",
  kaze: "風雅",
};

// Purchase type labels
const typeLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  reading_recovery: {
    label: "回数回復",
    icon: <RefreshCw className="w-4 h-4" />,
    color: "text-green-400",
  },
  additional_oracle: {
    label: "追加占い師",
    icon: <Users className="w-4 h-4" />,
    color: "text-purple-400",
  },
  premium_subscription: {
    label: "プレミアム加入",
    icon: <Sparkles className="w-4 h-4" />,
    color: "text-amber-400",
  },
  premium_upgrade: {
    label: "プランアップグレード",
    icon: <Sparkles className="w-4 h-4" />,
    color: "text-amber-400",
  },
};

// Status labels
const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "処理中", color: "text-yellow-400" },
  completed: { label: "完了", color: "text-green-400" },
  failed: { label: "失敗", color: "text-red-400" },
  refunded: { label: "返金済", color: "text-blue-400" },
};

export default function PurchaseHistory() {
  const { data: history, isLoading: historyLoading } = trpc.purchase.getHistory.useQuery();
  const { data: summary, isLoading: summaryLoading } = trpc.purchase.getSummary.useQuery();
  const generatePdfMutation = trpc.purchase.generatePdf.useMutation();
  const [isDownloading, setIsDownloading] = useState(false);

  const isLoading = historyLoading || summaryLoading;

  const handleDownloadCsv = async () => {
    if (!history || history.length === 0) {
      toast.error("ダウンロードする購入履歴がありません");
      return;
    }

    setIsDownloading(true);
    try {
      const result = await generatePdfMutation.mutateAsync({});
      
      // Download the file
      const link = document.createElement("a");
      link.href = result.downloadUrl;
      link.download = result.filename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("購入履歴をダウンロードしました");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("ダウンロードに失敗しました");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/subscription">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold">購入履歴</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white">
                    ¥{summary?.totalSpent?.toLocaleString() || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">総購入額</div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {summary?.recoveryCount || 0}回
                  </div>
                  <div className="text-xs text-muted-foreground">回数回復</div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {summary?.oracleCount || 0}人
                  </div>
                  <div className="text-xs text-muted-foreground">追加占い師</div>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-amber-400">
                    {summary?.subscriptionCount || 0}回
                  </div>
                  <div className="text-xs text-muted-foreground">サブスク</div>
                </CardContent>
              </Card>
            </div>

            {/* Purchase History List */}
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    購入明細
                  </CardTitle>
                  {history && history.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadCsv}
                      disabled={isDownloading}
                      className="gap-2"
                    >
                      {isDownloading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      CSVダウンロード
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <FileText className="w-3 h-3 inline mr-1" />
                  確定申告や経費精算にご利用いただけます
                </p>
              </CardHeader>
              <CardContent>
                {!history || history.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>購入履歴はまだありません</p>
                    <p className="text-sm mt-2">回数回復や追加占い師を購入すると、ここに表示されます</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((purchase) => {
                      const typeInfo = typeLabels[purchase.type] || {
                        label: purchase.type,
                        icon: <CreditCard className="w-4 h-4" />,
                        color: "text-white",
                      };
                      const statusInfo = statusLabels[purchase.status] || {
                        label: purchase.status,
                        color: "text-white",
                      };

                      return (
                        <div
                          key={purchase.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full bg-white/10 ${typeInfo.color}`}>
                              {typeInfo.icon}
                            </div>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {typeInfo.label}
                                {purchase.oracleId && (
                                  <span className="text-sm text-muted-foreground">
                                    ({oracleNames[purchase.oracleId] || purchase.oracleId})
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(purchase.createdAt), "yyyy年M月d日 HH:mm", { locale: ja })}
                              </div>
                              {purchase.description && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {purchase.description}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">¥{purchase.amount.toLocaleString()}</div>
                            <div className={`text-xs ${statusInfo.color}`}>{statusInfo.label}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Back to Subscription */}
            <div className="mt-8 text-center">
              <Link href="/subscription">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  プラン・お支払いに戻る
                </Button>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
