import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { X, Bell, CheckCircle, AlertTriangle, PartyPopper, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  type: string;
  message: string;
  data?: Record<string, unknown>;
}

const iconMap: Record<string, React.ReactNode> = {
  welcome: <PartyPopper className="w-5 h-5 text-yellow-400" />,
  payment_success: <CheckCircle className="w-5 h-5 text-green-400" />,
  subscription_renewed: <CreditCard className="w-5 h-5 text-blue-400" />,
  subscription_canceled: <AlertTriangle className="w-5 h-5 text-orange-400" />,
  payment_failed: <AlertTriangle className="w-5 h-5 text-red-400" />,
};

const bgColorMap: Record<string, string> = {
  welcome: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30",
  payment_success: "from-green-500/20 to-emerald-500/20 border-green-500/30",
  subscription_renewed: "from-blue-500/20 to-indigo-500/20 border-blue-500/30",
  subscription_canceled: "from-orange-500/20 to-amber-500/20 border-orange-500/30",
  payment_failed: "from-red-500/20 to-rose-500/20 border-red-500/30",
};

export function NotificationBanner() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  const { data, isLoading } = trpc.notifications.getNotifications.useQuery(undefined, {
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const markAllAsRead = trpc.notifications.markAllAsRead.useMutation();

  useEffect(() => {
    if (data && data.length > 0) {
      // Convert database notifications to banner format
      const bannerNotifications = data
        .filter(n => !n.isRead)
        .slice(0, 5)
        .map(n => ({
          type: n.type,
          message: n.message,
        }));
      setNotifications(bannerNotifications);
    }
  }, [data]);

  const handleDismiss = (index: number) => {
    setDismissed((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });
    
    // If all notifications are dismissed, mark all as read
    if (dismissed.size + 1 >= notifications.length) {
      markAllAsRead.mutate();
    }
  };

  const handleDismissAll = () => {
    markAllAsRead.mutate();
    setNotifications([]);
    setDismissed(new Set());
  };

  if (isLoading || notifications.length === 0) {
    return null;
  }

  const visibleNotifications = notifications.filter((_, i) => !dismissed.has(i));

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mb-4">
      <AnimatePresence>
        {notifications.map((notification, index) => {
          if (dismissed.has(index)) return null;

          const icon = iconMap[notification.type] || <Bell className="w-5 h-5 text-primary" />;
          const bgColor = bgColorMap[notification.type] || "from-primary/20 to-primary/10 border-primary/30";

          return (
            <motion.div
              key={`${notification.type}-${index}`}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`relative overflow-hidden rounded-lg border bg-gradient-to-r ${bgColor} backdrop-blur-sm`}
            >
              <div className="flex items-center gap-3 p-4">
                <div className="flex-shrink-0">
                  {icon}
                </div>
                <p className="flex-1 text-sm text-foreground">
                  {notification.message}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 h-8 w-8 hover:bg-white/10"
                  onClick={() => handleDismiss(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {visibleNotifications.length > 1 && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={handleDismissAll}
          >
            すべて既読にする
          </Button>
        </div>
      )}
    </div>
  );
}
