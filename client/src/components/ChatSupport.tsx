import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

// Translations for the chat support widget
const chatSupportText = {
  title: {
    ja: "サポートチャット",
    en: "Support Chat",
    zh: "客服聊天",
    ko: "고객 지원 채팅",
    es: "Chat de Soporte",
    fr: "Chat d'Assistance",
  },
  placeholder: {
    ja: "ご質問をどうぞ...",
    en: "Type your question...",
    zh: "请输入您的问题...",
    ko: "질문을 입력하세요...",
    es: "Escriba su pregunta...",
    fr: "Tapez votre question...",
  },
  greeting: {
    ja: "こんにちは！六神ノ間サポートです。ログインやサービスについてのご質問にお答えします。どのようなことでお困りですか？",
    en: "Hello! This is Six Oracle Support. I can help you with questions about login and our services. How can I assist you?",
    zh: "您好！这是六神之间客服。我可以帮助您解答有关登录和服务的问题。有什么可以帮您的？",
    ko: "안녕하세요! 식스 오라클 지원입니다. 로그인 및 서비스에 관한 질문에 답변해 드립니다. 무엇을 도와드릴까요?",
    es: "¡Hola! Este es el Soporte de Six Oracle. Puedo ayudarte con preguntas sobre inicio de sesión y nuestros servicios. ¿En qué puedo ayudarte?",
    fr: "Bonjour ! C'est le Support Six Oracle. Je peux vous aider avec des questions sur la connexion et nos services. Comment puis-je vous aider ?",
  },
  sending: {
    ja: "送信中...",
    en: "Sending...",
    zh: "发送中...",
    ko: "전송 중...",
    es: "Enviando...",
    fr: "Envoi en cours...",
  },
  loginRequired: {
    ja: "チャットサポートを利用するにはログインが必要です",
    en: "Please log in to use chat support",
    zh: "请登录以使用聊天支持",
    ko: "채팅 지원을 사용하려면 로그인이 필요합니다",
    es: "Por favor, inicie sesión para usar el chat de soporte",
    fr: "Veuillez vous connecter pour utiliser le chat d'assistance",
  },
  helpLink: {
    ja: "ヘルプページを見る",
    en: "View Help Page",
    zh: "查看帮助页面",
    ko: "도움말 페이지 보기",
    es: "Ver página de ayuda",
    fr: "Voir la page d'aide",
  },
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function ChatSupport() {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Hide on dashboard page to avoid overlapping with oracle selection
  const isDashboard = location === '/dashboard';

  // Support chat mutation
  const supportMutation = trpc.support.chat.useMutation({
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }]);
    },
    onError: (error) => {
      toast.error(error.message || "エラーが発生しました");
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  // Initialize with greeting message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: "greeting",
        role: "assistant",
        content: chatSupportText.greeting[language],
        timestamp: new Date(),
      }]);
    }
  }, [isOpen, language, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    supportMutation.mutate({
      message: userMessage.content,
      language: language,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Don't render on dashboard
  if (isDashboard) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          isOpen 
            ? "bg-muted hover:bg-muted/80" 
            : "bg-gold hover:bg-gold/90 animate-pulse hover:animate-none"
        }`}
        aria-label={isOpen ? "Close support chat" : "Open support chat"}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-foreground" />
        ) : (
          <MessageCircle className="w-6 h-6 text-black" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-120px)] bg-background/95 backdrop-blur-lg border border-border/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border/50 bg-gold/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-gold" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gold">{chatSupportText.title[language]}</h3>
              <p className="text-xs text-muted-foreground">六神ノ間</p>
            </div>
            <a 
              href="/help" 
              className="text-xs text-gold hover:underline"
              onClick={() => setIsOpen(false)}
            >
              {chatSupportText.helpLink[language]}
            </a>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                      message.role === "user"
                        ? "bg-gold text-black rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <Streamdown className="text-sm leading-relaxed">{message.content}</Streamdown>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-gold" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          {isAuthenticated ? (
            <div className="p-3 border-t border-border/50">
              <div className="flex gap-2">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={chatSupportText.placeholder[language]}
                  className="min-h-[44px] max-h-[120px] resize-none bg-muted border-0 focus-visible:ring-1 focus-visible:ring-gold"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="h-[44px] w-[44px] p-0 bg-gold hover:bg-gold/90 text-black shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 border-t border-border/50 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {chatSupportText.loginRequired[language]}
              </p>
              <a href="/login">
                <Button variant="outline" size="sm" className="border-gold/30 text-gold hover:bg-gold/10">
                  ログイン
                </Button>
              </a>
            </div>
          )}
        </div>
      )}
    </>
  );
}
