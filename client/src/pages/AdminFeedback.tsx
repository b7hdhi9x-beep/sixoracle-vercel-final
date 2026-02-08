import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Link } from "wouter";
import { 
  ArrowLeft, Star, Check, X, Eye, EyeOff, Flag, Loader2, Globe, Monitor, User, 
  Ban, MessageSquare, BarChart3, Send, Trash2, Shield, AlertTriangle
} from "lucide-react";

type FeedbackStatus = "pending" | "approved" | "rejected" | "hidden";

const statusLabels: Record<FeedbackStatus, string> = {
  pending: "審査待ち",
  approved: "承認済み",
  rejected: "却下",
  hidden: "非表示",
};

const statusColors: Record<FeedbackStatus, string> = {
  pending: "bg-yellow-500/20 text-yellow-500",
  approved: "bg-green-500/20 text-green-500",
  rejected: "bg-red-500/20 text-red-500",
  hidden: "bg-gray-500/20 text-gray-500",
};

const categoryLabels: Record<string, string> = {
  praise: "お褒めの言葉",
  suggestion: "改善提案",
  bug_report: "バグ報告",
  feature_request: "機能リクエスト",
  other: "その他",
};

const languageLabels: Record<string, string> = {
  ja: "日本語",
  en: "英語",
  zh: "中国語",
  ko: "韓国語",
  es: "スペイン語",
  fr: "フランス語",
};

