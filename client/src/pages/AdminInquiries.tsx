import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Moon, ArrowLeft, Mail, Clock, User, Globe, Send, Loader2, CheckCircle, AlertCircle, MessageSquare, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type InquiryStatus = "new" | "in_progress" | "resolved" | "closed";

const statusLabels: Record<InquiryStatus, string> = {
  new: "新規",
  in_progress: "対応中",
  resolved: "解決済み",
  closed: "クローズ",
};

const statusColors: Record<InquiryStatus, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  in_progress: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  resolved: "bg-green-500/20 text-green-400 border-green-500/30",
  closed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const categoryLabels: Record<string, string> = {
  general: "一般",
  payment: "支払い",
  subscription: "サブスク",
  technical: "技術",
  feedback: "フィードバック",
  other: "その他",
};

export default function AdminInquiries() {
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<number | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
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

  const { data: inquiries, isLoading, refetch } = trpc.contact.getAll.useQuery(undefined, {
    enabled: hasAccess,
  });

  const { data: inquiryDetail, isLoading: isDetailLoading } = trpc.contact.getById.useQuery(
    { id: selectedInquiry! },
    { enabled: selectedInquiry !== null }
  );

  const updateStatusMutation = trpc.contact.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("ステータスを更新しました");
      refetch();
    },
    onError: () => {
      toast.error("ステータスの更新に失敗しました");
    },
  });

  const replyMutation = trpc.contact.reply.useMutation({
    onSuccess: (data) => {
      toast.success("返信を送信しました");
      setReplyMessage("");
      refetch();
      if (data.translatedMessage) {
        toast.info("英語に翻訳して送信しました");
      }
    },
    onError: () => {
      toast.error("返信の送信に失敗しました");
    },
  });

  const handleStatusChange = (inquiryId: number, status: InquiryStatus) => {
    updateStatusMutation.mutate({ id: inquiryId, status });
  };

  const handleReply = () => {
    if (!selectedInquiry || !replyMessage.trim()) return;
    replyMutation.mutate({
      inquiryId: selectedInquiry,
      message: replyMessage,
    });
  };

  const openDetail = (inquiryId: number) => {
    setSelectedInquiry(inquiryId);
    setIsDialogOpen(true);
    setReplyMessage("");
  };

  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  // トークン認証が必要
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">ページが見つかりません</h1>
          <p className="text-muted-foreground mb-4">お探しのページは存在しないか、移動した可能性があります。</p>
          <Link href="/">
            <Button className="btn-admin-primary">ホームに戻る</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-white/5">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/admin?token=${token}`} className="flex items-center gap-2">
            <Moon className="w-6 h-6 text-white" />
            <span className="text-xl font-serif font-bold tracking-widest text-white">
              六神ノ間
            </span>
          </Link>
          <Link href={`/admin?token=${token}`}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              管理者ダッシュボードに戻る
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-serif text-white mb-8">問い合わせ管理</h1>

          {/* Inquiries List */}
          <div className="space-y-4">
            {inquiries?.length === 0 ? (
              <div className="glass-card-admin rounded-lg p-12 text-center">
                <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">問い合わせはまだありません</p>
              </div>
            ) : (
              inquiries?.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="glass-card-admin rounded-lg p-6 hover:border-admin-primary/30 transition-colors cursor-pointer"
                  onClick={() => openDetail(inquiry.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={statusColors[inquiry.status as InquiryStatus]}>
                          {statusLabels[inquiry.status as InquiryStatus]}
                        </Badge>
                        <Badge variant="outline" className="border-white/20">
                          {categoryLabels[inquiry.category]}
                        </Badge>
                        <Badge variant="outline" className="border-white/20">
                          <Globe className="w-3 h-3 mr-1" />
                          {inquiry.language === "ja" ? "日本語" : "English"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {inquiry.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {inquiry.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(inquiry.createdAt).toLocaleString("ja-JP")}
                        </span>
                      </div>
                      <p className="text-sm line-clamp-2">
                        {inquiry.messageTranslated || inquiry.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={inquiry.status}
                        onValueChange={(value) => {
                          handleStatusChange(inquiry.id, value as InquiryStatus);
                        }}
                      >
                        <SelectTrigger 
                          className="w-32 bg-white/5 border-white/10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">新規</SelectItem>
                          <SelectItem value="in_progress">対応中</SelectItem>
                          <SelectItem value="resolved">解決済み</SelectItem>
                          <SelectItem value="closed">クローズ</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-admin-primary/30 hover:bg-admin-primary/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetail(inquiry.id);
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        返信
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">問い合わせ詳細</DialogTitle>
            <DialogDescription>
              問い合わせ内容を確認し、返信を送信できます
            </DialogDescription>
          </DialogHeader>

          {isDetailLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
          ) : inquiryDetail ? (
            <div className="space-y-6">
              {/* Inquiry Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge className={statusColors[inquiryDetail.inquiry.status as InquiryStatus]}>
                    {statusLabels[inquiryDetail.inquiry.status as InquiryStatus]}
                  </Badge>
                  <Badge variant="outline" className="border-white/20">
                    {categoryLabels[inquiryDetail.inquiry.category]}
                  </Badge>
                  <Badge variant="outline" className="border-white/20">
                    <Globe className="w-3 h-3 mr-1" />
                    {inquiryDetail.inquiry.language === "ja" ? "日本語" : "English"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">お名前:</span>
                    <p className="font-medium">{inquiryDetail.inquiry.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">メール:</span>
                    <p className="font-medium">{inquiryDetail.inquiry.email}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">受信日時:</span>
                    <p className="font-medium">
                      {new Date(inquiryDetail.inquiry.createdAt).toLocaleString("ja-JP")}
                    </p>
                  </div>
                </div>

                {/* Original Message */}
                <div className="glass-card-admin rounded-lg p-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    問い合わせ内容
                    {inquiryDetail.inquiry.language !== "ja" && " (原文)"}
                  </h4>
                  <p className="whitespace-pre-wrap">{inquiryDetail.inquiry.message}</p>
                </div>

                {/* Translated Message */}
                {inquiryDetail.inquiry.messageTranslated && (
                  <div className="glass-card-admin rounded-lg p-4 border-admin-primary/20">
                    <h4 className="text-sm font-medium text-white mb-2">
                      日本語訳
                    </h4>
                    <p className="whitespace-pre-wrap">{inquiryDetail.inquiry.messageTranslated}</p>
                  </div>
                )}
              </div>

              {/* Previous Replies */}
              {inquiryDetail.replies.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">返信履歴</h4>
                  {inquiryDetail.replies.map((reply) => (
                    <div key={reply.id} className="glass-card-admin rounded-lg p-4 border-green-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">
                          {new Date(reply.sentAt).toLocaleString("ja-JP")}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap mb-2">{reply.message}</p>
                      {reply.messageTranslated && (
                        <div className="mt-2 pt-2 border-t border-white/10">
                          <p className="text-xs text-muted-foreground mb-1">送信された翻訳:</p>
                          <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                            {reply.messageTranslated}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">返信を送信</h4>
                {inquiryDetail.inquiry.language !== "ja" && (
                  <p className="text-xs text-white">
                    ※ 日本語で入力すると、自動的に英語に翻訳されて送信されます
                  </p>
                )}
                <Textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="返信内容を入力してください..."
                  rows={4}
                  className="bg-white/5 border-white/10 resize-none"
                />
                <Button
                  onClick={handleReply}
                  disabled={!replyMessage.trim() || replyMutation.isPending}
                  className="btn-admin-primary w-full"
                >
                  {replyMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      送信中...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      返信を送信
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
