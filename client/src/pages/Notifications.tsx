import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Bell, Check, Trash2, Settings, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { Link } from "wouter";
import MobileNav from "@/components/MobileNav";

const typeLabels: Record<string, { label: string; color: string }> = {
  new_oracle: { label: "新占い師", color: "bg-purple-500" },
  weekly_fortune: { label: "週間運勢", color: "bg-blue-500" },
  payment: { label: "お支払い", color: "bg-green-500" },
  system: { label: "システム", color: "bg-gray-500" },
  campaign: { label: "キャンペーン", color: "bg-yellow-500" },
};

export default function Notifications() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("all");

  const { data: notifications, refetch } = trpc.notifications.getNotifications.useQuery(
    undefined,
    { enabled: !!user }
  );

  const { data: emailPrefs, refetch: refetchPrefs } =
    trpc.notifications.getEmailPreferences.useQuery(undefined, {
      enabled: !!user,
    });

  const markAsRead = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  const markAllAsRead = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  // Note: delete functionality not implemented in backend

  const updateEmailPrefs = trpc.notifications.updateEmailPreferences.useMutation({
    onSuccess: () => refetchPrefs(),
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              通知を表示するにはログインが必要です
            </p>
            <Button asChild>
              <Link href="/">ホームに戻る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const unreadNotifications = notifications?.filter((n) => !n.isRead) || [];
  const readNotifications = notifications?.filter((n) => n.isRead) || [];

  const displayNotifications =
    activeTab === "unread" ? unreadNotifications : notifications || [];

  const handleEmailPrefChange = (key: "weeklyFortune" | "newOracle" | "campaign", value: boolean) => {
    if (!emailPrefs) return;
    updateEmailPrefs.mutate({
      weeklyFortune: key === "weeklyFortune" ? value : emailPrefs.weeklyFortune,
      newOracle: key === "newOracle" ? value : emailPrefs.newOracle,
      campaign: key === "campaign" ? value : emailPrefs.campaign,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navigation */}
      <MobileNav />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/dashboard">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="font-semibold">通知</h1>
        </div>
      </header>

      <main className="container py-6">
        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all" onClick={() => setActiveTab("all")}>
                すべて
                {notifications && notifications.length > 0 && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({notifications.length})
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread" onClick={() => setActiveTab("unread")}>
                未読
                {unreadNotifications.length > 0 && (
                  <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5">
                    {unreadNotifications.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings" onClick={() => setActiveTab("settings")}>
                <Settings className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>

            {activeTab !== "settings" && unreadNotifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsRead.mutate()}
              >
                <Check className="w-4 h-4 mr-1" />
                すべて既読にする
              </Button>
            )}
          </div>

          {/* All / Unread Notifications */}
          <TabsContent value="all" className="space-y-4">
            {renderNotificationList(displayNotifications)}
          </TabsContent>

          <TabsContent value="unread" className="space-y-4">
            {renderNotificationList(displayNotifications)}
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">メール通知設定</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weekly-fortune">週間運勢メール</Label>
                    <p className="text-sm text-muted-foreground">
                      毎週月曜日に週間運勢をお届けします
                    </p>
                  </div>
                  <Switch
                    id="weekly-fortune"
                    checked={emailPrefs?.weeklyFortune ?? true}
                    onCheckedChange={(checked) =>
                      handleEmailPrefChange("weeklyFortune", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="new-oracle">新占い師のお知らせ</Label>
                    <p className="text-sm text-muted-foreground">
                      新しい占い師が追加されたときに通知します
                    </p>
                  </div>
                  <Switch
                    id="new-oracle"
                    checked={emailPrefs?.newOracle ?? true}
                    onCheckedChange={(checked) =>
                      handleEmailPrefChange("newOracle", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="campaign">キャンペーン情報</Label>
                    <p className="text-sm text-muted-foreground">
                      お得なキャンペーン情報をお届けします
                    </p>
                  </div>
                  <Switch
                    id="campaign"
                    checked={emailPrefs?.campaign ?? true}
                    onCheckedChange={(checked) =>
                      handleEmailPrefChange("campaign", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );

  function renderNotificationList(items: typeof notifications) {
    if (!items || items.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">通知はありません</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-2">
        {items.map((notification) => {
          const typeInfo = typeLabels[notification.type] || {
            label: "通知",
            color: "bg-gray-500",
          };

          return (
            <Card
              key={notification.id}
              className={`transition-colors ${
                !notification.isRead ? "border-primary/30 bg-primary/5" : ""
              }`}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  {/* Unread indicator */}
                  <div className="flex-shrink-0 pt-1">
                    {!notification.isRead ? (
                      <span className="w-2 h-2 bg-primary rounded-full block" />
                    ) : (
                      <span className="w-2 h-2 block" />
                    )}
                  </div>

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
                    <h4 className="font-medium mb-1">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    {notification.link && (
                      <Button
                        variant="link"
                        size="sm"
                        className="px-0 h-auto mt-2"
                        asChild
                      >
                        <a href={notification.link}>詳細を見る →</a>
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => markAsRead.mutate({ notificationId: notification.id })}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
{/* Delete button - feature not implemented
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    */}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }
}
