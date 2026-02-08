import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { oracles, getOracleById } from "@/lib/oracles";
import { trpc } from "@/lib/trpc";
import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, Clock, Heart, Calculator, Lightbulb, Moon, Shield, Sparkles, Crown, LogOut, CreditCard, User, Bell, Settings, MessageSquare, Mail, ShieldCheck, Ticket, HelpCircle, Gift, Hand, Star, Camera, X, ImageIcon, RefreshCw, Key, Droplet, Cat, FileDown, Wand2, Maximize2, Calendar, ChevronDown, Trash2, PlusCircle, History, FileText, Pin, Search, Edit2, Archive, ArchiveRestore, Copy, Check, Brain, Users } from "lucide-react";
import MobileNav from "@/components/MobileNav";
import { NotificationBanner } from "@/components/NotificationBanner";
import { NotificationBell } from "@/components/NotificationBell";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { Streamdown } from "streamdown";
import { toast } from "sonner";
import { SocialShare } from "@/components/SocialShare";
import { FortuneResultCard } from "@/components/FortuneResultCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { AddToHomeScreenPrompt } from "@/components/AddToHomeScreenPrompt";
import { RecommendedOracles } from "@/components/RecommendedOracles";
import { VoiceInput } from "@/components/VoiceInput";
import { TextToSpeech } from "@/components/TextToSpeech";
import { VoiceHistory } from "@/components/VoiceHistory";

import { IntimacyDisplay } from "@/components/IntimacyDisplay";
import { useResetCountdown } from "@/hooks/useResetCountdown";
import { StampPicker } from "@/components/StampPicker";
import { ExpandableMessage } from "@/components/ExpandableMessage";
import { MBTIQuickTest } from "@/components/MBTIQuickTest";
import { ShinriMBTIFlow } from "@/components/ShinriMBTIFlow";
import { MBTICompatibilityChart } from "@/components/MBTICompatibilityChart";
import { MBTIFriendCompatibility } from "@/components/MBTIFriendCompatibility";
import { MBTIGroupCompatibility } from "@/components/MBTIGroupCompatibility";
import { MBTIHistoryDialog } from "@/components/MBTIHistoryDialog";
import { ReadingCompleteNotification } from "@/components/ReadingCompleteNotification";
import { OracleThinkingAnimation } from "@/components/OracleThinkingAnimation";
import { OracleFavoriteStar } from "@/components/OracleFavoriteStar";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { GuardianModeToggle } from "@/components/GuardianModeToggle";
import { LevelUpCelebration, useLevelUpDetection } from "@/components/LevelUpCelebration";
import { LoyaltyStatusWidget } from "@/components/LoyaltyStatusWidget";
import { DisplaySettings } from "@/components/DisplaySettings";
import { FortuneResultModal } from "@/components/FortuneResultModal";
import { useDisplaySettings } from "@/contexts/DisplaySettingsContext";

const iconMap: Record<string, any> = {
  Clock, Heart, Calculator, Lightbulb, Moon, Shield, Hand, Star, Droplet, Cat, Brain
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  oracleId?: string;
  timestamp: Date;
}

/**
 * 鑑定結果のセクションヘッダー（═══ 総合運 ═══ など）をMarkdownの見出しに変換
 * モバイルで読みやすいセクション分け表示を実現
 */
function formatFortuneContent(content: string): string {
  // ═══ セクション名 ═══ パターンを検出してMarkdownの見出しに変換
  return content.replace(/═{3,}\s*([^═]+?)\s*═{3,}/g, (_, sectionName) => {
    const trimmedName = sectionName.trim();
    return `\n\n## ${trimmedName}\n\n`;
  });
}

/**
 * 日付をフォーマットして表示用の文字列を返す
 * 今日・昨日は相対表示、それ以外は曜日付きで表示
 */
function formatDateForDivider(date: Date): string {
  const now = new Date();
  const jstDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  const jstNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  
  // 今日かどうか判定
  const isToday = jstDate.getFullYear() === jstNow.getFullYear() &&
                  jstDate.getMonth() === jstNow.getMonth() &&
                  jstDate.getDate() === jstNow.getDate();
  
  // 昨日かどうか判定
  const yesterday = new Date(jstNow);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = jstDate.getFullYear() === yesterday.getFullYear() &&
                      jstDate.getMonth() === yesterday.getMonth() &&
                      jstDate.getDate() === yesterday.getDate();
  
  if (isToday) {
    return "今日";
  }
  
  if (isYesterday) {
    return "昨日";
  }
  
  // 曜日の配列
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const weekday = weekdays[jstDate.getDay()];
  
  // 日付と曜日をフォーマット
  const dateStr = date.toLocaleDateString("ja-JP", {
    month: "long",
    day: "numeric",
    timeZone: "Asia/Tokyo",
  });
  
  return `${dateStr}（${weekday}）`;
}

/**
 * 2つの日付が同じ日かどうかを判定（JSTで比較）
 */
