"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { oracles, getOracleById } from "@/lib/oracles";
import {
  getSessionsFromDB, createSessionInDB, addMessageToDB,
  deleteSessionFromDB, canSendMessageDB, incrementDailyUsageInDB,
  ChatSession, ChatMessage,
} from "@/lib/chatStorage";
import { getSupabaseClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Streamdown } from "streamdown";
import { toast } from "sonner";
import {
  Send, Menu, X, LogOut, Crown, Sparkles, Trash2, Plus,
  Clock, Heart, Calculator, Lightbulb, Moon, Shield, Star,
  Hand, Droplet, Cat, Brain, MessageSquare, Settings, Loader2,
  Search, Pin, Archive, MoreVertical, Copy, Check,
  ChevronDown, Camera, RefreshCw, Users, FileDown, Wand2,
  Maximize2, History, Bell, Home, User, CreditCard,
  ShieldCheck, BookOpen, Volume2, VolumeX, Mic,
} from "lucide-react";
import OracleThinkingAnimation from "./OracleThinkingAnimation";
import TextToSpeech from "./TextToSpeech";
import FortuneResultCard from "./FortuneResultCard";
import SocialShare from "./SocialShare";
import StampPicker from "./StampPicker";
import ExpandableMessage from "./ExpandableMessage";
import ShinriMBTIFlow from "./ShinriMBTIFlow";
import MBTIQuickTest from "./MBTIQuickTest";
import MBTICompatibilityChart from "./MBTICompatibilityChart";
import ReadingCompleteNotification from "./ReadingCompleteNotification";
import DisplaySettings from "./DisplaySettings";
import LevelUpCelebration from "./LevelUpCelebration";

const iconMap: Record<string, any> = {
  Clock, Heart, Calculator, Lightbulb, Moon, Shield, Hand, Star, Droplet, Cat, Brain,
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

function isSameDay(d1: Date | number, d2: Date | number): boolean {
  const a = new Date(d1);
  const b = new Date(d2);
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDateForDivider(d: Date | number): string {
  const date = new Date(d);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, today)) return "今日";
  if (isSameDay(date, yesterday)) return "昨日";
  return date.toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" });
}