export default function AdminFeedback() {
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<number | null>(null);
  
  // Check for token in URL or sessionStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const storedToken = sessionStorage.getItem('adminToken');
    
    if (urlToken) {
      setToken(urlToken);
      sessionStorage.setItem('adminToken', urlToken);
    } else if (storedToken) {
      setToken(storedToken);
    } else {
      setIsChecking(false);
      setHasAccess(false);
    }
  }, []);
  
  // Validate token with server
  const tokenValidation = trpc.adminAccess.validateToken.useQuery(
    { token: token || "" },
    { enabled: !!token, retry: false }
  );
  
  // Handle token validation result
  useEffect(() => {
    if (tokenValidation.data !== undefined) {
      setHasAccess(tokenValidation.data.valid);
      setIsChecking(false);
      if (!tokenValidation.data.valid) {
        sessionStorage.removeItem('adminToken');
      }
    }
    if (tokenValidation.error) {
      setHasAccess(false);
      setIsChecking(false);
    }
  }, [tokenValidation.data, tokenValidation.error]);
  const [adminNote, setAdminNote] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [replyFeedbackId, setReplyFeedbackId] = useState<number | null>(null);
  const [blockType, setBlockType] = useState<"ip" | "user">("ip");
  const [blockValue, setBlockValue] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [activeTab, setActiveTab] = useState("feedbacks");
  
  const feedbackQuery = trpc.feedback.getAll.useQuery(undefined, {
    enabled: hasAccess,
  });
  
  const blockListQuery = trpc.feedback.getBlockList.useQuery(undefined, {
    enabled: hasAccess,
  });
  
  const statsQuery = trpc.feedback.getStats.useQuery(undefined, {
    enabled: hasAccess,
  });
  
  const updateStatusMutation = trpc.feedback.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("ステータスを更新しました");
      feedbackQuery.refetch();
      setSelectedFeedback(null);
      setAdminNote("");
    },
    onError: (error) => {
      toast.error("エラー", { description: error.message });
    },
  });
  
  const addBlockMutation = trpc.feedback.addBlock.useMutation({
    onSuccess: () => {
      toast.success("ブロックリストに追加しました");
      blockListQuery.refetch();
      setBlockValue("");
      setBlockReason("");
    },
    onError: (error) => {
      toast.error("エラー", { description: error.message });
    },
  });
  
  const removeBlockMutation = trpc.feedback.removeBlock.useMutation({
    onSuccess: () => {
      toast.success("ブロックを解除しました");
      blockListQuery.refetch();
    },
    onError: (error) => {
      toast.error("エラー", { description: error.message });
    },
  });
  
  const addReplyMutation = trpc.feedback.addReply.useMutation({
    onSuccess: () => {
      toast.success("返信を送信しました");
      setReplyMessage("");
      setReplyFeedbackId(null);
    },
    onError: (error) => {
      toast.error("エラー", { description: error.message });
    },
  });
  
  const deleteFeedbackMutation = trpc.feedback.delete.useMutation({
    onSuccess: () => {
      toast.success("フィードバックを削除しました");
      feedbackQuery.refetch();
    },
    onError: (error) => {
      toast.error("エラー", { description: error.message });
    },
  });
  
  const handleStatusChange = (id: number, status: FeedbackStatus, isApproved?: boolean) => {
    updateStatusMutation.mutate({
      id,
      status,
      isApproved,
      adminNote: adminNote || undefined,
    });
  };
  
  const handleFlag = (id: number, isFlagged: boolean) => {
    updateStatusMutation.mutate({
      id,
      status: "hidden",
      isFlagged,
      adminNote: adminNote || undefined,
    });
  };
  
  const handleAddBlock = () => {
    if (!blockValue.trim()) {
      toast.error("ブロック対象を入力してください");
      return;
    }
    addBlockMutation.mutate({
      blockType,
      blockValue: blockValue.trim(),
      reason: blockReason || undefined,
    });
  };
  
  const handleBlockFromFeedback = (feedback: any) => {
    if (feedback.ipAddress) {
      setBlockType("ip");
      setBlockValue(feedback.ipAddress);
      setBlockReason(`フィードバックID: ${feedback.id} からブロック`);
      setActiveTab("blocks");
    } else if (feedback.userId) {
      setBlockType("user");
      setBlockValue(feedback.userId.toString());
      setBlockReason(`フィードバックID: ${feedback.id} からブロック`);
      setActiveTab("blocks");
    }
  };
  
  const handleSendReply = () => {
    if (!replyFeedbackId || !replyMessage.trim()) {
      toast.error("返信内容を入力してください");
      return;
    }
    addReplyMutation.mutate({
      feedbackId: replyFeedbackId,
      message: replyMessage.trim(),
    });
  };
  
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // トークン認証が必要
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">ページが見つかりません</p>
            <Button asChild>
              <Link href="/">ホームに戻る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/admin?token=${token}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>管理者ダッシュボードに戻る</span>
          </Link>
          <h1 className="text-xl font-bold">意見箱管理</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="feedbacks" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              フィードバック
            </TabsTrigger>
            <TabsTrigger value="blocks" className="flex items-center gap-2">
              <Ban className="w-4 h-4" />
              ブロックリスト
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              統計
            </TabsTrigger>
          </TabsList>
          
          {/* ==================== FEEDBACKS TAB ==================== */}
          <TabsContent value="feedbacks">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">
                    {feedbackQuery.data?.filter(f => f.status === "pending").length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">審査待ち</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-500">
                    {feedbackQuery.data?.filter(f => f.status === "approved").length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">承認済み</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-red-500">
                    {feedbackQuery.data?.filter(f => f.isFlagged).length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">フラグ付き</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">
                    {feedbackQuery.data?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">合計</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Feedback List */}
            {feedbackQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : feedbackQuery.data && feedbackQuery.data.length > 0 ? (
              <div className="space-y-4">
                {feedbackQuery.data.map((feedback) => (
                  <FeedbackCard
                    key={feedback.id}
                    feedback={feedback}
                    selectedFeedback={selectedFeedback}
                    setSelectedFeedback={setSelectedFeedback}
                    adminNote={adminNote}
                    setAdminNote={setAdminNote}
                    handleStatusChange={handleStatusChange}
                    handleFlag={handleFlag}
                    handleBlockFromFeedback={handleBlockFromFeedback}
                    setReplyFeedbackId={setReplyFeedbackId}
                    setReplyMessage={setReplyMessage}
                    updateStatusMutation={updateStatusMutation}
                    deleteFeedbackMutation={deleteFeedbackMutation}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  まだフィードバックはありません
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* ==================== BLOCKS TAB ==================== */}
          <TabsContent value="blocks">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  新規ブロック追加
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <Select value={blockType} onValueChange={(v) => setBlockType(v as "ip" | "user")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ip">IPアドレス</SelectItem>
                      <SelectItem value="user">ユーザーID</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder={blockType === "ip" ? "例: 192.168.1.1" : "例: 123"}
                    value={blockValue}
                    onChange={(e) => setBlockValue(e.target.value)}
                  />
                  <Input
                    placeholder="ブロック理由（任意）"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                  />
                  <Button onClick={handleAddBlock} disabled={addBlockMutation.isPending}>
                    {addBlockMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Ban className="w-4 h-4 mr-2" />
                    )}
                    ブロック追加
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>ブロックリスト</CardTitle>
              </CardHeader>
              <CardContent>
                {blockListQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : blockListQuery.data && blockListQuery.data.length > 0 ? (
                  <div className="space-y-2">
                    {blockListQuery.data.map((block) => (
                      <div
                        key={block.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <Badge variant={block.blockType === "ip" ? "default" : "secondary"}>
                            {block.blockType === "ip" ? "IP" : "ユーザー"}
                          </Badge>
                          <code className="bg-background px-2 py-1 rounded text-sm">
                            {block.blockValue}
                          </code>
                          {block.reason && (
                            <span className="text-sm text-muted-foreground">
                              {block.reason}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(block.createdAt).toLocaleString("ja-JP")}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeBlockMutation.mutate({ id: block.id })}
                          disabled={removeBlockMutation.isPending}
                          className="text-red-500 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    ブロックリストは空です
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* ==================== STATS TAB ==================== */}
          <TabsContent value="stats">
            {statsQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : statsQuery.data ? (
              <div className="space-y-8">
                {/* Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-4xl font-bold">{statsQuery.data.total}</p>
                      <p className="text-sm text-muted-foreground">総フィードバック数</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                        <span className="text-4xl font-bold">{statsQuery.data.averageRating}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">平均評価</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-4xl font-bold text-green-500">
                        {statsQuery.data.statusStats.approved}
                      </p>
                      <p className="text-sm text-muted-foreground">承認済み</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-4xl font-bold text-yellow-500">
                        {statsQuery.data.statusStats.pending}
                      </p>
                      <p className="text-sm text-muted-foreground">審査待ち</p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Category Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>カテゴリ別統計</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(statsQuery.data.categoryStats).map(([category, count]) => (
                        <div key={category} className="flex items-center gap-4">
                          <span className="w-32 text-sm">{categoryLabels[category]}</span>
                          <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{
                                width: `${statsQuery.data!.total > 0 ? (count / statsQuery.data!.total) * 100 : 0}%`,
                              }}
                            />
                          </div>
                          <span className="w-12 text-right text-sm font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Rating Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>評価別統計</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-4">
                          <div className="w-32 flex items-center gap-1">
                            {[...Array(rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                            <div
                              className="h-full bg-yellow-400 transition-all"
                              style={{
                                width: `${statsQuery.data!.total > 0 ? (statsQuery.data!.ratingStats[rating] / statsQuery.data!.total) * 100 : 0}%`,
                              }}
                            />
                          </div>
                          <span className="w-12 text-right text-sm font-medium">
                            {statsQuery.data!.ratingStats[rating]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Language Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>言語別統計</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(statsQuery.data.languageStats).map(([lang, count]) => (
                        <div key={lang} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <span>{languageLabels[lang] || lang.toUpperCase()}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Monthly Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>月別推移（過去6ヶ月）</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-2 h-40">
                      {Object.entries(statsQuery.data.monthlyStats).map(([month, count]) => {
                        const maxCount = Math.max(...Object.values(statsQuery.data!.monthlyStats), 1);
                        const height = (count / maxCount) * 100;
                        return (
                          <div key={month} className="flex-1 flex flex-col items-center gap-2">
                            <div
                              className="w-full bg-primary rounded-t transition-all"
                              style={{ height: `${height}%`, minHeight: count > 0 ? "8px" : "0" }}
                            />
                            <span className="text-xs text-muted-foreground">{month.split("-")[1]}月</span>
                            <span className="text-xs font-medium">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
        
        {/* Reply Dialog */}
        <Dialog open={replyFeedbackId !== null} onOpenChange={(open) => !open && setReplyFeedbackId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>フィードバックに返信</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="返信内容を入力してください..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                ※ ユーザーの言語が日本語以外の場合、自動的に翻訳されます
              </p>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">キャンセル</Button>
              </DialogClose>
              <Button onClick={handleSendReply} disabled={addReplyMutation.isPending}>
                {addReplyMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                送信
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

// Feedback Card Component
function FeedbackCard({
  feedback,
  selectedFeedback,
  setSelectedFeedback,
  adminNote,
  setAdminNote,
  handleStatusChange,
  handleFlag,
  handleBlockFromFeedback,
  setReplyFeedbackId,
  setReplyMessage,
  updateStatusMutation,
  deleteFeedbackMutation,
}: any) {
  const repliesQuery = trpc.feedback.getReplies.useQuery(
    { feedbackId: feedback.id },
    { enabled: false }
  );
  const [showReplies, setShowReplies] = useState(false);
  
  const loadReplies = () => {
    setShowReplies(true);
    repliesQuery.refetch();
  };
  
  return (
    <Card className={feedback.isFlagged ? "border-red-500/50" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{categoryLabels[feedback.category]}</Badge>
            <Badge className={statusColors[feedback.status as FeedbackStatus]}>
              {statusLabels[feedback.status as FeedbackStatus]}
            </Badge>
            {feedback.isFlagged && (
              <Badge className="bg-red-500/20 text-red-500">
                <Flag className="w-3 h-3 mr-1" />
                フラグ
              </Badge>
            )}
            {feedback.isPublic && (
              <Badge variant="outline" className="text-blue-400">
                <Eye className="w-3 h-3 mr-1" />
                公開希望
              </Badge>
            )}
          </div>
          {feedback.rating && (
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < feedback.rating!
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span className="font-medium">{feedback.userName}</span>
            <span>•</span>
            <span>{feedback.language.toUpperCase()}</span>
            <span>•</span>
            <span>{new Date(feedback.createdAt).toLocaleString("ja-JP")}</span>
          </div>
          
          {/* Original message */}
          <div className="p-3 bg-muted/50 rounded-lg mb-2">
            <p className="text-sm text-muted-foreground mb-1">原文:</p>
            <p className="whitespace-pre-wrap">{feedback.message}</p>
          </div>
          
          {/* Translated message */}
          {feedback.messageTranslated && (
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <p className="text-sm text-blue-400 mb-1">日本語訳:</p>
              <p className="whitespace-pre-wrap">{feedback.messageTranslated}</p>
            </div>
          )}
          
          {/* Submitter tracking info (admin only) */}
          <div className="mt-2 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <p className="text-sm text-purple-400 mb-2 font-medium flex items-center gap-1">
              <User className="w-3 h-3" />
              投稿者情報（運営専用）
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">IP:</span>
                <code className="bg-background/50 px-2 py-0.5 rounded text-xs">
                  {(feedback as any).ipAddress || "不明"}
                </code>
              </div>
              <div className="flex items-start gap-2">
                <Monitor className="w-3 h-3 text-muted-foreground mt-1" />
                <span className="text-muted-foreground">UA:</span>
                <code className="bg-background/50 px-2 py-0.5 rounded text-xs break-all">
                  {(feedback as any).userAgent ? 
                    ((feedback as any).userAgent.length > 100 
                      ? (feedback as any).userAgent.substring(0, 100) + "..." 
                      : (feedback as any).userAgent)
                    : "不明"}
                </code>
              </div>
              {feedback.userId && (
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">ユーザーID:</span>
                  <code className="bg-background/50 px-2 py-0.5 rounded text-xs">
                    {feedback.userId}
                  </code>
                </div>
              )}
            </div>
          </div>
          
          {/* Admin note */}
          {feedback.adminNote && (
            <div className="mt-2 p-3 bg-yellow-500/10 rounded-lg">
              <p className="text-sm text-yellow-500 mb-1">管理者メモ:</p>
              <p className="text-sm">{feedback.adminNote}</p>
            </div>
          )}
          
          {/* Replies */}
          {showReplies && (
            <div className="mt-2 space-y-2">
              {repliesQuery.isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : repliesQuery.data && repliesQuery.data.length > 0 ? (
                repliesQuery.data.map((reply: any) => (
                  <div key={reply.id} className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center gap-2 text-sm text-green-400 mb-1">
                      <MessageSquare className="w-3 h-3" />
                      <span className="font-medium">{reply.adminName}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(reply.createdAt).toLocaleString("ja-JP")}
                      </span>
                    </div>
                    <p className="text-sm">{reply.message}</p>
                    {reply.messageTranslated && (
                      <p className="text-sm text-muted-foreground mt-1">
                        翻訳: {reply.messageTranslated}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
                  まだ返信はありません
                </p>
              )}
            </div>
          )}
        </div>
        
        {/* Actions */}
        {selectedFeedback === feedback.id ? (
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
            <Textarea
              placeholder="管理者メモ（任意）"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={2}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => handleStatusChange(feedback.id, "approved", true)}
                disabled={updateStatusMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-1" />
                承認（公開）
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange(feedback.id, "approved", false)}
                disabled={updateStatusMutation.isPending}
              >
                <Check className="w-4 h-4 mr-1" />
                承認（非公開）
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleStatusChange(feedback.id, "rejected", false)}
                disabled={updateStatusMutation.isPending}
              >
                <X className="w-4 h-4 mr-1" />
                却下
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFlag(feedback.id, true)}
                disabled={updateStatusMutation.isPending}
                className="text-red-500 hover:text-red-400"
              >
                <Flag className="w-4 h-4 mr-1" />
                フラグ
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedFeedback(null);
                  setAdminNote("");
                }}
              >
                キャンセル
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedFeedback(feedback.id)}
            >
              アクション
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setReplyFeedbackId(feedback.id);
                setReplyMessage("");
              }}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              返信
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={loadReplies}
            >
              <Eye className="w-4 h-4 mr-1" />
              返信を見る
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBlockFromFeedback(feedback)}
              className="text-red-500 hover:text-red-400"
            >
              <Ban className="w-4 h-4 mr-1" />
              ブロック
            </Button>
            {feedback.status === "approved" && feedback.isApproved && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleStatusChange(feedback.id, "hidden", false)}
                disabled={updateStatusMutation.isPending}
              >
                <EyeOff className="w-4 h-4 mr-1" />
                非表示にする
              </Button>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  className="ml-2"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  削除
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>フィードバックを削除</DialogTitle>
                </DialogHeader>
                <p className="text-muted-foreground">
                  このフィードバックを完全に削除します。この操作は取り消すことができません。
                </p>
                <p className="text-sm text-muted-foreground">
                  ※ ユーザーには通知されません
                </p>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">キャンセル</Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={() => deleteFeedbackMutation.mutate({ id: feedback.id })}
                    disabled={deleteFeedbackMutation.isPending}
                  >
                    {deleteFeedbackMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-1" />
                    )}
                    削除する
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