function isSameDay(date1: Date, date2: Date): boolean {
  const d1 = new Date(date1.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  const d2 = new Date(date2.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

// お気に入り占い師セクションコンポーネント
function FavoriteOraclesSection({ selectedOracle, onSelectOracle }: { selectedOracle: string | null; onSelectOracle: (oracleId: string) => void }) {
  const { data: favorites } = trpc.favorites.list.useQuery();
  
  if (!favorites || favorites.length === 0) return null;
  
  const favoriteOracleList = favorites
    .map(f => getOracleById(f.oracleId))
    .filter(Boolean) as import("@/lib/oracles").Oracle[];
  
  if (favoriteOracleList.length === 0) return null;
  
  return (
    <div className="mb-6">
      <h2 className="text-lg font-serif text-yellow-400 mb-3 flex items-center gap-2">
        <Star className="w-5 h-5 fill-yellow-400" />
        お気に入り
      </h2>
      <div className="space-y-2">
        {favoriteOracleList.map((o) => {
          const Icon = iconMap[o.icon];
          const isSelected = selectedOracle === o.id;
          return (
            <button
              key={`fav-${o.id}`}
              onClick={() => onSelectOracle(o.id)}
              className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all relative ${
                isSelected
                  ? 'bg-yellow-400/15 border-2 border-yellow-400/50 shadow-lg shadow-yellow-400/10'
                  : 'hover:bg-yellow-400/5 border border-yellow-400/20 hover:border-yellow-400/40'
              }`}
            >
              <Avatar className={`w-10 h-10 ${isSelected ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-background' : ''}`}>
                <AvatarImage src={o.image} alt={o.name} />
                <AvatarFallback className={`bg-gradient-to-br ${o.color}`}>
                  <Icon className="w-4 h-4 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="text-left flex-1">
                <div className="font-serif text-sm text-white flex items-center gap-1">
                  {o.name}
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="text-xs text-muted-foreground">{o.role}</div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="my-4 border-t border-border/20" />
    </div>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { t } = useLanguage();
  const { autoSaveFavorites } = useDisplaySettings();


  const [selectedOracle, setSelectedOracle] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  // 各占い師ごとのチャット履歴を保持するMap
  const [oracleMessages, setOracleMessages] = useState<Record<string, Message[]>>({});
  // 各占い師ごとのセッションIDを保持するMap
  const [oracleSessionIds, setOracleSessionIds] = useState<Record<string, number | null>>({});
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [palmImage, setPalmImage] = useState<{ file: File; preview: string } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedHand, setSelectedHand] = useState<'right' | 'left'>('right'); // 右手: 現在〜未来, 左手: 過去〜現在
  const [showLowReadingsAlert, setShowLowReadingsAlert] = useState(false);
  const [hasShownLowReadingsAlert, setHasShownLowReadingsAlert] = useState(false);
  const [showNoReadingsBlock, setShowNoReadingsBlock] = useState(false);
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [showTextPreview, setShowTextPreview] = useState(false);
  const [activationCodeInput, setActivationCodeInput] = useState("");
  const [isApplyingCode, setIsApplyingCode] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{
    previousLevel: number;
    newLevel: number;
    oracleId: string;
  } | null>(null);
  const [showClearHistoryDialog, setShowClearHistoryDialog] = useState(false);
  const [showSessionHistoryDialog, setShowSessionHistoryDialog] = useState(false);
  const [sessionSearchQuery, setSessionSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [selectedFortuneMessage, setSelectedFortuneMessage] = useState<Message | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  // 回答完了通知の状態
  const [showReadingNotification, setShowReadingNotification] = useState(false);
  // 心理占い師用MBTI診断フローの状態
  const [showShinriMBTIFlow, setShowShinriMBTIFlow] = useState(false);
  const [shinriMBTICompleted, setShinriMBTICompleted] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Request premium upgrade mutation
  const requestUpgradeMutation = trpc.subscription.requestPremiumUpgrade.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("アップグレード申請を送信しました！\n管理者の承認をお待ちください。");
        setShowActivationDialog(false);
      } else {
        toast.error(data.message || "申請に失敗しました");
      }
      setIsUpgrading(false);
    },
    onError: (error) => {
      toast.error(error.message || "エラーが発生しました");
      setIsUpgrading(false);
    },
  });

  // Apply activation code mutation - must be before any early returns
  const applyActivationCodeMutation = trpc.subscription.applyActivationCode.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        setShowActivationDialog(false);
        setActivationCodeInput("");
        // Refresh subscription data
        window.location.reload();
      } else {
        toast.error(data.message);
      }
      setIsApplyingCode(false);
    },
    onError: (error) => {
      toast.error(error.message || "エラーが発生しました");
      setIsApplyingCode(false);
    },
  });

  // Get user subscription status
  const { data: subscriptionData } = trpc.subscription.getStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  // Get daily usage
  const { data: usageData, refetch: refetchUsage } = trpc.chat.getDailyUsage.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  // Reset countdown hook - shows time until daily reset (midnight JST)
  const { timeUntilReset, isActive: isResetCountdownActive } = useResetCountdown({
    initialResetInfo: usageData?.resetInfo as any,
    onReset: () => {
      // Refetch usage data when reset occurs
      refetchUsage();
    },
  });
  
  // Get trial usage for selected oracle (for trial users)
  const { data: trialUsageData, refetch: refetchTrialUsage } = trpc.chat.getTrialUsageForOracle.useQuery(
    { oracleId: selectedOracle || '' },
    { enabled: isAuthenticated && !!selectedOracle && usageData?.planType === 'trial' }
  );
  
  // Get payment URL for external payment provider
  const { data: paymentUrlData } = trpc.subscription.getPaymentUrl.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Get readings recovery URL for free users
  const { data: recoveryData } = trpc.subscription.getReadingsRecoveryUrl.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Get selected oracle for free users
  const { data: selectedOracleData, refetch: refetchSelectedOracle } = trpc.subscription.getSelectedOracle.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Get latest MBTI result for Shinri flow
  const { data: latestMBTIData } = trpc.mbti.getLatest.useQuery(undefined, {
    enabled: isAuthenticated && selectedOracle === 'shinri',
  });

  // Load session messages when continuing from history
  const { data: loadedSessionData } = trpc.chat.getSessionMessages.useQuery(
    { sessionId: currentSessionId! },
    {
      enabled: !!currentSessionId && messages.length === 0,
    }
  );

  // Process loaded session data
  useEffect(() => {
    if (loadedSessionData && loadedSessionData.messages.length > 0 && messages.length === 0) {
      const loadedMessages: Message[] = loadedSessionData.messages.map((m: any) => ({
        id: m.id.toString(),
        role: m.role as "user" | "assistant",
        content: m.content,
        oracleId: loadedSessionData.session.oracleId,
        timestamp: new Date(m.createdAt),
      }));
      setMessages(loadedMessages);
      if (selectedOracle) {
        setOracleMessages(prev => ({
          ...prev,
          [selectedOracle]: loadedMessages
        }));
      }
    }
  }, [loadedSessionData, selectedOracle, messages.length]);

  // 占い師選択時にデータベースから履歴を読み込む
  const { data: oracleHistoryData, refetch: refetchOracleHistory } = trpc.chat.getOracleMessages.useQuery(
    { oracleId: selectedOracle || '', limit: 50 },
    { 
      enabled: isAuthenticated && !!selectedOracle && !oracleMessages[selectedOracle || '']?.length,
      staleTime: 0, // 常に最新データを取得
    }
  );

  // データベースから読み込んだ履歴を状態に反映
  useEffect(() => {
    if (oracleHistoryData && selectedOracle && !oracleMessages[selectedOracle]?.length) {
      if (oracleHistoryData.messages.length > 0) {
        const loadedMessages: Message[] = oracleHistoryData.messages.map((m: any) => ({
          id: m.id.toString(),
          role: m.role as "user" | "assistant",
          content: m.content,
          oracleId: m.oracleId,
          timestamp: new Date(m.timestamp),
        }));
        setMessages(loadedMessages);
        setOracleMessages(prev => ({
          ...prev,
          [selectedOracle]: loadedMessages
        }));
        if (oracleHistoryData.sessionId) {
          setCurrentSessionId(oracleHistoryData.sessionId);
          setOracleSessionIds(prev => ({
            ...prev,
            [selectedOracle]: oracleHistoryData.sessionId as number
          }));
        }
        // 履歴がある場合はMBTI診断フローを非表示
        if (selectedOracle === 'shinri') {
          setShowShinriMBTIFlow(false);
        }
      } else {
        // 心理占い師で履歴がない場合はMBTI診断フローを表示
        if (selectedOracle === 'shinri' && !shinriMBTICompleted['shinri']) {
          setShowShinriMBTIFlow(true);
        }
      }
    }
  }, [oracleHistoryData, selectedOracle, shinriMBTICompleted]);

  // Clear oracle history mutation
  const clearHistoryMutation = trpc.chat.clearOracleHistory.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("履歴をクリアしました");
        setMessages([]);
        setCurrentSessionId(null);
        if (selectedOracle) {
          setOracleMessages(prev => ({
            ...prev,
            [selectedOracle]: []
          }));
          setOracleSessionIds(prev => ({
            ...prev,
            [selectedOracle]: null
          }));
        }
      }
    },
    onError: (error) => {
      toast.error(error.message || "履歴のクリアに失敗しました");
    },
  });

  // Start new conversation mutation
  const startNewConversationMutation = trpc.chat.startNewConversation.useMutation({
    onSuccess: (data) => {
      if (data.success && data.sessionId) {
        setCurrentSessionId(data.sessionId);
        setMessages([]);
        if (selectedOracle) {
          setOracleSessionIds(prev => ({
            ...prev,
            [selectedOracle]: data.sessionId
          }));
          setOracleMessages(prev => ({
            ...prev,
            [selectedOracle]: []
          }));
        }
        toast.success("新しい会話を始めました");
        setShowSessionHistoryDialog(false);
      }
    },
    onError: (error) => {
      toast.error(error.message || "新しい会話の開始に失敗しました");
    },
  });

  // Get session list query
  const { data: sessionListData, refetch: refetchSessionList } = trpc.chat.getSessions.useQuery(
    { oracleId: selectedOracle || undefined, limit: 50, includeArchived: showArchived },
    { enabled: !!selectedOracle && showSessionHistoryDialog }
  );
  
  // Filter sessions by search query
  const filteredSessions = sessionListData?.filter(session => {
    if (!sessionSearchQuery.trim()) return true;
    const query = sessionSearchQuery.toLowerCase();
    return (
      session.title?.toLowerCase().includes(query) ||
      session.summary?.toLowerCase().includes(query)
    );
  });
  
  // Toggle pin mutation
  const togglePinMutation = trpc.chat.togglePinSession.useMutation({
    onSuccess: (data) => {
      refetchSessionList();
      toast.success(data.isPinned ? "ピン留めしました" : "ピン留めを解除しました");
    },
  });
  
  // Update session title mutation
  const updateTitleMutation = trpc.chat.updateSessionTitle.useMutation({
    onSuccess: () => {
      refetchSessionList();
      setEditingSessionId(null);
      toast.success("タイトルを更新しました");
    },
  });
  
  // Generate session title mutation
  const generateTitleMutation = trpc.chat.generateSessionTitle.useMutation({
    onSuccess: (data) => {
      if (data.success && data.title) {
        refetchSessionList();
        toast.success(`タイトルを生成しました: ${data.title}`);
      } else {
        toast.error("タイトルの生成に失敗しました");
      }
    },
  });
  
  // Toggle archive mutation
  const toggleArchiveMutation = trpc.chat.toggleArchiveSession.useMutation({
    onSuccess: (data) => {
      refetchSessionList();
      toast.success(data.isArchived ? "アーカイブしました" : "アーカイブを解除しました");
    },
  });
  
  // Bulk archive mutation
  const bulkArchiveMutation = trpc.chat.bulkArchiveSessions.useMutation({
    onSuccess: (data) => {
      refetchSessionList();
      toast.success(`${data.archivedCount}件の会話をアーカイブしました`);
    },
  });
  
  // Auto-archive mutation (runs on login)
  const runAutoArchiveMutation = trpc.chat.runAutoArchive.useMutation({
    onSuccess: (data) => {
      if (!data.skipped && data.archivedCount > 0) {
        toast.info(`${data.archivedCount}件の古い会話を自動アーカイブしました`);
      }
    },
  });
  
  // Run auto-archive on initial load
  const [hasRunAutoArchive, setHasRunAutoArchive] = useState(false);
  useEffect(() => {
    if (isAuthenticated && !hasRunAutoArchive) {
      runAutoArchiveMutation.mutate();
      setHasRunAutoArchive(true);
    }
  }, [isAuthenticated, hasRunAutoArchive]);
  
  // Bulk archive days options
  const [bulkArchiveDays, setBulkArchiveDays] = useState(30);
  const [showBulkArchiveConfirm, setShowBulkArchiveConfirm] = useState(false);
  
  // Render session item helper function
  const renderSessionItem = (session: typeof sessionListData extends (infer T)[] | undefined ? T : never) => {
    if (!session) return null;
    const isCurrentSession = session.id === currentSessionId;
    const sessionDate = new Date(session.updatedAt);
    const formatSessionDate = (date: Date) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const sessionDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      if (sessionDay.getTime() === today.getTime()) {
        return `今日 ${date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (sessionDay.getTime() === yesterday.getTime()) {
        return `昨日 ${date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
    };
    
    return (
      <div
        key={session.id}
        className={`relative group rounded-lg transition-colors ${
          isCurrentSession 
            ? 'bg-user-primary/20 border border-user-primary/30' 
            : 'hover:bg-white/5'
        }`}
      >
        {editingSessionId === session.id ? (
          <div className="p-3 flex items-center gap-2">
            <Input
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              className="flex-1 h-8 text-sm bg-white/10"
              placeholder="タイトルを入力..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateTitleMutation.mutate({ sessionId: session.id, title: editingTitle });
                } else if (e.key === 'Escape') {
                  setEditingSessionId(null);
                }
              }}
            />
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2"
              onClick={() => updateTitleMutation.mutate({ sessionId: session.id, title: editingTitle })}
            >
              保存
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2"
              onClick={() => setEditingSessionId(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-left h-auto py-3 pr-20"
            onClick={() => {
              if (!isCurrentSession) {
                setLoadingSessionId(session.id);
              } else {
                setShowSessionHistoryDialog(false);
              }
            }}
            disabled={isLoadingSession && loadingSessionId === session.id}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {session.isPinned && <Pin className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
                {session.isArchived && <Archive className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-white truncate">
                  {session.title || session.summary || `会話 #${session.id}`}
                </span>
                {isCurrentSession && (
                  <span className="text-xs bg-user-primary/30 text-user-primary px-2 py-0.5 rounded-full flex-shrink-0">
                    現在
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatSessionDate(sessionDate)}
              </div>
            </div>
          </Button>
        )}
        
        {/* Action buttons (visible on hover) */}
        {editingSessionId !== session.id && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation();
                togglePinMutation.mutate({ sessionId: session.id });
              }}
              title={session.isPinned ? "ピン留めを解除" : "ピン留め"}
            >
              <Pin className={`w-4 h-4 ${session.isPinned ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setEditingSessionId(session.id);
                setEditingTitle(session.title || '');
              }}
              title="タイトルを編集"
            >
              <Edit2 className="w-4 h-4 text-muted-foreground" />
            </Button>
            {!session.title && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  generateTitleMutation.mutate({ sessionId: session.id });
                }}
                disabled={generateTitleMutation.isPending}
                title="タイトルを自動生成"
              >
                <Wand2 className="w-4 h-4 text-muted-foreground" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleArchiveMutation.mutate({ sessionId: session.id });
              }}
              title={session.isArchived ? "アーカイブを解除" : "アーカイブ"}
            >
              {session.isArchived ? (
                <ArchiveRestore className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Archive className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        )}
      </div>
    );
  };

  // State for loading a specific session
  const [loadingSessionId, setLoadingSessionId] = useState<number | null>(null);
  
  // Get session messages query (for loading a specific session from history dialog)
  const { data: selectedSessionData, isLoading: isLoadingSession } = trpc.chat.getSessionMessages.useQuery(
    { sessionId: loadingSessionId! },
    { 
      enabled: loadingSessionId !== null,
      staleTime: 0,
    }
  );
  
  // Effect to handle loaded session data from history dialog
  useEffect(() => {
    if (selectedSessionData && loadingSessionId !== null) {
      const { session, messages: sessionMessages } = selectedSessionData;
      if (session && sessionMessages) {
        setCurrentSessionId(session.id);
        const loadedMessages: Message[] = sessionMessages.map((m) => ({
          id: m.id.toString(),
          role: m.role as "user" | "assistant",
          content: m.content,
          oracleId: m.oracleId || selectedOracle || "",
          timestamp: new Date(m.createdAt),
          imageUrl: m.imageUrl || undefined,
        }));
        setMessages(loadedMessages);
        if (selectedOracle) {
          setOracleSessionIds(prev => ({
            ...prev,
            [selectedOracle]: session.id
          }));
          setOracleMessages(prev => ({
            ...prev,
            [selectedOracle]: loadedMessages
          }));
        }
        setShowSessionHistoryDialog(false);
        toast.success("会話を読み込みました");
      }
      setLoadingSessionId(null);
    }
  }, [selectedSessionData, loadingSessionId, selectedOracle]);

  // Set selected oracle mutation
  const setSelectedOracleMutation = trpc.subscription.setSelectedOracle.useMutation({
    onSuccess: (data: any) => {
      if (data.success && data.message) {
        toast.success(data.message);
      } else if (!data.success && data.requiresPayment) {
        // Show purchase dialog
        toast.info(data.message);
        // Trigger purchase flow
        purchaseOracleMutation.mutate({ oracleId: data.oracleId });
      } else if (!data.success && data.message) {
        toast.error(data.message);
      }
      refetchSelectedOracle();
    },
    onError: (error) => {
      toast.error(error.message || "エラーが発生しました");
    },
  });

  // Purchase oracle mutation
  const purchaseOracleMutation = trpc.subscription.purchaseOracle.useMutation({
    onSuccess: (data) => {
      if (data.success && data.url) {
        toast.info(`300円で追加占い師を購入します`);
        window.open(data.url, '_blank');
      } else if (data.success && data.message) {
        toast.success(data.message);
        refetchSelectedOracle();
      } else if (!data.success && data.message) {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      toast.error(error.message || "購入に失敗しました");
    },
  });

  // PDF certificate generation mutation
  const generateCertificateMutation = trpc.chat.generateCertificate.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        // Open certificate in new tab
        window.open(data.url, '_blank');
        toast.success(t("dashboard", "certificateGenerated") || "鑑定書を生成しました");
      }
    },
    onError: (error) => {
      toast.error(error.message || "鑑定書の生成に失敗しました");
    },
  });

  // Omamori (charm) image generation mutation
  const generateOmamoriMutation = trpc.chat.generateOmamori.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        // Open omamori image in new tab
        window.open(data.url, '_blank');
        toast.success(`${data.oracleName}のお守りを生成しました\n「${data.blessing}」`);
      }
    },
    onError: (error) => {
      toast.error(error.message || "お守りの生成に失敗しました");
    },
  });

  // Image upload mutation for palm reading
  const uploadImageMutation = trpc.chat.uploadPalmImage.useMutation({
    onError: (error) => {
      toast.error(error.message || "画像のアップロードに失敗しました");
      setIsUploadingImage(false);
      setPalmImage(null);
    },
  });

  // Auto-save favorite mutation for automatic saving
  const autoSaveFavoriteMutation = trpc.chat.addFavorite.useMutation({
    onSuccess: () => {
      toast.success("鑑定結果を自動保存しました", {
        icon: "❤️",
        duration: 2000,
      });
    },
    onError: () => {
      // Silent fail for auto-save
      console.log("Auto-save favorite failed");
    },
  });

  // Chat mutation
  const chatMutation = trpc.chat.send.useMutation({
    onSuccess: (data) => {
      // Save sessionId for continuous conversation
      if (data.sessionId) {
        setCurrentSessionId(data.sessionId);
        // セッションIDを占い師ごとに保存
        if (selectedOracle) {
          setOracleSessionIds(prev => ({
            ...prev,
            [selectedOracle]: data.sessionId as number
          }));
        }
      }
      
      // Generate a unique message ID based on timestamp and session
      const messageId = data.messageId || Date.now();
      
      const newMessage = {
        id: messageId.toString(),
        role: "assistant" as const,
        content: data.response,
        oracleId: selectedOracle!,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newMessage]);
      // 占い師ごとのメッセージ履歴も更新
      if (selectedOracle) {
        setOracleMessages(prev => ({
          ...prev,
          [selectedOracle]: [...(prev[selectedOracle] || []), newMessage]
        }));
      }
      
      // Auto-save to favorites if enabled
      if (autoSaveFavorites && selectedOracle && data.messageId) {
        autoSaveFavoriteMutation.mutate({
          messageId: data.messageId,
          oracleId: selectedOracle,
          content: data.response,
        });
      }
      
      // ★ 回答完了通知 - 目立つフローティングバナーで知らせる ★
      setShowReadingNotification(true);
      
      refetchUsage();
      if (isTrialUser) {
        refetchTrialUsage();
      }
    },
    onError: (error) => {
      toast.error(error.message || "エラーが発生しました");
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });
  
  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      // Use smooth scrolling for better UX
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  // Auto scroll when loading state changes (for typing indicator)
  useEffect(() => {
    if (isLoading && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [isLoading]);

  // Handle mobile keyboard visibility - scroll input into view
  useEffect(() => {
    const handleFocus = () => {
      // Wait for keyboard to appear
      setTimeout(() => {
        if (inputAreaRef.current) {
          inputAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 300);
    };

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('focus', handleFocus);
      return () => textarea.removeEventListener('focus', handleFocus);
    }
  }, [selectedOracle]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  // Handle URL parameters for continuing conversation from history
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oracleParam = params.get('oracle');
    const sessionParam = params.get('session');
    
    if (oracleParam && sessionParam && isAuthenticated) {
      // Set the oracle and session from URL params
      setSelectedOracle(oracleParam);
      setCurrentSessionId(parseInt(sessionParam, 10));
      setOracleSessionIds(prev => ({
        ...prev,
        [oracleParam]: parseInt(sessionParam, 10)
      }));
      // Clear URL params after processing
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [isAuthenticated]);

  // Show low readings alert when remaining is 5 or less (for free users only)
  useEffect(() => {
    if (
      usageData &&
      !subscriptionData?.isPremium &&
      usageData.remaining <= 5 &&
      usageData.remaining > 0 &&
      !hasShownLowReadingsAlert
    ) {
      setShowLowReadingsAlert(true);
      setHasShownLowReadingsAlert(true);
    }
  }, [usageData, subscriptionData?.isPremium, hasShownLowReadingsAlert]);

  // Show no readings block when remaining is 0 (for free users only)
  useEffect(() => {
    if (
      usageData &&
      !subscriptionData?.isPremium &&
      usageData.remaining <= 0
    ) {
      setShowNoReadingsBlock(true);
    } else {
      setShowNoReadingsBlock(false);
    }
  }, [usageData, subscriptionData?.isPremium]);


  // Show loading spinner while checking authentication
  // This prevents any content from being shown before auth check completes
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background user-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-user-primary"></div>
      </div>
    );
  }
  
  // If not authenticated after loading, show nothing (redirect will happen)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background user-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-user-primary"></div>
      </div>
    );
  }
  
  const isPremium = subscriptionData?.isPremium || false;
  const isTrialUser = usageData?.planType === 'trial';
  
  // For premium users: unlimited
  // For trial users: 3 exchanges per oracle
  // For legacy free users: cumulative limit
  const usedReadings = usageData?.used || 0;
  const isUnlimited = usageData?.isUnlimited || (isPremium && usageData?.limit === -1);
  const totalLimit = isUnlimited ? -1 : (usageData?.limit || 3);
  
  // For trial users, use per-oracle remaining count
  const remainingToday = isTrialUser 
    ? (trialUsageData?.remaining ?? 3)
    : (usageData?.remaining || 0);
  const bonusReadings = usageData?.bonusReadings || 0;
  
  // Check if trial user has exceeded limit for current oracle
  const trialExceeded = isTrialUser && trialUsageData && trialUsageData.remaining <= 0;

  const handleApplyActivationCode = () => {
    if (!activationCodeInput.trim()) {
      toast.error("合言葉を入力してください");
      return;
    }
    setIsApplyingCode(true);
    applyActivationCodeMutation.mutate({ code: activationCodeInput.trim() });
  };

  const handleUpgrade = () => {
    setIsUpgrading(true);
    
    if (paymentUrlData?.isConfigured && paymentUrlData.url) {
      toast.info("決済ページへ移動します...");
      window.open(paymentUrlData.url, "_blank");
      setIsUpgrading(false);
    } else {
      // Send upgrade request to admin
      requestUpgradeMutation.mutate({ message: "プレミアムプランへのアップグレードを希望します" });
    }
  };

  const handleRecoveryPurchase = () => {
    if (recoveryData?.isConfigured && recoveryData.url) {
      const priceText = recoveryData.isFirstRecovery 
        ? `初回限定¥${recoveryData.price}で回数回復`
        : `¥${recoveryData.price}で回数回復`;
      toast.info(`決済ページへ移動します（${priceText}）...`);
      window.open(recoveryData.url, "_blank");
    } else {
      // Show activation code dialog for recovery as well
      setShowActivationDialog(true);
    }
  };

  // Handle file selection for palm reading
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error("JPEG、PNG、またはWebP形式の画像を選択してください");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("画像サイズは5MB以下にしてください");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setPalmImage({ file, preview });
    };
    reader.readAsDataURL(file);
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setPalmImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedOracle || isLoading) return;
    
    // Check if trial user has exceeded limit for this oracle
    if (isTrialUser && trialExceeded) {
      toast.error("この占い師との無料体験が終了しました。\n本格的な鑑定を楽しむにはプランへの登録が必要です。", {
        duration: 5000,
      });
      return;
    }
    
    // プレミアムユーザーは無制限なのでチェックをスキップ
    if (!isUnlimited && remainingToday <= 0) {
      if (isTrialUser) {
        toast.error("この占い師との無料体験が終了しました。\n本格的な鑑定を楽しむにはプランへの登録が必要です。", {
          duration: 5000,
        });
      } else {
        toast.error("本日の鑑定回数の上限に達しました");
      }
      return;
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    // 占い師ごとのメッセージ履歴も更新
    if (selectedOracle) {
      setOracleMessages(prev => ({
        ...prev,
        [selectedOracle]: [...(prev[selectedOracle] || []), userMessage]
      }));
    }
    setInput("");
    setIsLoading(true);

    // If there's a palm image, upload it first
    if (palmImage && selectedOracle === 'shion') {
      setIsUploadingImage(true);
      try {
        // Convert file to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Remove data URL prefix
            const base64Data = result.split(',')[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(palmImage.file);
        });

        // Upload image
        const uploadResult = await uploadImageMutation.mutateAsync({
          imageBase64: base64,
          mimeType: palmImage.file.type as 'image/jpeg' | 'image/png' | 'image/webp',
        });

        // Send message with image URL, including which hand was selected
        const handInfo = selectedHand === 'right' 
          ? '【右手の手相です。現在から未来の運勢を鑑定してください。】'
          : '【左手の手相です。過去から現在の運勢を鑑定してください。】';
        chatMutation.mutate({
          oracleId: selectedOracle,
          message: `${userMessage.content}\n\n${handInfo}`,
          sessionId: currentSessionId || undefined,
          imageUrl: uploadResult.imageUrl,
        });

        // Clear image after successful upload
        setPalmImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        // Error is handled in mutation onError
        setIsLoading(false);
      } finally {
        setIsUploadingImage(false);
      }
    } else {
      // Send message without image
      chatMutation.mutate({
        oracleId: selectedOracle,
        message: userMessage.content,
        sessionId: currentSessionId || undefined,
      });
    }
  };
  
  const oracle = selectedOracle ? getOracleById(selectedOracle) : null;
  
  return (
    <div className="h-screen flex flex-col bg-background user-bg overflow-hidden max-w-full">
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
      
      {/* 回答完了フローティングバナー通知 */}
      <ReadingCompleteNotification
        oracleId={selectedOracle}
        show={showReadingNotification}
        onDismiss={() => setShowReadingNotification(false)}
        onScrollToResult={() => {
          scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }}
      />
      
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/20 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Mobile Menu */}
            <MobileNav
              user={user}
              isPremium={isPremium}
              onLogout={logout}
              oracles={oracles}
              selectedOracle={selectedOracle}
              onSelectOracle={(id) => {
                // Check if locked for free users
                const userSelectedOracle = selectedOracleData?.selectedOracleId;
                if (!isPremium && userSelectedOracle && userSelectedOracle !== id) {
                  toast.error("無料プランでは1人の占い師のみ選択できます。\nプレミアムにアップグレードすると全員と相談できます。");
                  return;
                }
                // If free user and no oracle selected yet, set this as their oracle
                if (!isPremium && !userSelectedOracle) {
                  setSelectedOracleMutation.mutate({ oracleId: id });
                }
                // 現在の占い師の履歴を保存
                if (selectedOracle && messages.length > 0) {
                  setOracleMessages(prev => ({
                    ...prev,
                    [selectedOracle]: messages
                  }));
                  setOracleSessionIds(prev => ({
                    ...prev,
                    [selectedOracle]: currentSessionId
                  }));
                }
                setSelectedOracle(id);
                // 選択した占い師の履歴を復元
                setMessages(oracleMessages[id] || []);
                setCurrentSessionId(oracleSessionIds[id] || null);
                // Clear palm image when switching oracles
                setPalmImage(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
                
                // 心理占い師の場合、履歴がなければMBTI診断フローを表示
                if (id === 'shinri' && !oracleMessages[id]?.length && !shinriMBTICompleted[id]) {
                  setShowShinriMBTIFlow(true);
                } else {
                  setShowShinriMBTIFlow(false);
                }
              }}
              onUpgrade={handleUpgrade}
              isUpgrading={isUpgrading}
              userSelectedOracleId={selectedOracleData?.selectedOracleId}
            />
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.webp" alt="六神ノ間" className="w-8 h-8" loading="eager" />
              <span className="font-serif font-bold gradient-text">六神ノ間</span>
            </Link>
          </div>
          
            <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1 text-user-primary">
                <Crown className="w-4 h-4" />
                {isPremium ? 'プレミアム' : 'メンバー'}
              </span>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">
                {isUnlimited ? (
                  <span className="text-user-primary font-bold">無制限</span>
                ) : (
                  <>本日 <span className="text-user-primary font-bold">{remainingToday}</span> / {totalLimit} 回</>
                )}
              </span>
            </div>
            
            <NotificationBell />
            
            {/* Admin Switch Button - Only for admins */}
            {user?.role === 'admin' && (
              <Link href="/admin">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-user-primary/50 text-user-primary hover:bg-user-primary/20"
                >
                  <ShieldCheck className="w-4 h-4 mr-1" />
                  管理画面
                </Button>
              </Link>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
          {/* Mobile status indicator */}
          <div className="md:hidden flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">
              {isUnlimited ? (
                <span className="text-user-primary font-bold">無制限</span>
              ) : (
                <><span className="text-user-primary font-bold">{remainingToday}</span>/{totalLimit}</>
              )}
            </span>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex overflow-hidden max-w-full">
        {/* Oracle Selection Sidebar */}
        <aside className="w-80 border-r border-border/20 bg-background/50 backdrop-blur-sm hidden md:flex md:flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            {/* お気に入り占い師セクション */}
            <FavoriteOraclesSection 
              selectedOracle={selectedOracle}
              onSelectOracle={(oracleId) => {
                if (selectedOracle && messages.length > 0) {
                  setOracleMessages(prev => ({
                    ...prev,
                    [selectedOracle]: messages
                  }));
                  setOracleSessionIds(prev => ({
                    ...prev,
                    [selectedOracle]: currentSessionId
                  }));
                }
                setSelectedOracle(oracleId);
                setMessages(oracleMessages[oracleId] || []);
                setCurrentSessionId(oracleSessionIds[oracleId] || null);
                setPalmImage(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            />
            <h2 className="text-lg font-serif text-user-primary mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              占い師を選択
            </h2>
            <div className="space-y-3" data-tour="oracle-list">
              {oracles.map((o) => {
                const Icon = iconMap[o.icon];
                const isSelected = selectedOracle === o.id;
                // Core oracles (existing 6) are always available for free users
                // Extra oracles (isCore: false) - first one free, subsequent ones 300円
                const purchasedOracleIds = selectedOracleData?.purchasedOracleIds || [];
                const canGetFreeOracle = selectedOracleData?.canGetFreeOracle ?? true;
                const isPurchased = purchasedOracleIds.includes(o.id);
                const isExtraOracle = !o.isCore;
                // Lock if: not premium, is extra oracle, not purchased
                const isLocked = !isPremium && isExtraOracle && !isPurchased;
                // Show price badge for locked oracles
                const showPriceBadge = isLocked && !canGetFreeOracle;
                const showFreeBadge = isLocked && canGetFreeOracle;
                
                return (
                  <button
                    key={o.id}
                    onClick={() => {
                      if (isLocked) {
                        // Try to add oracle (first one free, subsequent ones require payment)
                        setSelectedOracleMutation.mutate({ oracleId: o.id, isCore: o.isCore });
                        return;
                      }
                      // 現在の占い師の履歴を保存
                      if (selectedOracle && messages.length > 0) {
                        setOracleMessages(prev => ({
                          ...prev,
                          [selectedOracle]: messages
                        }));
                        setOracleSessionIds(prev => ({
                          ...prev,
                          [selectedOracle]: currentSessionId
                        }));
                      }
                      setSelectedOracle(o.id);
                      // 選択した占い師の履歴を復元
                      setMessages(oracleMessages[o.id] || []);
                      setCurrentSessionId(oracleSessionIds[o.id] || null);
                      // Clear palm image when switching oracles
                      setPalmImage(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }

                    }}
                    className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all relative ${
                      isSelected 
                        ? 'bg-user-primary/20 border-2 border-user-primary shadow-lg shadow-user-primary/20 scale-[1.02]' 
                        : isLocked
                        ? 'border border-dashed border-user-primary/30 hover:border-user-primary/50 hover:bg-user-primary/5'
                        : 'hover:bg-white/10 border border-white/10 hover:border-user-primary/30'
                    }`}
                  >
                    <Avatar className={`w-14 h-14 ${isSelected ? 'ring-2 ring-user-primary ring-offset-2 ring-offset-background' : ''}`}>
                      <AvatarImage src={o.image} alt={o.name} />
                      <AvatarFallback className={`bg-gradient-to-br ${o.color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left flex-1">
                      <div className="font-serif text-lg text-white flex items-center gap-2">
                        {o.name}
                        {!isLocked && <OracleFavoriteStar oracleId={o.id} />}
                        {isExtraOracle && !isPremium && (
                          isPurchased ? (
                            <span className="text-xs bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded">購入済</span>
                          ) : showFreeBadge ? (
                            <span className="text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">無料</span>
                          ) : showPriceBadge ? (
                            <span className="text-xs bg-user-primary/20 text-user-primary px-1.5 py-0.5 rounded">¥300</span>
                          ) : null
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">{o.role}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Sidebar plan info removed - admin grants 1 month unlimited access */}
          
          {/* Loyalty Status Widget */}
          <div className="p-4 border-t border-border/20">
            <LoyaltyStatusWidget compact />
          </div>
          
          {/* Intimacy Display Widget */}
          <div className="p-4 border-t border-border/20">
            {selectedOracle ? (
              <IntimacyDisplay 
                oracleId={selectedOracle} 
                compact 
                onLevelUp={(prev, next, oracle) => setLevelUpData({ previousLevel: prev, newLevel: next, oracleId: oracle })}
              />
            ) : (
              <IntimacyDisplay compact />
            )}
          </div>
          
          {/* Account Links */}
          <div className="p-4 border-t border-border/20 mt-auto space-y-1">
            <Link href="/favorites">
              <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                <Heart className="w-4 h-4 mr-2" />
                お気に入り占い師
              </Button>
            </Link>
            <Link href="/scheduled-messages">
              <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                <Bell className="w-4 h-4 mr-2" />
                占い師からのメッセージ
              </Button>
            </Link>
            <Link href="/special-dates">
              <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                <Calendar className="w-4 h-4 mr-2" />
                大切な日の登録
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                <User className="w-4 h-4 mr-2" />
                プロフィール
              </Button>
            </Link>
            <Link href="/subscription">
              <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                <CreditCard className="w-4 h-4 mr-2" />
                プラン・お支払い
              </Button>
            </Link>

            <Link href="/coupon">
              <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                <Ticket className="w-4 h-4 mr-2" />
                クーポン入力
              </Button>
            </Link>

            <Link href="/help" data-tour="help-link">
              <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground group">
                <HelpCircle className="w-4 h-4 mr-2" />
                <div className="flex flex-col items-start">
                  <span>ヘルプ</span>
                  <span className="text-[10px] text-gold/70 group-hover:text-gold">サポートチャットもここから</span>
                </div>
              </Button>
            </Link>
            
            {/* Display Settings */}
            <DisplaySettings variant="button" className="w-full justify-start text-muted-foreground hover:text-foreground" />
          </div>
          
          {/* User Info - ユーザーID表示 */}
          {user && (
            <div className="p-4 border-t border-border/20">
              <div className="text-xs text-muted-foreground">
                <span>ユーザーID: </span>
                <span className="font-mono text-user-primary">{user.id}</span>
                {user.id === 1 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-user-primary/20 text-user-primary rounded text-[10px] font-medium">オーナー</span>
                )}
              </div>
            </div>
          )}
          
          {/* Admin Menu - 管理者専用 (role === 'admin') */}
          {user && user.role === 'admin' && (
            <div className="p-4 border-t border-user-primary/30 bg-user-primary/5 space-y-1">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="w-5 h-5 text-user-primary" />
                <span className="text-sm font-bold text-white">管理者メニュー</span>
              </div>
              <Link href="/admin/feedback">
                <Button variant="outline" className="w-full justify-start border-user-primary/30 text-user-primary hover:bg-user-primary/20 hover:text-user-primary mb-2">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  意見箱管理
                </Button>
              </Link>
              <Link href="/admin/inquiries">
                <Button variant="outline" className="w-full justify-start border-user-primary/30 text-user-primary hover:bg-user-primary/20 hover:text-user-primary">
                  <Mail className="w-4 h-4 mr-2" />
                  問い合わせ管理
                </Button>
              </Link>
            </div>
          )}
        </aside>
        
        {/* Chat Area */}
        <main className="flex-1 flex flex-col overflow-hidden pb-20 md:pb-0 max-w-full" data-tour="chat-area">
          {selectedOracle && oracle ? (
            <>
              {/* Chat Header - Compact on mobile */}
              <div className="p-2 md:p-4 border-b border-border/20 bg-background/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 md:gap-3">
                    <Avatar className="w-8 h-8 md:w-10 md:h-10">
                      <AvatarImage src={oracle.image} alt={oracle.name} />
                      <AvatarFallback className={`bg-gradient-to-br ${oracle.color}`}>
                        {oracle.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-white text-sm md:text-base">{oracle.name}</div>
                      <div className="text-[10px] md:text-xs text-muted-foreground hidden md:block">{oracle.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2">
                    {/* New Conversation Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startNewConversationMutation.mutate({ oracleId: selectedOracle })}
                      className="text-muted-foreground hover:text-green-400 hover:bg-green-400/10 p-1.5 md:p-2 h-auto"
                      title="新しい会話を始める"
                      disabled={startNewConversationMutation.isPending}
                    >
                      <PlusCircle className="w-4 h-4" />
                    </Button>
                    {/* Session History Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowSessionHistoryDialog(true);
                        refetchSessionList();
                      }}
                      className="text-muted-foreground hover:text-blue-400 hover:bg-blue-400/10 p-1.5 md:p-2 h-auto"
                      title="会話履歴"
                    >
                      <History className="w-4 h-4" />
                    </Button>
                    {/* Clear History Button - hidden on mobile */}
                    {messages.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowClearHistoryDialog(true)}
                        className="text-muted-foreground hover:text-red-400 hover:bg-red-400/10 p-1.5 md:p-2 h-auto hidden md:flex"
                        title="履歴をクリア"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    {/* Guardian Mode Toggle - hidden on mobile */}
                    <div className="hidden md:block">
                      <GuardianModeToggle compact />
                    </div>

                  </div>
                </div>
              </div>
              
              {/* Messages */}
              <ScrollArea className="flex-1 min-h-0 p-4" ref={scrollRef}>
                {/* 心理占い師用MBTI診断フロー */}
                {selectedOracle === 'shinri' && showShinriMBTIFlow && messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <ShinriMBTIFlow
                      existingMBTI={latestMBTIData?.result?.mbtiType || null}
                      onComplete={(type, info) => {
                        setShowShinriMBTIFlow(false);
                        setShinriMBTICompleted(prev => ({ ...prev, shinri: true }));
                        toast.success(`あなたのタイプは ${type}（${info.name}）です！`);
                        
                        // MBTIタイプを元に自動でメッセージを送信
                        const autoMessage = `私のMBTIタイプは${type}（${info.name}）です。このタイプについて、心理学的な観点から詳しく分析してください。`;
                        
                        // ユーザーメッセージを追加
                        const userMessage: Message = {
                          id: Date.now().toString(),
                          role: "user",
                          content: autoMessage,
                          timestamp: new Date(),
                        };
                        setMessages([userMessage]);
                        setOracleMessages(prev => ({
                          ...prev,
                          shinri: [userMessage]
                        }));
                        setIsLoading(true);
                        
                        // 自動でチャットを送信
                        chatMutation.mutate({
                          oracleId: 'shinri',
                          message: autoMessage,
                          sessionId: currentSessionId || undefined,
                        });
                      }}
                      onSkip={() => {
                        setShowShinriMBTIFlow(false);
                        setShinriMBTICompleted(prev => ({ ...prev, shinri: true }));
                      }}
                    />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Avatar className="w-24 h-24 mx-auto mb-4">
                        <AvatarImage src={oracle.image} alt={oracle.name} />
                      </Avatar>
                      <h3 className="text-xl font-serif text-white mb-2">{oracle.name}</h3>
                      <p className="text-muted-foreground max-w-md">
                        {oracle.description}
                      </p>
                      <div className="mt-6 px-6 py-3 rounded-full bg-gradient-to-r from-amber-400/20 to-yellow-400/20 border border-amber-400/30 inline-block">
                        <p className="text-sm text-amber-300 font-medium flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          あなたの悩みをお聞かせください
                          <Sparkles className="w-4 h-4" />
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 overflow-x-hidden w-full">
                    {messages.map((message, index) => {
                      // 前のメッセージと日付が変わったら区切り線を表示
                      const prevMessage = index > 0 ? messages[index - 1] : null;
                      const showDateDivider = !prevMessage || !isSameDay(message.timestamp, prevMessage.timestamp);
                      
                      return (
                        <div key={message.id}>
                          {/* 日付区切り */}
                          {showDateDivider && (
                            <div className="flex items-center justify-center my-4">
                              <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                                <div className="w-8 h-px bg-gradient-to-r from-transparent to-white/20" />
                                <span className="text-xs text-muted-foreground font-medium">
                                  {formatDateForDivider(message.timestamp)}
                                </span>
                                <div className="w-8 h-px bg-gradient-to-l from-transparent to-white/20" />
                              </div>
                            </div>
                          )}
                          
                          <div
                            className={`flex items-end gap-2 message-animate overflow-hidden ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                        {/* Avatar - LINE style */}
                        {message.role === 'assistant' && (
                          <Avatar className="w-10 h-10 flex-shrink-0 ring-2 ring-user-primary/30">
                            <AvatarImage src={oracle.image} alt={oracle.name} />
                          </Avatar>
                        )}
                        
                        <div className={`max-w-[80%] sm:max-w-[80%] md:max-w-[75%] min-w-0 overflow-hidden ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                          {/* Name label for oracle */}
                          {message.role === 'assistant' && (
                            <span className="text-xs text-user-primary mb-1 ml-1">{oracle.name}</span>
                          )}
                          
                          {/* Message bubble - LINE style */}
                          <div 
                            className={`relative ${
                              message.role === 'user' 
                                ? 'chat-message-user-line rounded-2xl rounded-br-sm px-4 py-3 sm:px-4 sm:py-3' 
                                : 'chat-message-oracle-line rounded-2xl rounded-bl-sm px-4 py-4 sm:px-4 sm:py-4 cursor-pointer hover:ring-2 hover:ring-user-primary/30 transition-all'
                            }`}
                            onClick={() => {
                              if (message.role === 'assistant') {
                                setSelectedFortuneMessage(message);
                              }
                            }}
                            title={message.role === 'assistant' ? 'クリックで別ウィンドウ表示' : undefined}
                          >
                            {message.role === 'assistant' ? (
                              <>
                                <ExpandableMessage content={message.content} maxLines={12} disableCollapse={true}>
                                  <div className="prose prose-invert max-w-none min-w-0 w-full overflow-hidden break-words">
                                    <Streamdown className="max-w-full overflow-hidden">
                                      {formatFortuneContent(message.content)}
                                    </Streamdown>
                                  </div>
                                </ExpandableMessage>
                                {/* 拡大ヒント */}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Maximize2 className="w-4 h-4 text-user-primary/50" />
                                </div>
                              </>
                            ) : (
                              <p>{message.content}</p>
                            )}
                          </div>
                          
                          {/* Read status for user messages */}
                          {message.role === 'user' && (
                            <div className="read-status read mt-1 mr-1 text-right">
                              既読
                            </div>
                          )}
                          
                          {message.role === 'assistant' && selectedOracle && (
                            <div className="mt-2 flex items-center gap-2">
                              {/* Copy Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 opacity-70 hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(message.content);
                                  setCopiedMessageId(message.id);
                                  toast.success("コピーしました");
                                  setTimeout(() => setCopiedMessageId(null), 2000);
                                }}
                                title="コピー"
                              >
                                {copiedMessageId === message.id ? (
                                  <Check className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                              {/* Favorite Button */}
                              <FavoriteButton 
                                messageId={parseInt(message.id) || 0}
                                oracleId={selectedOracle}
                                content={message.content}
                              />
                              {/* Text-to-Speech Button with Oracle Voice Settings */}
                              <TextToSpeech 
                                text={message.content} 
                                className="opacity-70 hover:opacity-100 transition-opacity"
                                voiceSettings={oracle?.voiceSettings}
                                oracleName={oracle?.name}
                              />
                              <FortuneResultCard
                                oracleName={oracle?.name || ''}
                                oracleImage={oracle?.image || ''}
                                oracleColor={oracle?.color || ''}
                                content={message.content}
                                date={message.timestamp}
                                compact={true}
                              />
                              <SocialShare 
                                title={t("common", "siteName")}
                                text={t("share", "shareText")}
                                url="https://sixoracle.net"
                                compact={true}
                              />
                              {/* PDF Certificate & Omamori Download Buttons - メッセージ直下に表示 */}
                              <div className="flex flex-wrap gap-1.5 md:gap-2 mt-1.5 md:mt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-[10px] md:text-xs gap-1 border-user-primary/30 hover:bg-user-primary/10 h-7 md:h-8 px-2 md:px-3"
                                  onClick={() => {
                                    if (currentSessionId && selectedOracle) {
                                      generateCertificateMutation.mutate({
                                        sessionId: currentSessionId,
                                        oracleId: selectedOracle,
                                      });
                                    }
                                  }}
                                  disabled={generateCertificateMutation.isPending || !currentSessionId}
                                >
                                  <FileDown className="w-3 h-3" />
                                  {generateCertificateMutation.isPending ? "生成中..." : "鑑定書"}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-[10px] md:text-xs gap-1 border-amber-400/30 hover:bg-amber-400/10 text-amber-400 h-7 md:h-8 px-2 md:px-3"
                                  onClick={() => {
                                    if (selectedOracle) {
                                      generateOmamoriMutation.mutate({
                                        oracleId: selectedOracle,
                                      });
                                    }
                                  }}
                                  disabled={generateOmamoriMutation.isPending}
                                >
                                  <Wand2 className="w-3 h-3" />
                                  {generateOmamoriMutation.isPending ? "生成中..." : "お守り"}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                          </div>
                        </div>
                      );
                    })}
                    {isLoading && oracle && (
                      <OracleThinkingAnimation oracle={oracle} />
                    )}
                    {/* 入力欄でメッセージが隠れないようにスペーサーを追加 */}
                    <div className="h-48 md:h-32 flex-shrink-0" aria-hidden="true" />
                  </div>
                )}
              </ScrollArea>
              
              {/* Input Area - Compact on mobile */}
              <div className="p-2 md:p-4 border-t border-border/20 bg-background/50 backdrop-blur-sm overflow-hidden max-w-full">
                {/* Show recovery/upgrade prompt when readings are exhausted (not for unlimited users) */}
                {!isUnlimited && remainingToday <= 0 ? (
                  <div className="text-center py-4">
                    <div className="glass-card-user p-6 rounded-xl max-w-md mx-auto border border-red-400/30">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-400/20 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-red-400" />
                      </div>
                      
                      {/* Standard Plan: Show ¥100 recovery option */}
                      {usageData?.planType === 'standard' ? (
                        <>
                          <h3 className="text-lg font-serif text-red-400 mb-2">本日の鑑定回数を使い切りました</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            1日15回の鑑定をすべて使用しました。
                          </p>
                          
                          <div className="bg-user-primary/10 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-5 h-5 text-user-primary" />
                              <span className="font-medium text-white">即時回復</span>
                              <span className="ml-auto text-user-primary font-bold">¥100</span>
                            </div>
                            <p className="text-xs text-muted-foreground text-left">
                              翌朝まで待てない方は、¥100で今すぐ回復できます。
                            </p>
                          </div>
                          
                          <Button
                            onClick={() => {
                              toast.info("決済ページへ移動します...");
                              // TODO: Integrate with payment provider
                            }}
                            className="btn-user-primary w-full mb-3"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            ¥100で即時回復
                          </Button>
                          
                          <p className="text-xs text-muted-foreground mb-4">
                            または翌朝までお待ちください（毎日0時にリセット）
                          </p>
                          
                          <div className="border-t border-border/20 pt-4">
                            <p className="text-xs text-muted-foreground mb-2">
                              プレミアムプランなら、鑑定無制限！
                            </p>
                            <Button
                              onClick={handleUpgrade}
                              variant="outline"
                              className="w-full border-user-primary/50 text-user-primary hover:bg-user-primary/20"
                            >
                              <Crown className="w-4 h-4 mr-2" />
                              プレミアムにアップグレード（¥1,980/月）
                            </Button>
                          </div>
                        </>
                      ) : usageData?.planType === 'free' ? (
                        /* Free Plan: Show upgrade options */
                        <>
                          <h3 className="text-lg font-serif text-red-400 mb-2">無料鑑定回数を使い切りました</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            累計{totalLimit}回の無料鑑定をすべて使用しました。
                          </p>
                          <p className="text-sm text-muted-foreground mb-6">
                            引き続き占いを利用するには、有料プランへのアップグレードが必要です。
                          </p>
                          
                          {/* Standard Plan */}
                          <div className="bg-user-primary/10 rounded-lg p-4 mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-5 h-5 text-user-primary" />
                              <span className="font-medium text-white">スタンダードプラン</span>
                              <span className="ml-auto text-user-primary font-bold">¥980/月</span>
                            </div>
                            <ul className="text-xs text-muted-foreground space-y-1 text-left">
                              <li>✓ 1日15回まで鑑定可能（毎日リセット）</li>
                              <li>✓ ¥100で即時回復可能</li>
                              <li>✓ 6人の占い師に相談し放題</li>
                            </ul>
                          </div>
                          
                          {/* Premium Plan */}
                          <div className="bg-yellow-500/10 rounded-lg p-4 mb-4 border border-yellow-500/30">
                            <div className="flex items-center gap-2 mb-2">
                              <Crown className="w-5 h-5 text-yellow-400" />
                              <span className="font-medium text-white">プレミアムプラン</span>
                              <span className="ml-auto text-yellow-400 font-bold">¥1,980/月</span>
                            </div>
                            <ul className="text-xs text-muted-foreground space-y-1 text-left">
                              <li>✓ 鑑定無制限（回数制限なし）</li>
                              <li>✓ 回復課金不要！</li>
                              <li>✓ 6人の占い師に相談し放題</li>
                            </ul>
                          </div>
                          
                          <Button
                            onClick={handleUpgrade}
                            disabled={isUpgrading}
                            className="btn-user-primary w-full"
                          >
                            {isUpgrading ? (
                              <span className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-background"></div>
                                処理中...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <Crown className="w-4 h-4" />
                                プランを選ぶ
                              </span>
                            )}
                          </Button>

                        </>
                      ) : (
                        /* Premium Unlimited: Should not reach here, but just in case */
                        <>
                          <h3 className="text-lg font-serif text-red-400 mb-2">本日の鑑定回数を使い切りました</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            翌朝0時にリセットされます。
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Palm Image Preview (Shion only) */}
                    {selectedOracle === 'shion' && palmImage && (
                      <div className="relative inline-block">
                        <img
                          src={palmImage.preview}
                          alt="手相画像"
                          className="h-20 w-20 object-cover rounded-lg border border-user-primary/30"
                        />
                        <button
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {isUploadingImage && (
                          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-user-primary"></div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* LINE-style Chat Input Area - Compact on mobile */}
                    <div ref={inputAreaRef} className="chat-input-container bg-white/95 dark:bg-slate-800/95 rounded-xl md:rounded-2xl border border-gray-200/50 dark:border-slate-600/50 shadow-lg backdrop-blur-sm p-1.5 md:p-2 max-w-full overflow-hidden">
                      {/* Main Textarea - Full width */}
                      <div className="relative mb-1.5 md:mb-2 overflow-hidden">
                        <Textarea
                          ref={textareaRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder={(() => {
                            const oracle = selectedOracle ? getOracleById(selectedOracle) : null;
                            if (selectedOracle === 'shion') {
                              return "手相画像をアップロードしてお悩みを...";
                            }
                            return oracle?.placeholder || "お悩みをお聞かせください...";
                          })()}
                          className="w-full min-h-[60px] md:min-h-[80px] max-h-[150px] md:max-h-[200px] py-2 md:py-4 px-3 md:px-4 bg-transparent border-0 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none focus:ring-0 focus:outline-none text-[15px] md:text-base leading-relaxed"
                          style={{ lineHeight: '1.6' }}
                          enterKeyHint="send"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSend();
                            }
                          }}
                          rows={2}
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = Math.min(target.scrollHeight, 150) + 'px';
                          }}
                        />
                        {/* Preview button for long text */}
                        {input.length > 100 && (
                          <button
                            onClick={() => setShowTextPreview(true)}
                            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-amber-500/20 text-amber-600 hover:bg-amber-500/30 transition-colors"
                            title="全文をプレビュー"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      
                      {/* Bottom toolbar */}
                      <div className="flex items-center justify-between border-t border-gray-200/50 dark:border-slate-600/50 pt-2">
                        {/* Left Side: Utility Buttons */}
                        <div className="flex items-center gap-1">
                          {/* Image Upload Button (Shion only) */}
                          {selectedOracle === 'shion' && (
                            <>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleImageSelect}
                                className="hidden"
                              />
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading || isUploadingImage || !!palmImage}
                                className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                                title="手相の画像をアップロード"
                              >
                                <Camera className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          
                          {/* MBTI Quick Test Button (Shinri only) */}
                          {selectedOracle === 'shinri' && (
                            <>
                              {/* MBTI再診断ボタン */}
                              <button
                                onClick={() => {
                                  setShowShinriMBTIFlow(true);
                                  setShinriMBTICompleted(prev => ({ ...prev, shinri: false }));
                                }}
                                className="w-9 h-9 flex items-center justify-center rounded-full text-cyan-500 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors"
                                title="MBTIを再診断"
                              >
                                <RefreshCw className="w-5 h-5" />
                              </button>
                              <MBTIQuickTest
                                onComplete={(type, info) => {
                                  setInput(`私のMBTIタイプは${type}（${info.name}）です。このタイプについて詳しく教えてください。`);
                                  toast.success(`あなたのタイプは ${type}（${info.name}）です！`);
                                }}
                                trigger={
                                  <button
                                    className="w-9 h-9 flex items-center justify-center rounded-full text-purple-500 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                    title="MBTIクイックテスト"
                                  >
                                    <Brain className="w-5 h-5" />
                                  </button>
                                }
                              />
                              <MBTICompatibilityChart
                                trigger={
                                  <button
                                    className="w-9 h-9 flex items-center justify-center rounded-full text-pink-500 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors"
                                    title="MBTI相性表"
                                  >
                                    <Users className="w-5 h-5" />
                                  </button>
                                }
                              />
                              <MBTIFriendCompatibility
                                trigger={
                                  <button
                                    className="w-9 h-9 flex items-center justify-center rounded-full text-pink-500 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors"
                                    title="友達との相性チェック"
                                  >
                                    <Heart className="w-5 h-5" />
                                  </button>
                                }
                              />
                              <MBTIGroupCompatibility
                                trigger={
                                  <button
                                    className="w-9 h-9 flex items-center justify-center rounded-full text-purple-500 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                    title="グループ相性診断"
                                  >
                                    <Users className="w-5 h-5" />
                                  </button>
                                }
                              />
                              <MBTIHistoryDialog
                                trigger={
                                  <button
                                    className="w-9 h-9 flex items-center justify-center rounded-full text-amber-500 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                                    title="MBTI診断履歴"
                                  >
                                    <History className="w-5 h-5" />
                                  </button>
                                }
                              />
                            </>
                          )}
                          
                          {/* Stamp Picker */}
                          <StampPicker
                            onSelect={(emoji) => setInput(prev => prev + emoji)}
                            disabled={isLoading || isUploadingImage || (!isUnlimited && remainingToday <= 0)}
                          />
                          
                          {/* Voice History */}
                          <VoiceHistory
                            onSelect={(text) => setInput(prev => prev ? `${prev} ${text}` : text)}
                          />
                        </div>
                        
                        {/* Right Side: Voice Input & Send Button */}
                        <div className="flex items-center gap-1">
                          {/* Voice Input */}
                          <VoiceInput
                            onTranscript={(text) => setInput(prev => prev ? `${prev} ${text}` : text)}
                            disabled={isLoading || isUploadingImage || (!isUnlimited && remainingToday <= 0)}
                          />
                          
                          {/* Send Button */}
                          <button
                            onClick={handleSend}
                            onTouchEnd={(e) => {
                              e.preventDefault();
                              handleSend();
                            }}
                            disabled={!input.trim() || isLoading || isUploadingImage || (!isUnlimited && remainingToday <= 0)}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation active:scale-90 active:shadow-inner"
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Palm reading hint - more prominent when no image */}
                    {selectedOracle === 'shion' && !palmImage && (
                      <div className="bg-gradient-to-r from-purple-600/30 via-violet-600/30 to-indigo-600/30 rounded-xl border-2 border-purple-400/50 p-4 shadow-lg shadow-purple-500/20 animate-pulse-slow">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
                            <Camera className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-purple-100 font-bold text-base">手相画像をアップロードしてください</h4>
                            <p className="text-purple-300/90 text-sm">紫苑は実際の手相を見て鑑定します</p>
                          </div>
                        </div>
                        
                        {/* 左右手選択 */}
                        <div className="mb-4">
                          <p className="text-purple-200 text-sm mb-2 font-medium">どちらの手を鑑定しますか？</p>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setSelectedHand('right')}
                              className={`py-2.5 px-3 rounded-lg border-2 transition-all text-sm font-medium ${
                                selectedHand === 'right'
                                  ? 'bg-purple-500/40 border-purple-400 text-white shadow-md'
                                  : 'bg-purple-900/30 border-purple-600/50 text-purple-300 hover:bg-purple-800/40'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                <Hand className="w-4 h-4" />
                                <span>右手</span>
                              </div>
                              <p className="text-[10px] text-purple-300/80 mt-1">現在〜未来の運勢</p>
                            </button>
                            <button
                              onClick={() => setSelectedHand('left')}
                              className={`py-2.5 px-3 rounded-lg border-2 transition-all text-sm font-medium ${
                                selectedHand === 'left'
                                  ? 'bg-purple-500/40 border-purple-400 text-white shadow-md'
                                  : 'bg-purple-900/30 border-purple-600/50 text-purple-300 hover:bg-purple-800/40'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                <Hand className="w-4 h-4 -scale-x-100" />
                                <span>左手</span>
                              </div>
                              <p className="text-[10px] text-purple-300/80 mt-1">過去〜現在の運勢</p>
                            </button>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Camera className="w-5 h-5" />
                          <span>{selectedHand === 'right' ? '右手' : '左手'}の手のひらを撮影</span>
                        </button>
                        
                        <details className="text-xs mt-3">
                          <summary className="flex items-center gap-1 text-purple-300 cursor-pointer hover:text-purple-200 transition-colors font-medium">
                            <Hand className="w-3 h-3" />
                            <span>撮影のコツを見る</span>
                            <ChevronDown className="w-3 h-3 ml-1" />
                          </summary>
                          <ul className="space-y-1.5 text-purple-200/80 mt-2 ml-4">
                            <li className="flex items-start gap-2">
                              <span className="text-purple-400 font-bold">•</span>
                              <span><strong className="text-purple-100">明るい場所</strong>で撮影</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-400 font-bold">•</span>
                              <span><strong className="text-purple-100">手のひらを大きく開いて</strong>線が見えるように</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-400 font-bold">•</span>
                              <span><strong className="text-purple-100">指先まで画面に収まる</strong>ように</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-400 font-bold">•</span>
                              <span><strong className="text-purple-100">ピントが合った状態</strong>で撮影</span>
                            </li>
                          </ul>
                          <div className="mt-3 p-2 bg-purple-900/40 rounded-lg">
                            <p className="text-purple-200 text-[11px]">
                              <strong>右手</strong>：現在から未来の運勢を示します。今後の可能性や行動による変化を読み取れます。<br/>
                              <strong>左手</strong>：過去から現在の運勢を示します。生まれ持った資質やこれまでの経験を読み取れます。
                            </p>
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col p-6">
              {/* Notification Banner */}
              <NotificationBanner />
              
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-lg">
                  <Sparkles className="w-16 h-16 text-user-primary/30 mx-auto mb-4" />
                  <h2 className="text-xl font-serif text-white mb-2">占い師を選択してください</h2>
                  <p className="text-muted-foreground mb-6">
                    左のリストから相談したい占い師を選んでください
                  </p>
                  
                  {/* Recommended Oracles Section */}
                  <RecommendedOracles
                    currentOracleId={null}
                    onSelectOracle={(oracleId) => {
                      // 現在の占い師の履歴を保存
                      if (selectedOracle && messages.length > 0) {
                        setOracleMessages(prev => ({
                          ...prev,
                          [selectedOracle]: messages
                        }));
                        setOracleSessionIds(prev => ({
                          ...prev,
                          [selectedOracle]: currentSessionId
                        }));
                      }
                      setSelectedOracle(oracleId);
                      // 選択した占い師の履歴を復元
                      setMessages(oracleMessages[oracleId] || []);
                      setCurrentSessionId(oracleSessionIds[oracleId] || null);
                      setPalmImage(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }

                    }}
                    className="mb-6 text-left"
                  />
                  
                  {/* Free Plan Status Card removed - admin grants 1 month unlimited access */}
                  
                  {/* Premium Status Card */}
                  {isPremium && (
                    <Card className="glass-card-user mt-6 border-user-primary/30">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Crown className="w-5 h-5 text-user-primary" />
                            <span className="font-medium text-white">プレミアムプラン</span>
                          </div>
                          <div className="text-right">
                            {isUnlimited ? (
                              <>
                                <div className="text-2xl font-bold text-user-primary">無制限</div>
                                <div className="text-xs text-muted-foreground">鑑定回数</div>
                              </>
                            ) : (
                              <>
                                <div className="text-2xl font-bold text-user-primary">{remainingToday}</div>
                                <div className="text-xs text-muted-foreground">本日の残り</div>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {isUnlimited ? (
                          <div className="text-sm text-muted-foreground text-center py-2">
                            <span className="text-user-primary">✨</span> 全ての占い師と無制限に鑑定できます <span className="text-user-primary">✨</span>
                          </div>
                        ) : (
                          <>
                            {/* Progress Bar */}
                            <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                              <div 
                                className="h-2 rounded-full bg-user-primary transition-all"
                                style={{ width: `${(remainingToday / totalLimit) * 100}%` }}
                              />
                            </div>
                            
                            <div className="text-sm text-muted-foreground">
                              本日 <span className="text-user-primary font-bold">{totalLimit - remainingToday}</span> / {totalLimit} 回使用済み
                              <span className="text-xs ml-2">(毎日リセット)</span>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}

                </div>
              </div>
            </div>
          )}
        </main>
        
        {/* Mobile Oracle Selection - コンパクトデザイン */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-user-primary/30 z-50" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 4px)' }}>
          {/* 占い師選択リスト - コンパクト */}
          <div className="py-1.5 px-1">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 px-1">
                {oracles.map((o) => {
                  const isSelected = selectedOracle === o.id;
                  const purchasedOracleIds = selectedOracleData?.purchasedOracleIds || [];
                  const canGetFreeOracle = selectedOracleData?.canGetFreeOracle ?? true;
                  const isPurchased = purchasedOracleIds.includes(o.id);
                  const isExtraOracle = !o.isCore;
                  const isLocked = !isPremium && isExtraOracle && !isPurchased;
                  
                  return (
                    <button
                      key={o.id}
                      onClick={() => {
                        if (isLocked) {
                          setSelectedOracleMutation.mutate({ oracleId: o.id, isCore: o.isCore });
                          return;
                        }
                        // 現在の占い師の履歴を保存
                        if (selectedOracle && messages.length > 0) {
                          setOracleMessages(prev => ({
                            ...prev,
                            [selectedOracle]: messages
                          }));
                          setOracleSessionIds(prev => ({
                            ...prev,
                            [selectedOracle]: currentSessionId
                          }));
                        }
                        setSelectedOracle(o.id);
                        // 選択した占い師の履歴を復元
                        setMessages(oracleMessages[o.id] || []);
                        setCurrentSessionId(oracleSessionIds[o.id] || null);
                        setPalmImage(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }

                      }}
                      className={`flex-shrink-0 flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all relative ${
                        isSelected 
                          ? 'bg-user-primary/30 ring-2 ring-user-primary scale-105 shadow-lg shadow-user-primary/20' 
                          : isLocked 
                          ? 'opacity-50' 
                          : 'hover:bg-white/10 active:scale-95'
                      }`}
                    >
                      <Avatar className={`w-11 h-11 ${isSelected ? 'ring-2 ring-user-primary ring-offset-1 ring-offset-background' : ''}`}>
                        <AvatarImage src={o.image} alt={o.name} />
                      </Avatar>
                      <span className={`text-[10px] font-medium whitespace-nowrap ${isSelected ? 'text-user-primary font-bold' : 'text-white/80'}`}>
                        {o.name}
                      </span>
                      {isLocked && (
                        <span className="absolute -top-1 -right-1 text-[9px] bg-user-primary text-black px-1.5 py-0.5 rounded-full font-bold">
                          {canGetFreeOracle ? '無料' : '¥300'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* PWA Install Prompt */}
      <AddToHomeScreenPrompt />

      {/* Low Readings Alert Dialog */}
      <AlertDialog open={showLowReadingsAlert} onOpenChange={setShowLowReadingsAlert}>
        <AlertDialogContent className="glass-card-user border-user-primary/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-user-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              残り鑑定回数が少なくなっています
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              無料鑑定の残りが <span className="text-user-primary font-bold">{usageData?.remaining || 0}回</span> となりました。
              <br /><br />
              引き続き占いをお楽しみいただくには、以下のオプションがございます：
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-pink-400" />
                  <span><strong className="text-pink-400">初回限定 ¥200</strong> で回数回復（30回）</span>
                </li>
                <li className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-user-primary" />
                  <span>通常 <strong>¥300</strong> で回数回復（30回）</span>
                </li>
                <li className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-user-primary" />
                  <span>プレミアムプラン <strong>¥1,980/月</strong> で無制限</span>
                </li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="border-white/20">あとで</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                window.location.href = '/subscription';
              }}
              className="bg-user-primary hover:bg-user-primary/90 text-black"
            >
              プランを確認する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* No Readings Block Dialog - Blocks the chat when readings are 0 */}
      <AlertDialog open={showNoReadingsBlock}>
        <AlertDialogContent className="glass-card-user border-user-primary/50 max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-user-primary flex items-center gap-2 text-xl">
              <Sparkles className="w-6 h-6" />
              {usageData?.planType === 'trial' ? '本格鑑定への扉を開く' : '鑑定回数がなくなりました'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground space-y-4">
              {usageData?.planType === 'trial' ? (
                <>
                  <p className="text-base">
                    ✨ あなたの運命の核心に触れる重要なメッセージが出ています。
                    <br /><br />
                    ここから先は、六神の力をすべて解放する<span className="text-user-primary font-bold">【本格鑑定モード】</span>にてお伝えする必要があります。
                  </p>
                  
                  <div className="space-y-3 bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-user-primary/10 border border-user-primary/30">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-user-primary" />
                        <div>
                          <p className="font-bold text-user-primary">スタンダード</p>
                          <p className="text-sm text-muted-foreground">毎日15回までじっくり相談</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => window.location.href = '/subscription'}
                        variant="outline"
                        className="border-user-primary text-user-primary hover:bg-user-primary/10"
                      >
                        ¥980/月
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                      <div className="flex items-center gap-3">
                        <Crown className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="font-bold text-purple-400">プレミアム</p>
                          <p className="text-sm text-muted-foreground">鑑定無制限＆優先サポート</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => window.location.href = '/subscription'}
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                      >
                        ¥1,980/月
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    ※ メニューの「サブスクリプション」からプランを選択できます
                  </p>
                </>
              ) : (
                <>
                  <p className="text-base">
                    鑑定回数をすべて使い切りました。
                    <br />
                    引き続き占いをお楽しみいただくには、以下のオプションからお選びください。
                  </p>
                  
                  <div className="space-y-3 bg-white/5 rounded-lg p-4">
                    {usageData?.planType === 'standard' && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-user-primary/10 border border-user-primary/30">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-user-primary" />
                          <div>
                            <p className="font-bold text-user-primary">即時回復</p>
                            <p className="text-sm text-muted-foreground">今すぐ鑑定を再開</p>
                          </div>
                        </div>
                        <Button 
                          onClick={handleRecoveryPurchase}
                          variant="outline"
                          className="border-user-primary text-user-primary hover:bg-user-primary/10"
                        >
                          ¥100
                        </Button>
                      </div>
                    )}
                    
                    {usageData?.planType === 'standard' && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                        <div className="flex items-center gap-3">
                          <Crown className="w-5 h-5 text-purple-400" />
                          <div>
                            <p className="font-bold text-purple-400">プレミアムにアップグレード</p>
                            <p className="text-sm text-muted-foreground">鑑定無制限・回復不要</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => window.location.href = '/subscription'}
                          className="bg-purple-500 hover:bg-purple-600 text-white"
                        >
                          ¥1,980/月
                        </Button>
                      </div>
                    )}
                    
                    {usageData?.planType === 'premium_unlimited' && (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">本日の鑑定回数を使い切りました。</p>
                        <p className="text-sm text-muted-foreground mt-2">翌朝5時（JST）にリセットされます。</p>
                      </div>
                    )}
                    
                    {usageData?.planType === 'free' && (
                      <>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-user-primary/10 border border-user-primary/30">
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-user-primary" />
                            <div>
                              <p className="font-bold text-user-primary">スタンダード</p>
                              <p className="text-sm text-muted-foreground">毎日15回までじっくり相談</p>
                            </div>
                          </div>
                          <Button 
                            onClick={() => window.location.href = '/subscription'}
                            variant="outline"
                            className="border-user-primary text-user-primary hover:bg-user-primary/10"
                          >
                            ¥980/月
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                          <div className="flex items-center gap-3">
                            <Crown className="w-5 h-5 text-purple-400" />
                            <div>
                              <p className="font-bold text-purple-400">プレミアム</p>
                              <p className="text-sm text-muted-foreground">鑑定無制限＆優先サポート</p>
                            </div>
                          </div>
                          <Button 
                            onClick={() => window.location.href = '/subscription'}
                            className="bg-purple-500 hover:bg-purple-600 text-white"
                          >
                            ¥1,980/月
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    ※ 決済完了後、すぐに鑑定を再開できます
                  </p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activation Code Dialog */}
      <Dialog open={showActivationDialog} onOpenChange={setShowActivationDialog}>
        <DialogContent className="sm:max-w-md bg-background border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-gold" />
              合言葉を入力
            </DialogTitle>
            <DialogDescription>
              プレミアムプランを有効にするための合言葉を入力してください。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="合言葉を入力（例: TRIAL-SIXORACLE-2026）"
                value={activationCodeInput}
                onChange={(e) => setActivationCodeInput(e.target.value)}
                className="bg-white/5 border-white/20"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isApplyingCode) {
                    handleApplyActivationCode();
                  }
                }}
              />
            </div>
            <div className="p-3 rounded-lg bg-gold/5 border border-gold/20">
              <p className="text-xs text-muted-foreground">
                合言葉は銀行振込確認後にメールでお送りします。
                まだお持ちでない場合は、<a href="/subscription" className="text-gold hover:underline">プラン・お支払いページ</a>からお申し込みください。
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowActivationDialog(false)}
              className="border-white/20"
            >
              キャンセル
            </Button>
            <Button
              onClick={handleApplyActivationCode}
              disabled={isApplyingCode || !activationCodeInput.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isApplyingCode ? (
                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />確認中...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" />プレミアムを有効化</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Level Up Celebration */}
      <LevelUpCelebration
        isOpen={levelUpData !== null}
        onClose={() => setLevelUpData(null)}
        oracleId={levelUpData?.oracleId || ''}
        previousLevel={levelUpData?.previousLevel || 1}
        newLevel={levelUpData?.newLevel || 1}
      />

      {/* Text Preview Modal */}
      <Dialog open={showTextPreview} onOpenChange={setShowTextPreview}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] bg-background border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Maximize2 className="w-5 h-5 text-amber-500" />
              入力内容のプレビュー
            </DialogTitle>
            <DialogDescription>
              入力中のテキストを確認・編集できます
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[200px] max-h-[400px] p-4 bg-gray-100/80 dark:bg-slate-700/80 border-0 rounded-xl text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-amber-400/50 focus:outline-none text-base leading-relaxed"
              style={{ lineHeight: '1.8' }}
              placeholder="あなたの悩みをお聞かせください..."
            />
            <div className="mt-2 text-sm text-muted-foreground text-right">
              {input.length} 文字
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowTextPreview(false)}
            >
              閉じる
            </Button>
            <Button
              onClick={() => {
                setShowTextPreview(false);
                handleSend();
              }}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
            >
              <Send className="w-4 h-4 mr-2" />
              送信する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear History Confirmation Dialog */}
      <AlertDialog open={showClearHistoryDialog} onOpenChange={setShowClearHistoryDialog}>
        <AlertDialogContent className="glass-card-user border-user-primary/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              履歴をクリアしますか？
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {oracle?.name}との会話履歴をすべて削除します。
              <br /><br />
              この操作は取り消すことができません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 hover:bg-white/10">
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedOracle) {
                  clearHistoryMutation.mutate({ oracleId: selectedOracle });
                }
                setShowClearHistoryDialog(false);
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              クリアする
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Session History Dialog */}
      <Dialog open={showSessionHistoryDialog} onOpenChange={setShowSessionHistoryDialog}>
        <DialogContent className="glass-card-user border-user-primary/30 max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <History className="w-5 h-5 text-blue-400" />
              会話履歴
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {oracle?.name}との過去の会話を選択して続きを読むか、新しい会話を始めましょう。
            </DialogDescription>
          </DialogHeader>
          
          {/* Search Input */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="会話を検索..."
              value={sessionSearchQuery}
              onChange={(e) => setSessionSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10"
            />
          </div>
          
          {/* Archive toggle */}
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="sm"
              className={`text-xs ${showArchived ? 'text-user-primary' : 'text-muted-foreground'}`}
              onClick={() => setShowArchived(!showArchived)}
            >
              <Archive className="w-3 h-3 mr-1" />
              {showArchived ? 'アーカイブを非表示' : 'アーカイブを表示'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => setShowBulkArchiveConfirm(true)}
            >
              <Archive className="w-3 h-3 mr-1" />
              一括アーカイブ
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 py-4">
            {/* New Conversation Button */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 border-green-400/30 hover:bg-green-400/10 text-green-400"
              onClick={() => {
                if (selectedOracle) {
                  startNewConversationMutation.mutate({ oracleId: selectedOracle });
                }
              }}
              disabled={startNewConversationMutation.isPending}
            >
              <PlusCircle className="w-4 h-4" />
              新しい会話を始める
            </Button>
            
            {/* Session List */}
            {filteredSessions && filteredSessions.length > 0 ? (
              <div className="space-y-2 mt-4">
                {/* Pinned Sessions */}
                {filteredSessions.filter(s => s.isPinned).length > 0 && (
                  <>
                    <div className="text-xs text-yellow-400 uppercase tracking-wider px-2 flex items-center gap-1">
                      <Pin className="w-3 h-3" />
                      ピン留め
                    </div>
                    {filteredSessions.filter(s => s.isPinned).map((session) => renderSessionItem(session))}
                  </>
                )}
                
                {/* Regular Sessions */}
                {filteredSessions.filter(s => !s.isPinned).length > 0 && (
                  <>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider px-2 mt-4">過去の会話</div>
                    {filteredSessions.filter(s => !s.isPinned).map((session) => renderSessionItem(session))}
                  </>
                )}
              </div>
            ) : sessionSearchQuery ? (
              <div className="text-center text-muted-foreground py-8">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>「{sessionSearchQuery}」に一致する会話が見つかりません</p>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>まだ会話履歴がありません</p>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {/* Export All Conversations Button */}
            {sessionListData && sessionListData.length > 0 && (
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    // Collect all messages from current oracle
                    const allMessages = messages.length > 0 ? messages : [];
                    if (allMessages.length === 0) {
                      toast.error("エクスポートする会話がありません");
                      return;
                    }
                    
                    const oracleName = oracle?.name || "占い師";
                    const exportDate = new Date().toLocaleDateString('ja-JP', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      timeZone: 'Asia/Tokyo'
                    });
                    
                    // Create text content
                    let textContent = `六神ノ間 - ${oracleName}との会話履歴\n`;
                    textContent += `エクスポート日: ${exportDate}\n`;
                    textContent += `${'='.repeat(50)}\n\n`;
                    
                    allMessages.forEach((msg, index) => {
                      const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }) : '';
                      const sender = msg.role === 'user' ? 'あなた' : oracleName;
                      textContent += `[${timestamp}] ${sender}:\n`;
                      textContent += `${msg.content}\n\n`;
                    });
                    
                    // Download as text file
                    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `six-oracle-${oracleName}-${new Date().toISOString().split('T')[0]}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    toast.success("会話履歴をエクスポートしました");
                  } catch (error) {
                    toast.error("エクスポートに失敗しました");
                  }
                }}
                className="border-purple-400/30 hover:bg-purple-400/10 text-purple-400"
              >
                <FileText className="w-4 h-4 mr-2" />
                テキストで保存
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => setShowSessionHistoryDialog(false)}
              className="border-white/20 hover:bg-white/10"
            >
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Archive Confirmation Dialog */}
      <AlertDialog open={showBulkArchiveConfirm} onOpenChange={setShowBulkArchiveConfirm}>
        <AlertDialogContent className="glass-card-user border-user-primary/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <Archive className="w-5 h-5 text-orange-400" />
              一括アーカイブ
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              指定した期間より古い会話をまとめてアーカイブします。
              <div className="mt-4 space-y-2">
                <label className="text-sm text-white">アーカイブする期間：</label>
                <select
                  value={bulkArchiveDays}
                  onChange={(e) => setBulkArchiveDays(Number(e.target.value))}
                  className="w-full p-2 rounded bg-black/30 border border-white/20 text-white"
                >
                  <option value={7}>1週間以上前</option>
                  <option value={14}>2週間以上前</option>
                  <option value={30}>1ヶ月以上前</option>
                  <option value={60}>2ヶ月以上前</option>
                  <option value={90}>3ヶ月以上前</option>
                  <option value={180}>6ヶ月以上前</option>
                  <option value={365}>1年以上前</option>
                </select>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 hover:bg-white/10">
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedOracle) {
                  bulkArchiveMutation.mutate({
                    oracleId: selectedOracle,
                    olderThanDays: bulkArchiveDays,
                  });
                }
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              アーカイブする
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Fortune Result Modal - 鑑定結果の別ウィンドウ表示 */}
      {selectedFortuneMessage && oracle && (
        <FortuneResultModal
          isOpen={!!selectedFortuneMessage}
          onClose={() => setSelectedFortuneMessage(null)}
          content={selectedFortuneMessage.content}
          oracleName={oracle.name}
          oracleImage={oracle.image}
          oracleColor={oracle.color}
          oracleVoiceSettings={oracle.voiceSettings}
          timestamp={selectedFortuneMessage.timestamp}
          messageId={parseInt(selectedFortuneMessage.id) || 0}
          oracleId={selectedOracle || ''}
          onGenerateCertificate={() => {
            if (currentSessionId && selectedOracle) {
              generateCertificateMutation.mutate({
                sessionId: currentSessionId,
                oracleId: selectedOracle,
              });
            }
          }}
          onGenerateOmamori={() => {
            if (selectedOracle) {
              generateOmamoriMutation.mutate({
                oracleId: selectedOracle,
              });
            }
          }}
          isGeneratingCertificate={generateCertificateMutation.isPending}
          isGeneratingOmamori={generateOmamoriMutation.isPending}
        />
      )}
    </div>
  );
}
