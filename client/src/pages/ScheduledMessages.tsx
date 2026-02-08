import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getOracleById } from "@/lib/oracles";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ArrowLeft, Bell, Calendar, Sun, Moon, Sparkles, Check, CheckCheck, Mail, MailOpen, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Streamdown } from "streamdown";

const messageTypeIcons: Record<string, any> = {
  weekly_fortune: Calendar,
  daily_fortune: Sun,
  seasonal: Moon,
  special: Sparkles,
};

const messageTypeLabels: Record<string, string> = {
  weekly_fortune: "週間運勢",
  daily_fortune: "今日の運勢",
  seasonal: "季節のメッセージ",
  special: "特別なメッセージ",
};

export default function ScheduledMessages() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // Get scheduled messages
  const { data: messages, isLoading: messagesLoading, refetch } = trpc.scheduledMessages.list.useQuery(
    { limit: 50 },
    { enabled: !!user }
  );
  
  // Get unread count
  const { data: unreadData } = trpc.scheduledMessages.unreadCount.useQuery(
    undefined,
    { enabled: !!user }
  );
  
  // Mark as read mutation
  const markReadMutation = trpc.scheduledMessages.markRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  
  // Mark all as read mutation
  const markAllReadMutation = trpc.scheduledMessages.markAllRead.useMutation({
    onSuccess: () => {
      toast.success("すべて既読にしました");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "エラーが発生しました");
    },
  });
  
  const handleMarkRead = (messageId: number) => {
    markReadMutation.mutate({ messageId });
  };
  
  if (authLoading || messagesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    navigate("/");
    return null;
  }
  
  const unreadCount = unreadData?.count || 0;
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-purple-950/30 to-slate-950" />
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              opacity: Math.random() * 0.7 + 0.3,
              animation: `twinkle ${Math.random() * 3 + 2}s infinite ease-in-out ${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Bell className="w-6 h-6 text-amber-400" />
                <h1 className="text-xl font-bold text-white">占い師からのメッセージ</h1>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-rose-500 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-muted-foreground hover:text-white"
                >
                  <CheckCheck className="w-4 h-4 mr-1" />
                  すべて既読
                </Button>
              )}
              <Link href="/message-settings">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <main className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        {messages && messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const oracle = getOracleById(message.oracleId);
              const Icon = messageTypeIcons[message.messageType] || Bell;
              const typeLabel = messageTypeLabels[message.messageType] || "メッセージ";
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card 
                    className={`glass-card transition-all cursor-pointer ${
                      !message.isRead 
                        ? "border-amber-400/50 bg-amber-400/5" 
                        : "hover:border-white/30"
                    }`}
                    onClick={() => !message.isRead && handleMarkRead(message.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Oracle Avatar */}
                        <Avatar className={`w-12 h-12 flex-shrink-0 ${!message.isRead ? "ring-2 ring-amber-400" : ""}`}>
                          <AvatarImage src={oracle?.image} alt={oracle?.name} />
                          <AvatarFallback className={`bg-gradient-to-br ${oracle?.color || "from-gray-600 to-gray-800"}`}>
                            {oracle?.name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-white">{oracle?.name || "占い師"}</span>
                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground">
                              <Icon className="w-3 h-3" />
                              {typeLabel}
                            </span>
                            {!message.isRead && (
                              <Mail className="w-4 h-4 text-amber-400" />
                            )}
                          </div>
                          
                          <div className="prose prose-invert prose-sm max-w-none text-muted-foreground">
                            <Streamdown>{message.content}</Streamdown>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(message.scheduledAt), "yyyy年M月d日 HH:mm", { locale: ja })}
                            </span>
                            {message.isRead ? (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MailOpen className="w-3 h-3" />
                                既読
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs text-amber-400">
                                <Check className="w-3 h-3" />
                                タップで既読
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <Bell className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">メッセージはまだありません</h3>
            <p className="text-muted-foreground mb-6">
              占い師からの定期メッセージがここに届きます
            </p>
            <Link href="/message-settings">
              <Button className="btn-primary">
                <Settings className="w-4 h-4 mr-2" />
                配信設定を確認
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
