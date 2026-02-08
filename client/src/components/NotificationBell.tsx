import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Bell, Check, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

const typeLabels: Record<string, { label: string; color: string }> = {
  new_oracle: { label: "新占い師", color: "bg-purple-500" },
  weekly_fortune: { label: "週間運勢", color: "bg-blue-500" },
  payment: { label: "お支払い", color: "bg-green-500" },
  system: { label: "システム", color: "bg-gray-500" },
  campaign: { label: "キャンペーン", color: "bg-yellow-500" },
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: unreadCount } = trpc.notifications.getUnreadCount.useQuery(undefined, {
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: notifications, refetch } = trpc.notifications.getNotifications.useQuery(
    undefined,
    { enabled: isOpen }
  );

  const markAsRead = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  const markAllAsRead = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  // Note: delete functionality removed - not implemented in backend

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (id: number, link?: string | null) => {
    markAsRead.mutate({ notificationId: id });
    if (link) {
      window.location.href = link;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={handleBellClick}
      >
        <Bell className="w-5 h-5" />
        {unreadCount && unreadCount.count > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount.count > 9 ? "9+" : unreadCount.count}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 max-h-96 overflow-hidden rounded-lg border border-border bg-card shadow-xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
              <h3 className="font-semibold text-sm">通知</h3>
              <div className="flex items-center gap-1">
                {notifications && notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => markAllAsRead.mutate()}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    すべて既読
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto max-h-72">
              {!notifications || notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Bell className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">通知はありません</p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {notifications.map((notification) => {
                    const typeInfo = typeLabels[notification.type] || {
                      label: "通知",
                      color: "bg-gray-500",
                    };

                    return (
                      <li
                        key={notification.id}
                        className={`relative px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                          !notification.isRead ? "bg-primary/5" : ""
                        }`}
                        onClick={() =>
                          handleNotificationClick(notification.id, notification.link)
                        }
                      >
                        <div className="flex items-start gap-3">
                          {/* Unread indicator */}
                          {!notification.isRead && (
                            <span className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`px-2 py-0.5 text-xs rounded-full text-white ${typeInfo.color}`}
                              >
                                {typeInfo.label}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                  locale: ja,
                                })}
                              </span>
                            </div>
                            <h4 className="font-medium text-sm truncate">
                              {notification.title}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {notification.message}
                            </p>
                          </div>

                          {/* Delete button */}
{/* Delete button - feature not implemented
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                          */}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            {notifications && notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-border bg-muted/50">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = "/notifications";
                  }}
                >
                  すべての通知を見る
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