export default function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, isAuthenticated, loading: authLoading, signOut, isPremiumActive, refreshProfile } = useAuth();

  // Core state
  const [selectedOracle, setSelectedOracle] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [oracleMessages, setOracleMessages] = useState<Record<string, Message[]>>({});
  const [oracleSessionIds, setOracleSessionIds] = useState<Record<string, string | null>>({});
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionSearchQuery, setSessionSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // Palm image state (Shion only)
  const [palmImage, setPalmImage] = useState<{ file: File; preview: string } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedHand, setSelectedHand] = useState<"right" | "left">("right");

  // MBTI state (Shinri only)
  const [showShinriMBTIFlow, setShowShinriMBTIFlow] = useState(false);
  const [shinriMBTICompleted, setShinriMBTICompleted] = useState<Record<string, boolean>>({});

  // UI state
  const [showReadingNotification, setShowReadingNotification] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [selectedFortuneMessage, setSelectedFortuneMessage] = useState<Message | null>(null);
  const [showClearHistoryDialog, setShowClearHistoryDialog] = useState(false);
  const [showSessionHistoryDialog, setShowSessionHistoryDialog] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ level: number; title: string } | null>(null);
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [activationCodeInput, setActivationCodeInput] = useState("");
  const [isApplyingCode, setIsApplyingCode] = useState(false);
  const [mobileTab, setMobileTab] = useState<"chat" | "oracles" | "history" | "settings">("chat");

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Derived state
  const oracle = selectedOracle ? getOracleById(selectedOracle) : null;
  const isPremium = isPremiumActive;
  const isUnlimited = isPremium;
  const remainingToday = profile?.free_messages_remaining ?? 5;
  const totalLimit = isPremium ? Infinity : 5;

  // Favorite oracles
  const [favoriteOracleIds, setFavoriteOracleIds] = useState<string[]>([]);

  // Auth token helper
  const getAuthToken = useCallback(async () => {
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || "";
  }, []);

  // Authenticated fetch helper
  const authFetch = useCallback(async (url: string, options?: RequestInit) => {
    const token = await getAuthToken();
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options?.headers,
      },
    });
  }, [getAuthToken]);

  // Handle oracle selection from URL params
  useEffect(() => {
    const oracleId = searchParams.get("oracle");
    if (oracleId) {
      const o = getOracleById(oracleId);
      if (o) {
        setSelectedOracle(oracleId);
        setMessages([]);
        setCurrentSessionId(null);
      }
    } else if (!selectedOracle) {
      setSelectedOracle(oracles[0].id);
    }
  }, [searchParams]);

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Load sessions from DB
  useEffect(() => {
    async function loadSessions() {
      if (user) {
        setSessionsLoading(true);
        const dbSessions = await getSessionsFromDB(user.id);
        setSessions(dbSessions);
        setSessionsLoading(false);
      }
    }
    loadSessions();
  }, [user]);

  // Load favorites
  useEffect(() => {
    async function loadFavorites() {
      if (!user) return;
      try {
        const res = await authFetch("/api/favorites/list");
        const data = await res.json();
        if (Array.isArray(data)) {
          setFavoriteOracleIds(data.map((f: any) => f.oracle_id));
        }
      } catch {}
    }
    loadFavorites();
  }, [user, authFetch]);

  // Load oracle messages when oracle changes
  useEffect(() => {
    async function loadOracleMessages() {
      if (!user || !selectedOracle) return;
      if (oracleMessages[selectedOracle]) {
        setMessages(oracleMessages[selectedOracle]);
        setCurrentSessionId(oracleSessionIds[selectedOracle] || null);
        return;
      }
      try {
        const res = await authFetch(`/api/chat/oracle-messages?oracleId=${selectedOracle}`);
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          const msgs: Message[] = data.messages.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.created_at),
          }));
          setMessages(msgs);
          setCurrentSessionId(data.sessionId);
          setOracleMessages(prev => ({ ...prev, [selectedOracle]: msgs }));
          setOracleSessionIds(prev => ({ ...prev, [selectedOracle]: data.sessionId }));
        } else {
          setMessages([]);
          setCurrentSessionId(null);
        }
      } catch {
        setMessages([]);
        setCurrentSessionId(null);
      }
    }
    loadOracleMessages();
  }, [user, selectedOracle]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Shinri MBTI flow
  useEffect(() => {
    if (selectedOracle === "shinri" && messages.length === 0 && !shinriMBTICompleted["shinri"]) {
      setShowShinriMBTIFlow(true);
    } else {
      setShowShinriMBTIFlow(false);
    }
  }, [selectedOracle, messages.length, shinriMBTICompleted]);

  // Select oracle handler
  const handleSelectOracle = useCallback((oracleId: string) => {
    if (selectedOracle && messages.length > 0) {
      setOracleMessages(prev => ({ ...prev, [selectedOracle]: messages }));
      setOracleSessionIds(prev => ({ ...prev, [selectedOracle]: currentSessionId }));
    }
    setSelectedOracle(oracleId);
    setPalmImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSidebarOpen(false);
    setMobileTab("chat");
  }, [selectedOracle, messages, currentSessionId]);

  // Toggle favorite
  const toggleFavorite = useCallback(async (oracleId: string) => {
    const isFav = favoriteOracleIds.includes(oracleId);
    try {
      if (isFav) {
        await authFetch("/api/favorites/remove", {
          method: "POST",
          body: JSON.stringify({ oracle_id: oracleId }),
        });
        setFavoriteOracleIds(prev => prev.filter(id => id !== oracleId));
        toast.success("お気に入りから削除しました");
      } else {
        await authFetch("/api/favorites/add", {
          method: "POST",
          body: JSON.stringify({ oracle_id: oracleId }),
        });
        setFavoriteOracleIds(prev => [...prev, oracleId]);
        toast.success("お気に入りに追加しました");
      }
    } catch {
      toast.error("エラーが発生しました");
    }
  }, [favoriteOracleIds, authFetch]);

  // Image select handler (Shion)
  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("画像サイズは5MB以下にしてください");
      return;
    }
    const preview = URL.createObjectURL(file);
    setPalmImage({ file, preview });
  }, []);

  // Copy message
  const handleCopyMessage = useCallback((messageId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
    toast.success("コピーしました");
  }, []);

  // New conversation
  const handleNewConversation = useCallback(async () => {
    if (!selectedOracle) return;
    if (messages.length > 0) {
      setOracleMessages(prev => ({ ...prev, [selectedOracle]: messages }));
      setOracleSessionIds(prev => ({ ...prev, [selectedOracle]: currentSessionId }));
    }
    setMessages([]);
    setCurrentSessionId(null);
    setOracleMessages(prev => ({ ...prev, [selectedOracle]: [] }));
    setOracleSessionIds(prev => ({ ...prev, [selectedOracle]: null }));
    toast.success("新しい会話を開始しました");
  }, [selectedOracle, messages, currentSessionId]);

  // Clear history
  const handleClearHistory = useCallback(async () => {
    if (!selectedOracle || !user) return;
    try {
      await authFetch("/api/chat/clear-history", {
        method: "POST",
        body: JSON.stringify({ oracleId: selectedOracle }),
      });
      setMessages([]);
      setCurrentSessionId(null);
      setOracleMessages(prev => ({ ...prev, [selectedOracle]: [] }));
      setOracleSessionIds(prev => ({ ...prev, [selectedOracle]: null }));
      setShowClearHistoryDialog(false);
      toast.success("履歴を削除しました");
    } catch {
      toast.error("エラーが発生しました");
    }
  }, [selectedOracle, user, authFetch]);

  // Delete session
  const handleDeleteSession = useCallback(async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteSessionFromDB(sessionId);
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setMessages([]);
      setCurrentSessionId(null);
    }
    toast.success("セッションを削除しました");
  }, [currentSessionId]);

  // Pin session
  const handlePinSession = useCallback(async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await authFetch("/api/sessions/pin", {
        method: "POST",
        body: JSON.stringify({ sessionId }),
      });
      toast.success("ピン留めしました");
    } catch {
      toast.error("エラーが発生しました");
    }
  }, [authFetch]);

  // Archive session
  const handleArchiveSession = useCallback(async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await authFetch("/api/sessions/archive", {
        method: "POST",
        body: JSON.stringify({ sessionId }),
      });
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success("アーカイブしました");
    } catch {
      toast.error("エラーが発生しました");
    }
  }, [authFetch]);

  // Update session title
  const handleUpdateSessionTitle = useCallback(async (sessionId: string) => {
    if (!editingTitle.trim()) return;
    try {
      await authFetch("/api/sessions/title", {
        method: "POST",
        body: JSON.stringify({ sessionId, title: editingTitle.trim() }),
      });
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: editingTitle.trim() } : s));
      setEditingSessionId(null);
      setEditingTitle("");
    } catch {
      toast.error("エラーが発生しました");
    }
  }, [editingTitle, authFetch]);

  // Load session
  const loadSession = useCallback((session: ChatSession) => {
    const o = getOracleById(session.oracleId);
    if (o) {
      if (selectedOracle && messages.length > 0) {
        setOracleMessages(prev => ({ ...prev, [selectedOracle]: messages }));
        setOracleSessionIds(prev => ({ ...prev, [selectedOracle]: currentSessionId }));
      }
      setSelectedOracle(session.oracleId);
      const msgs: Message[] = session.messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp),
      }));
      setMessages(msgs);
      setCurrentSessionId(session.id);
      setOracleMessages(prev => ({ ...prev, [session.oracleId]: msgs }));
      setOracleSessionIds(prev => ({ ...prev, [session.oracleId]: session.id }));
      setSidebarOpen(false);
      setMobileTab("chat");
    }
  }, [selectedOracle, messages, currentSessionId]);

  // Apply activation code
  const handleApplyActivationCode = useCallback(async () => {
    if (!activationCodeInput.trim()) return;
    setIsApplyingCode(true);
    try {
      const res = await authFetch("/api/subscription/activation-code", {
        method: "POST",
        body: JSON.stringify({ code: activationCodeInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setShowActivationDialog(false);
        setActivationCodeInput("");
        await refreshProfile();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setIsApplyingCode(false);
    }
  }, [activationCodeInput, authFetch, refreshProfile]);

  // Send message
  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading || !user || !selectedOracle) return;

    const canSend = await canSendMessageDB(
      user.id,
      isPremiumActive,
      profile?.free_messages_remaining ?? 0
    );
    if (!canSend.allowed) {
      toast.error(canSend.reason || "送信できません");
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    let sessionId = currentSessionId;
    if (!sessionId) {
      const newSession = await createSessionInDB(user.id, selectedOracle, userMessage.substring(0, 50));
      if (!newSession) {
        setIsLoading(false);
        toast.error("セッションの作成に失敗しました");
        return;
      }
      sessionId = newSession.id;
      setCurrentSessionId(sessionId);
      setOracleSessionIds(prev => ({ ...prev, [selectedOracle]: sessionId }));
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setOracleMessages(prev => ({
      ...prev,
      [selectedOracle]: [...(prev[selectedOracle] || []), userMsg],
    }));

    await addMessageToDB(sessionId, user.id, selectedOracle, "user", userMessage);
    await incrementDailyUsageInDB(user.id);

    try {
      const conversationHistory = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }));
      conversationHistory.push({ role: "user", content: userMessage });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversationHistory,
          systemPrompt: oracle?.systemPrompt || "",
          userId: user.id,
          oracleId: selectedOracle,
          sessionId,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      setOracleMessages(prev => ({
        ...prev,
        [selectedOracle]: [...(prev[selectedOracle] || []), assistantMsg],
      }));

      await addMessageToDB(sessionId, user.id, selectedOracle, "assistant", data.message);
      setShowReadingNotification(true);
      setTimeout(() => setShowReadingNotification(false), 3000);

      if (!isPremiumActive) {
        await refreshProfile();
      }
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "申し訳ございません。星々の導きが一時的に途絶えてしまいました... しばらくしてからもう一度お試しください。",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      if (user) {
        const dbSessions = await getSessionsFromDB(user.id);
        setSessions(dbSessions);
      }
    }
  }, [input, isLoading, user, selectedOracle, currentSessionId, messages, oracle, isPremiumActive, profile, refreshProfile]);

  // Palm image send (Shion)
  const handleSendPalmImage = useCallback(async () => {
    if (!palmImage || !user || !selectedOracle) return;
    setIsUploadingImage(true);
    const msg = `[手相鑑定リクエスト] ${selectedHand === "right" ? "右手" : "左手"}の手相を鑑定してください。`;
    setInput(msg);
    setPalmImage(null);
    setIsUploadingImage(false);
    toast.success("手相画像を送信しました");
    // Trigger send
    setTimeout(() => handleSend(), 100);
  }, [palmImage, user, selectedOracle, selectedHand, handleSend]);

  // Key handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    let filtered = sessions;
    if (sessionSearchQuery) {
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(sessionSearchQuery.toLowerCase()) ||
        s.oracleId.toLowerCase().includes(sessionSearchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [sessions, sessionSearchQuery]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center mystical-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold mx-auto mb-4" />
          <p className="text-gray-400 text-sm">星々の導きを準備しています...</p>
        </div>
      </div>
    );
  }

  const favoriteOracles = oracles.filter(o => favoriteOracleIds.includes(o.id));

  return (
    <div className="h-screen flex overflow-hidden mystical-bg">
      {/* Level Up Celebration */}
      {levelUpData && (
        <LevelUpCelebration
          level={levelUpData.level}
          title={levelUpData.title}
          onComplete={() => setLevelUpData(null)}
        />
      )}

      {/* Reading Complete Notification */}
      {showReadingNotification && (
        <ReadingCompleteNotification onClose={() => setShowReadingNotification(false)} />
      )}

      {/* Desktop Sidebar */}
      <aside className="w-80 border-r border-gray-800/50 bg-mystic-card/50 backdrop-blur-sm hidden lg:flex lg:flex-col overflow-hidden">
        {/* Logo */}
        <div className="p-4 border-b border-gray-800/50 flex items-center gap-2">
          <img src="/logo.png" alt="六神ノ間" className="w-8 h-8" />
          <span className="font-serif font-bold gradient-text">六神ノ間</span>
        </div>

        {/* Favorite Oracles */}
        {favoriteOracles.length > 0 && (
          <div className="p-3 border-b border-gray-800/50">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2 flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400" /> お気に入り
            </p>
            <div className="flex flex-wrap gap-2">
              {favoriteOracles.map(o => (
                <button
                  key={o.id}
                  onClick={() => handleSelectOracle(o.id)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-all ${
                    selectedOracle === o.id ? "bg-gold/20 border border-gold/40 text-gold" : "bg-white/5 hover:bg-white/10 text-gray-400"
                  }`}
                >
                  <img src={o.image} alt={o.name} className="w-5 h-5 rounded-full object-cover" />
                  {o.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Oracle List */}
        <div className="p-3 border-b border-gray-800/50">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> 占い師を選択
          </p>
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {oracles.map(o => {
              const isSelected = selectedOracle === o.id;
              const isFav = favoriteOracleIds.includes(o.id);
              return (
                <div key={o.id} className="flex items-center group">
                  <button
                    onClick={() => handleSelectOracle(o.id)}
                    className={`flex-1 flex items-center gap-3 p-2 rounded-lg transition-all ${
                      isSelected ? "bg-gold/15 border border-gold/30" : "hover:bg-white/5"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${o.color} flex items-center justify-center overflow-hidden shadow-md flex-shrink-0`}>
                      <img src={o.image} alt={o.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className={`text-sm font-medium truncate ${isSelected ? "text-gold" : "text-gray-300"}`}>{o.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{o.role}</p>
                    </div>
                  </button>
                  <button
                    onClick={() => toggleFavorite(o.id)}
                    className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-all ${
                      isFav ? "text-amber-400 opacity-100" : "text-gray-600 hover:text-amber-400"
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${isFav ? "fill-amber-400" : ""}`} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Session History */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex items-center justify-between mb-2 px-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <History className="w-3 h-3" /> 履歴
            </p>
            <button onClick={handleNewConversation} className="text-gold hover:text-gold/80 transition-colors" title="新しい会話">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-2">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              value={sessionSearchQuery}
              onChange={e => setSessionSearchQuery(e.target.value)}
              placeholder="履歴を検索..."
              className="w-full pl-7 pr-3 py-1.5 text-xs bg-white/5 border border-gray-800 rounded-lg text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-gold/30"
            />
          </div>

          {sessionsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            </div>
          ) : (
            <div className="space-y-1">
              {filteredSessions.filter(s => selectedOracle ? s.oracleId === selectedOracle : true).slice(0, 30).map(session => {
                const sessionOracle = getOracleById(session.oracleId);
                return (
                  <div
                    key={session.id}
                    onClick={() => loadSession(session)}
                    className={`w-full text-left p-2 rounded-lg text-sm flex items-center gap-2 group transition-all cursor-pointer ${
                      currentSessionId === session.id ? "bg-gold/10 text-gold" : "text-gray-400 hover:bg-white/5"
                    }`}
                  >
                    {sessionOracle && (
                      <img src={sessionOracle.image} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                    )}
                    {editingSessionId === session.id ? (
                      <input
                        value={editingTitle}
                        onChange={e => setEditingTitle(e.target.value)}
                        onBlur={() => handleUpdateSessionTitle(session.id)}
                        onKeyDown={e => e.key === "Enter" && handleUpdateSessionTitle(session.id)}
                        className="flex-1 bg-transparent border-b border-gold/30 text-sm text-gold focus:outline-none"
                        autoFocus
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <span className="truncate flex-1">{session.title}</span>
                    )}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={e => { e.stopPropagation(); setEditingSessionId(session.id); setEditingTitle(session.title); }} className="p-0.5 text-gray-500 hover:text-gray-300">
                        <MoreVertical className="w-3 h-3" />
                      </button>
                      <button onClick={e => handleArchiveSession(session.id, e)} className="p-0.5 text-gray-500 hover:text-amber-400">
                        <Archive className="w-3 h-3" />
                      </button>
                      <button onClick={e => handleDeleteSession(session.id, e)} className="p-0.5 text-gray-500 hover:text-red-400">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="p-4 border-t border-gray-800/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                {profile?.nickname?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="text-sm text-gray-300 truncate max-w-[140px]">
                  {profile?.nickname || user?.email || "ゲスト"}
                </p>
                <p className="text-xs text-gray-500">
                  {isPremium ? (
                    <span className="text-gold flex items-center gap-1"><Crown className="w-3 h-3" /> プレミアム</span>
                  ) : (
                    <span>無料プラン（残り{remainingToday}回）</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {profile?.is_admin && (
                <button onClick={() => router.push("/admin")} className="p-1 text-red-400 hover:text-red-300 transition-colors" title="管理画面">
                  <ShieldCheck className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => router.push("/profile")} className="p-1 text-gray-500 hover:text-gray-300 transition-colors" title="プロフィール">
                <User className="w-4 h-4" />
              </button>
              <button onClick={signOut} className="p-1 text-gray-500 hover:text-red-400 transition-colors" title="ログアウト">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
          {!isPremium && (
            <button
              onClick={() => router.push("/pricing")}
              className="block w-full text-center py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-sm font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all"
            >
              <Crown className="w-4 h-4 inline mr-1" />
              プレミアムに登録
            </button>
          )}
          {/* Activation Code */}
          <button
            onClick={() => setShowActivationDialog(true)}
            className="w-full mt-2 text-center py-1.5 rounded-lg border border-gray-700 text-gray-400 text-xs hover:bg-white/5 transition-all"
          >
            アクティベーションコードを入力
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-mystic-card border-r border-gray-800 z-50 flex flex-col overflow-hidden lg:hidden"
            >
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="font-serif gradient-text text-lg">六神ノ間</h2>
                <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-3 border-b border-gray-800">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">占い師を選ぶ</p>
                <div className="grid grid-cols-4 gap-2">
                  {oracles.map(o => {
                    const isSelected = selectedOracle === o.id;
                    return (
                      <button
                        key={o.id}
                        onClick={() => handleSelectOracle(o.id)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                          isSelected ? "bg-gold/20 border border-gold/40" : "hover:bg-white/5"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${o.color} flex items-center justify-center overflow-hidden shadow-md`}>
                          <img src={o.image} alt={o.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] text-gray-400 truncate w-full text-center">{o.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                <div className="flex items-center justify-between mb-2 px-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">履歴</p>
                  <button onClick={handleNewConversation} className="text-gold hover:text-gold/80">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  {filteredSessions.filter(s => selectedOracle ? s.oracleId === selectedOracle : true).slice(0, 20).map(session => (
                    <button
                      key={session.id}
                      onClick={() => loadSession(session)}
                      className={`w-full text-left p-2 rounded-lg text-sm flex items-center gap-2 group transition-all ${
                        currentSessionId === session.id ? "bg-gold/10 text-gold" : "text-gray-400 hover:bg-white/5"
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate flex-1">{session.title}</span>
                      <button onClick={e => handleDeleteSession(session.id, e)} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 border-t border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                    {profile?.nickname?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-300 truncate">{profile?.nickname || user?.email || "ゲスト"}</p>
                    <p className="text-xs text-gray-500">{isPremium ? "プレミアム" : `残り${remainingToday}回`}</p>
                  </div>
                  <button onClick={signOut} className="text-gray-500 hover:text-red-400"><LogOut className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-mystic-card/80 backdrop-blur-sm">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white transition-colors lg:hidden">
            <Menu className="w-6 h-6" />
          </button>
          {oracle && (
            <>
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${oracle.color} flex items-center justify-center shadow-lg overflow-hidden`}>
                <img src={oracle.image} alt={oracle.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-serif text-gold truncate">{oracle.name}</h1>
                <p className="text-xs text-gray-500 truncate">{oracle.role}</p>
              </div>
            </>
          )}
          <div className="flex items-center gap-2">
            {/* New Conversation */}
            <button onClick={handleNewConversation} className="p-2 text-gray-500 hover:text-gold transition-colors" title="新しい会話">
              <Plus className="w-4 h-4" />
            </button>
            {/* Clear History */}
            <button onClick={() => setShowClearHistoryDialog(true)} className="p-2 text-gray-500 hover:text-red-400 transition-colors hidden md:block" title="履歴削除">
              <Trash2 className="w-4 h-4" />
            </button>
            {/* Status */}
            <div className="text-xs text-gray-500 flex items-center gap-1">
              {isPremium ? (
                <><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-amber-400">プレミアム</span></>
              ) : (
                <><MessageSquare className="w-3.5 h-3.5" /><span>残り{remainingToday}回</span></>
              )}
            </div>
          </div>
        </header>

        {/* Messages */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {/* Shinri MBTI Flow */}
          {showShinriMBTIFlow && selectedOracle === "shinri" ? (
            <div className="max-w-lg mx-auto">
              <ShinriMBTIFlow
                onComplete={(type: string, info: any) => {
                  setShowShinriMBTIFlow(false);
                  setShinriMBTICompleted(prev => ({ ...prev, shinri: true }));
                  toast.success(`あなたのタイプは ${type}（${info.name}）です！`);
                  const autoMessage = `私のMBTIタイプは${type}（${info.name}）です。このタイプについて、心理学的な観点から詳しく分析してください。`;
                  setInput(autoMessage);
                  setTimeout(() => handleSend(), 100);
                }}
                onSkip={() => {
                  setShowShinriMBTIFlow(false);
                  setShinriMBTICompleted(prev => ({ ...prev, shinri: true }));
                }}
              />
            </div>
          ) : messages.length === 0 && oracle ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${oracle.color} flex items-center justify-center mb-4 shadow-xl overflow-hidden`}>
                <img src={oracle.image} alt={oracle.name} className="w-full h-full object-cover" />
              </div>
              <h2 className="text-xl font-serif text-gold mb-2">{oracle.name}</h2>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">{oracle.englishName}</p>
              <p className="text-sm text-gray-400 max-w-md mb-6">{oracle.description}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {["今日の運勢を教えて", "恋愛について相談したい", "仕事の悩みがあります"].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}
                    className="text-sm px-4 py-2 rounded-full border border-gold/20 text-gold/70 hover:bg-gold/10 hover:text-gold transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages list */
            <div className="space-y-4">
              {messages.map((msg, index) => {
                const prevMsg = index > 0 ? messages[index - 1] : null;
                const showDateDivider = !prevMsg || !isSameDay(msg.timestamp, prevMsg.timestamp);

                return (
                  <div key={msg.id}>
                    {showDateDivider && (
                      <div className="flex items-center justify-center my-4">
                        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                          <div className="w-8 h-px bg-gradient-to-r from-transparent to-white/20" />
                          <span className="text-xs text-gray-500 font-medium">{formatDateForDivider(msg.timestamp)}</span>
                          <div className="w-8 h-px bg-gradient-to-l from-transparent to-white/20" />
                        </div>
                      </div>
                    )}
                    <div className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      {msg.role === "assistant" && oracle && (
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-1 ring-2 ring-gold/20">
                          <img src={oracle.image} alt={oracle.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className={`max-w-[80%] md:max-w-[65%] min-w-0 flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                        {msg.role === "assistant" && oracle && (
                          <p className="text-xs text-gold/60 mb-1 font-serif">{oracle.name}</p>
                        )}
                        <div className={`px-4 py-3 ${msg.role === "user" ? "chat-bubble-user" : "chat-bubble-oracle"}`}>
                          {msg.role === "assistant" ? (
                            <div className="text-sm text-gray-200 leading-relaxed">
                              <Streamdown>{msg.content}</Streamdown>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                              {msg.content}
                            </div>
                          )}
                          <p className="text-[10px] text-gray-600 mt-1 text-right">
                            {new Date(msg.timestamp).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        {/* Action buttons */}
                        {msg.role === "assistant" && oracle && (
                          <div className="flex items-center gap-1 mt-1 opacity-0 hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleCopyMessage(msg.id, msg.content)}
                              className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
                              title="コピー"
                            >
                              {copiedMessageId === msg.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <TextToSpeech
                              text={msg.content}
                              className="opacity-70 hover:opacity-100 transition-opacity"
                              voiceSettings={oracle.voiceSettings}
                              oracleName={oracle.name}
                            />
                            <FortuneResultCard
                              oracleName={oracle.name}
                              oracleImage={oracle.image}
                              oracleColor={oracle.color}
                              content={msg.content}
                              date={msg.timestamp}
                              compact={true}
                            />
                            <SocialShare
                              title="六神ノ間"
                              text="AI占い師に相談してみませんか？"
                              url="https://sixoracle.net"
                              compact={true}
                            />
                          </div>
                        )}
                        {msg.role === "user" && (
                          <p className="text-[10px] text-gray-600 mt-0.5">既読</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && oracle && (
                <OracleThinkingAnimation oracle={oracle} />
              )}
              <div className="h-32" aria-hidden="true" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800 bg-mystic-card/80 backdrop-blur-sm p-3 md:p-4">
          {!isUnlimited && remainingToday <= 0 ? (
            /* Exhausted readings */
            <div className="text-center py-4">
              <p className="text-gray-400 mb-3">本日の無料鑑定回数を使い切りました</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={() => router.push("/pricing")}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-sm font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all"
                >
                  <Crown className="w-4 h-4 inline mr-1" />
                  プレミアムにアップグレード
                </button>
                <button
                  onClick={() => setShowActivationDialog(true)}
                  className="px-6 py-2 rounded-lg border border-gray-600 text-gray-300 text-sm hover:bg-white/5 transition-all"
                >
                  アクティベーションコード
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Palm Image Preview (Shion only) */}
              {palmImage && selectedOracle === "shion" && (
                <div className="mb-3 p-3 bg-purple-900/20 border border-purple-500/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <img src={palmImage.preview} alt="手相" className="w-20 h-20 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-sm text-purple-200 mb-1">手相画像を選択しました</p>
                      <div className="flex gap-2 mb-2">
                        <button
                          onClick={() => setSelectedHand("right")}
                          className={`px-3 py-1 rounded-full text-xs ${selectedHand === "right" ? "bg-purple-500 text-white" : "bg-white/10 text-gray-400"}`}
                        >
                          右手
                        </button>
                        <button
                          onClick={() => setSelectedHand("left")}
                          className={`px-3 py-1 rounded-full text-xs ${selectedHand === "left" ? "bg-purple-500 text-white" : "bg-white/10 text-gray-400"}`}
                        >
                          左手
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleSendPalmImage} className="px-3 py-1 rounded-lg bg-purple-500 text-white text-xs hover:bg-purple-400">
                          送信
                        </button>
                        <button onClick={() => setPalmImage(null)} className="px-3 py-1 rounded-lg bg-white/10 text-gray-400 text-xs hover:bg-white/20">
                          キャンセル
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-end gap-2 max-w-3xl mx-auto">
                {/* Utility buttons */}
                <div className="flex items-center gap-1 pb-1">
                  {selectedOracle === "shion" && (
                    <>
                      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageSelect} className="hidden" />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading || isUploadingImage}
                        className="p-2 text-gray-500 hover:text-purple-400 transition-colors disabled:opacity-50 rounded-full hover:bg-white/5"
                        title="手相画像をアップロード"
                      >
                        <Camera className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  {selectedOracle === "shinri" && (
                    <button
                      onClick={() => { setShowShinriMBTIFlow(true); setShinriMBTICompleted(prev => ({ ...prev, shinri: false })); }}
                      className="p-2 text-gray-500 hover:text-cyan-400 transition-colors rounded-full hover:bg-white/5"
                      title="MBTI再診断"
                    >
                      <Brain className="w-5 h-5" />
                    </button>
                  )}
                  <StampPicker onSelect={(stamp: string) => setInput(prev => prev + stamp)} />
                </div>

                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={oracle?.placeholder || "メッセージを入力..."}
                  rows={1}
                  className="flex-1 bg-mystic-bg border border-gray-700 rounded-xl py-3 px-4 text-gray-200 placeholder:text-gray-600 resize-none focus:outline-none focus:border-gold/50 transition-colors min-h-[48px] max-h-[120px]"
                  style={{ height: "auto" }}
                  onInput={e => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = Math.min(target.scrollHeight, 120) + "px";
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="btn-primary p-3 rounded-xl disabled:opacity-30 disabled:transform-none flex-shrink-0"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
              {!isPremium && (
                <div className="max-w-3xl mx-auto mt-2 text-center">
                  <p className="text-xs text-gray-500">
                    無料プラン：残り{remainingToday}回 |{" "}
                    <button onClick={() => router.push("/pricing")} className="text-amber-400 hover:text-amber-300">
                      プレミアムにアップグレード
                    </button>
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden flex items-center justify-around border-t border-gray-800 bg-mystic-card/90 backdrop-blur-sm py-2">
          <button onClick={() => setMobileTab("chat")} className={`flex flex-col items-center gap-0.5 px-3 py-1 ${mobileTab === "chat" ? "text-gold" : "text-gray-500"}`}>
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px]">チャット</span>
          </button>
          <button onClick={() => setSidebarOpen(true)} className={`flex flex-col items-center gap-0.5 px-3 py-1 text-gray-500`}>
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px]">占い師</span>
          </button>
          <button onClick={() => router.push("/reading-history")} className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-500">
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px]">履歴</span>
          </button>
          <button onClick={() => router.push("/subscription")} className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-500">
            <Crown className="w-5 h-5" />
            <span className="text-[10px]">プラン</span>
          </button>
          <button onClick={() => router.push("/profile")} className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-500">
            <User className="w-5 h-5" />
            <span className="text-[10px]">設定</span>
          </button>
        </nav>
      </div>

      {/* Clear History Dialog */}
      {showClearHistoryDialog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-mystic-card border border-gray-800 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-serif text-gold mb-2">履歴を削除</h3>
            <p className="text-sm text-gray-400 mb-4">
              {oracle?.name}との会話履歴を全て削除しますか？この操作は取り消せません。
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowClearHistoryDialog(false)} className="px-4 py-2 rounded-lg bg-white/5 text-gray-300 text-sm hover:bg-white/10">
                キャンセル
              </button>
              <button onClick={handleClearHistory} className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30">
                削除する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activation Code Dialog */}
      {showActivationDialog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-mystic-card border border-gray-800 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-serif text-gold mb-2">アクティベーションコード</h3>
            <p className="text-sm text-gray-400 mb-4">
              プレミアムプランのアクティベーションコードを入力してください。
            </p>
            <input
              type="text"
              value={activationCodeInput}
              onChange={e => setActivationCodeInput(e.target.value)}
              placeholder="コードを入力..."
              className="w-full px-4 py-2 bg-white/5 border border-gray-700 rounded-lg text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-gold/30 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowActivationDialog(false); setActivationCodeInput(""); }} className="px-4 py-2 rounded-lg bg-white/5 text-gray-300 text-sm hover:bg-white/10">
                キャンセル
              </button>
              <button
                onClick={handleApplyActivationCode}
                disabled={isApplyingCode || !activationCodeInput.trim()}
                className="px-4 py-2 rounded-lg bg-gold/20 text-gold text-sm hover:bg-gold/30 disabled:opacity-50"
              >
                {isApplyingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : "適用"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fortune Result Modal */}
      {selectedFortuneMessage && oracle && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedFortuneMessage(null)}>
          <div className="bg-mystic-card border border-gray-800 rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <img src={oracle.image} alt={oracle.name} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <h3 className="text-lg font-serif text-gold">{oracle.name}の鑑定結果</h3>
                <p className="text-xs text-gray-500">{new Date(selectedFortuneMessage.timestamp).toLocaleString("ja-JP")}</p>
              </div>
            </div>
            <div className="text-sm text-gray-200 leading-relaxed">
              <Streamdown>{selectedFortuneMessage.content}</Streamdown>
            </div>
            <button onClick={() => setSelectedFortuneMessage(null)} className="mt-4 w-full py-2 rounded-lg bg-white/5 text-gray-300 text-sm hover:bg-white/10">
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
