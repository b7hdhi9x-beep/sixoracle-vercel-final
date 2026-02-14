"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getOracleById, oracles } from "@/lib/oracles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatPageInner />
    </Suspense>
  );
}

function ChatPageInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const oracleId = params.oracleId as string;
  const oracle = getOracleById(oracleId);
  const existingSessionId = searchParams.get("session");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(
    existingSessionId
  );
  const [initialized, setInitialized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 既存セッションの復元 or 初回挨拶
  useEffect(() => {
    if (initialized || !oracle) return;
    setInitialized(true);

    if (existingSessionId) {
      fetch(`/api/chat/sessions/${existingSessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.messages) {
            setMessages(
              data.messages
                .filter((m: { role: string }) => m.role !== "SYSTEM")
                .map((m: { id: string; role: string; content: string }) => ({
                  id: m.id,
                  role: m.role === "USER" ? "user" : "assistant",
                  content: m.content,
                }))
            );
          }
        })
        .catch(console.error);
    } else {
      setMessages([
        { id: "greeting", role: "assistant", content: oracle.greeting },
      ]);
    }
  }, [oracle, existingSessionId, initialized]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading || !oracle) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput("");
    setIsLoading(true);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
    };
    setMessages([...currentMessages, assistantMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          oracleId: oracle.id,
          sessionId,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "チャットAPIでエラーが発生しました");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("ストリームが取得できませんでした");

      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessage.id
                      ? { ...m, content: fullText }
                      : m
                  )
                );
              }
              if (parsed.sessionId && !sessionId) {
                setSessionId(parsed.sessionId);
              }
              if (parsed.error) throw new Error(parsed.error);
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? {
                ...m,
                content:
                  "申し訳ございません。通信に問題が発生しました。しばらくしてから再度お試しください。",
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, oracle, messages, sessionId]);

  if (!oracle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[#9ca3af]">占い師が見つかりません</p>
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="border-[#d4af37]/30 text-[#d4af37]"
            >
              占い師一覧に戻る
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* ヘッダー */}
      <header className="shrink-0 border-b border-[rgba(212,175,55,0.15)] bg-[#0a0a1a]/90 backdrop-blur-xl z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-[#9ca3af] hover:text-[#d4af37] transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <div
              className="text-2xl w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${oracle.gradientFrom}, ${oracle.gradientTo})`,
              }}
            >
              {oracle.icon}
            </div>
            <div>
              <h1
                className="font-[var(--font-noto-serif-jp)] font-bold text-base"
                style={{ color: oracle.color }}
              >
                {oracle.name}
              </h1>
              <p className="text-[10px] text-[#9ca3af]">{oracle.specialty}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 新規チャット */}
            <Link
              href={`/dashboard/chat/${oracleId}`}
              className="text-[#9ca3af] hover:text-[#d4af37] transition-colors p-2"
              title="新しいチャット"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </Link>

            {/* 占い師切替シート */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="text-[#9ca3af] hover:text-[#d4af37] transition-colors p-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </SheetTrigger>
              <SheetContent className="bg-[#0d0d24] border-[rgba(212,175,55,0.15)] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-[#d4af37] font-[var(--font-noto-serif-jp)]">
                    占い師を変更
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  {oracles.map((o) => (
                    <Link
                      key={o.id}
                      href={`/dashboard/chat/${o.id}`}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        o.id === oracleId
                          ? "bg-[rgba(212,175,55,0.15)]"
                          : "hover:bg-[rgba(255,255,255,0.05)]"
                      }`}
                    >
                      <div
                        className="text-xl w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${o.gradientFrom}, ${o.gradientTo})`,
                        }}
                      >
                        {o.icon}
                      </div>
                      <div>
                        <p
                          className="text-sm font-bold"
                          style={{ color: o.color }}
                        >
                          {o.name}
                        </p>
                        <p className="text-[10px] text-[#9ca3af]">
                          {o.specialty}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* チャットエリア */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex gap-3 max-w-[85%] ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div
                      className="text-lg w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1"
                      style={{
                        background: `linear-gradient(135deg, ${oracle.gradientFrom}, ${oracle.gradientTo})`,
                      }}
                    >
                      {oracle.icon}
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      message.role === "user"
                        ? "bg-[#7c3aed]/30 text-white rounded-br-sm"
                        : "glass-card rounded-bl-sm"
                    }`}
                  >
                    {message.content}
                    {message.role === "assistant" &&
                      message.content === "" &&
                      isLoading && (
                        <span className="inline-flex gap-1">
                          <span className="w-1.5 h-1.5 bg-[#d4af37] rounded-full animate-bounce" />
                          <span
                            className="w-1.5 h-1.5 bg-[#d4af37] rounded-full animate-bounce"
                            style={{ animationDelay: "0.15s" }}
                          />
                          <span
                            className="w-1.5 h-1.5 bg-[#d4af37] rounded-full animate-bounce"
                            style={{ animationDelay: "0.3s" }}
                          />
                        </span>
                      )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* 入力エリア */}
      <div className="shrink-0 border-t border-[rgba(212,175,55,0.15)] bg-[#0a0a1a]/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing
                ) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={`${oracle.name}に相談する...`}
              disabled={isLoading}
              className="flex-1 bg-[rgba(255,255,255,0.05)] border-[rgba(212,175,55,0.2)] text-white placeholder:text-[#9ca3af]/50 focus:border-[#d4af37]/50 focus:ring-[#d4af37]/20"
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-[#d4af37] hover:bg-[#f4d03f] text-[#0a0a1a] font-bold px-6 disabled:opacity-30"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </Button>
          </div>
          <p className="text-[10px] text-[#9ca3af]/40 text-center mt-2">
            AI占いはエンターテインメントです。重要な決断は専門家にご相談ください。
          </p>
        </div>
      </div>
    </div>
  );
}
