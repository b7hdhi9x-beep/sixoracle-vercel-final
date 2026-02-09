"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { oracles, getOracleById } from "@/lib/oracles";
import {
  canSendMessage, getRemainingMessages, incrementDailyUsage,
  createSession, addMessage, getSessions, ChatSession, ChatMessage,
  deleteSession,
} from "@/lib/chatStorage";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Menu, X, LogOut, Crown, Sparkles, Trash2, Plus,
  Clock, Heart, Calculator, Lightbulb, Moon, Shield, Star,
  Hand, Droplet, Cat, Brain, MessageSquare, Settings,
} from "lucide-react";

const iconMap: Record<string, any> = {
  Clock, Heart, Calculator, Lightbulb, Moon, Shield, Hand, Star, Droplet, Cat, Brain,
};

export default function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loading: authLoading, logout, isPremiumActive } = useAuth();
  const [selectedOracle, setSelectedOracle] = useState(oracles[0]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Handle oracle selection from URL params
  useEffect(() => {
    const oracleId = searchParams.get("oracle");
    if (oracleId) {
      const oracle = getOracleById(oracleId);
      if (oracle) {
        setSelectedOracle(oracle);
        setCurrentSession(null);
        setMessages([]);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectOracle = useCallback((oracle: typeof oracles[0]) => {
    setSelectedOracle(oracle);
    setCurrentSession(null);
    setMessages([]);
    setSidebarOpen(false);
  }, []);

  const loadSession = useCallback((session: ChatSession) => {
    const oracle = getOracleById(session.oracleId);
    if (oracle) {
      setSelectedOracle(oracle);
      setCurrentSession(session);
      setMessages(session.messages);
      setSidebarOpen(false);
    }
  }, []);

  const startNewChat = useCallback(() => {
    setCurrentSession(null);
    setMessages([]);
  }, []);

  const handleDeleteSession = useCallback((sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSession(sessionId);
    setSessions(getSessions());
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
      setMessages([]);
    }
  }, [currentSession]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;


    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    let session = currentSession;
    if (!session) {
      session = createSession(selectedOracle.id, userMessage.substring(0, 50));
      setCurrentSession(session);
    }

    const userMsg = addMessage(session.id, "user", userMessage, selectedOracle.id);
    setMessages(prev => [...prev, userMsg]);
    incrementDailyUsage();

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
          systemPrompt: selectedOracle.systemPrompt,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const assistantMsg = addMessage(session.id, "assistant", data.message, selectedOracle.id);
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      const errorMsg = addMessage(
        session.id, "assistant",
        "申し訳ございません。星々の導きが一時的に途絶えてしまいました... しばらくしてからもう一度お試しください。",
        selectedOracle.id
      );
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setSessions(getSessions());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const OracleIcon = iconMap[selectedOracle.icon];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center mystical-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold" />
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden mystical-bg">
      {/* Sidebar */}
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
              className="fixed left-0 top-0 bottom-0 w-72 bg-mystic-card border-r border-gray-800 z-50 flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="font-serif gradient-text text-lg">六神ノ間</h2>
                <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Oracle Grid with images */}
              <div className="p-3 border-b border-gray-800">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">占い師を選ぶ</p>
                <div className="grid grid-cols-4 gap-2">
                  {oracles.map(oracle => {
                    const Icon = iconMap[oracle.icon];
                    const isSelected = selectedOracle.id === oracle.id;
                    return (
                      <button
                        key={oracle.id}
                        onClick={() => selectOracle(oracle)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                          isSelected ? "bg-gold/20 border border-gold/40" : "hover:bg-white/5"
                        }`}
                        title={oracle.name}
                      >
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${oracle.color} flex items-center justify-center overflow-hidden shadow-md`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={oracle.image} alt={oracle.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] text-gray-400 truncate w-full text-center">
                          {oracle.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-3">
                <div className="flex items-center justify-between mb-2 px-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">履歴</p>
                  <button onClick={startNewChat} className="text-gold hover:text-gold-light transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  {sessions.filter(s => s.oracleId === selectedOracle.id).slice(0, 20).map(session => (
                    <button
                      key={session.id}
                      onClick={() => loadSession(session)}
                      className={`w-full text-left p-2 rounded-lg text-sm flex items-center gap-2 group transition-all ${
                        currentSession?.id === session.id ? "bg-gold/10 text-gold" : "text-gray-400 hover:bg-white/5"
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate flex-1">{session.title}</span>
                      <button
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </button>
                  ))}
                </div>
              </div>

              {/* User Info */}
              <div className="p-4 border-t border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                      {user?.phone?.slice(-2) || "??"}
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">{user?.phone || "ゲスト"}</p>
                      <p className="text-xs text-gray-500">
                        {user?.isPremium ? (
                          <span className="text-gold flex items-center gap-1">
                            <Crown className="w-3 h-3" /> プレミアム
                          </span>
                        ) : "月額プラン"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {user?.isAdmin && (
                      <button
                        onClick={() => { router.push("/admin"); setSidebarOpen(false); }}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="管理画面"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={logout} className="text-gray-500 hover:text-red-400 transition-colors">
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {!user?.isPremium && (
                  <button
                    onClick={() => router.push("/login")}
                    className="block w-full text-center py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-sm font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all"
                  >
                    <Crown className="w-4 h-4 inline mr-1" />
                    プレミアムに登録
                  </button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-mystic-card/80 backdrop-blur-sm">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${selectedOracle.color} flex items-center justify-center shadow-lg overflow-hidden`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedOracle.image} alt={selectedOracle.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-serif text-gold truncate">{selectedOracle.name}</h1>
            <p className="text-xs text-gray-500 truncate">{selectedOracle.role}</p>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            {isPremiumActive ? (
              <><Crown className="w-3.5 h-3.5 text-amber-400" /><span className="text-amber-400">プレミアム</span></>
            ) : (
              <><MessageSquare className="w-3.5 h-3.5" /><span>未登録</span></>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${selectedOracle.color} flex items-center justify-center mb-4 shadow-xl overflow-hidden`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedOracle.image} alt={selectedOracle.name} className="w-full h-full object-cover" />
              </div>
              <h2 className="text-xl font-serif text-gold mb-2">{selectedOracle.name}</h2>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">{selectedOracle.englishName}</p>
              <p className="text-sm text-gray-400 max-w-md mb-6">{selectedOracle.description}</p>
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
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 mt-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedOracle.image} alt={selectedOracle.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className={`max-w-[80%] md:max-w-[65%] px-4 py-3 ${
                msg.role === "user" ? "chat-bubble-user" : "chat-bubble-oracle"
              }`}>
                {msg.role === "assistant" && (
                  <p className="text-xs text-gold/60 mb-1 font-serif">{selectedOracle.name}</p>
                )}
                <div className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed chat-markdown"
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                />
                <p className="text-[10px] text-gray-600 mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedOracle.image} alt={selectedOracle.name} className="w-full h-full object-cover" />
              </div>
              <div className="chat-bubble-oracle px-4 py-3">
                <p className="text-xs text-gold/60 mb-2 font-serif">{selectedOracle.typingMessage}</p>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-gold/60 loading-dot" />
                  <div className="w-2 h-2 rounded-full bg-gold/60 loading-dot" />
                  <div className="w-2 h-2 rounded-full bg-gold/60 loading-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-800 bg-mystic-card/80 backdrop-blur-sm p-4">
          {isPremiumActive ? (
            <div className="flex items-end gap-2 max-w-3xl mx-auto">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedOracle.placeholder}
                rows={1}
                className="flex-1 bg-mystic-bg border border-gray-700 rounded-xl py-3 px-4 text-gray-200 placeholder:text-gray-600 resize-none focus:outline-none focus:border-gold/50 transition-colors min-h-[48px] max-h-[120px]"
                style={{ height: "auto" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = Math.min(target.scrollHeight, 120) + "px";
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="btn-primary p-3 rounded-xl disabled:opacity-30 disabled:transform-none flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto text-center py-2">
              <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 rounded-xl p-4">
                <Crown className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <p className="text-sm text-amber-200 mb-3">鑑定機能をご利用いただくには、プレミアムプランへの登録が必要です</p>
                <button
                  onClick={() => router.push("/login")}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-sm font-semibold hover:from-amber-600 hover:to-yellow-600 transition-all"
                >
                  プレミアムに登録（¥1,980/月）
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple markdown-like formatting
function formatMessage(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}
