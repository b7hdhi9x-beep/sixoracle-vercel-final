import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Heart, ArrowLeft, Trash2, MessageSquare, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { oracles, getOracleById } from "@/lib/oracles";
import { Streamdown } from "streamdown";
import { toast } from "sonner";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import DashboardLayout from "@/components/DashboardLayout";

export default function Favorites() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedOracleFilter, setSelectedOracleFilter] = useState<string>("all");
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // Get favorites
  const { data: favorites, isLoading, refetch } = trpc.chat.getFavorites.useQuery(
    { 
      oracleId: selectedOracleFilter === "all" ? undefined : selectedOracleFilter,
      limit: 100 
    },
    { enabled: isAuthenticated }
  );

  // Remove favorite mutation
  const removeFavoriteMutation = trpc.chat.removeFavorite.useMutation({
    onSuccess: () => {
      toast.success("お気に入りから削除しました");
      refetch();
      setDeleteTargetId(null);
    },
    onError: (error) => {
      toast.error(error.message || "削除に失敗しました");
    },
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-user-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Heart className="w-16 h-16 text-muted-foreground" />
          <p className="text-muted-foreground">ログインしてお気に入りを表示</p>
          <Link href="/">
            <Button>ホームに戻る</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container max-w-4xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                お気に入り鑑定
              </h1>
              <p className="text-sm text-muted-foreground">
                保存した鑑定結果を見返すことができます
              </p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <Select value={selectedOracleFilter} onValueChange={setSelectedOracleFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="占い師で絞り込み" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべての占い師</SelectItem>
              {oracles.map((oracle) => (
                <SelectItem key={oracle.id} value={oracle.id}>
                  {oracle.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Favorites List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-user-primary" />
          </div>
        ) : favorites && favorites.length > 0 ? (
          <div className="space-y-4">
            {favorites.map((favorite) => {
              const oracle = getOracleById(favorite.oracleId);
              return (
                <Card key={favorite.id} className="glass-card overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Oracle Avatar */}
                      <Avatar className="w-12 h-12 flex-shrink-0 ring-2 ring-user-primary/30">
                        <AvatarImage src={oracle?.image} alt={oracle?.name} />
                        <AvatarFallback>{oracle?.name?.[0]}</AvatarFallback>
                      </Avatar>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-medium text-user-primary">
                              {oracle?.name || "不明な占い師"}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {format(new Date(favorite.createdAt), "yyyy年M月d日 HH:mm", { locale: ja })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Continue conversation button */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs gap-1"
                              onClick={() => {
                                setLocation(`/dashboard?oracle=${favorite.oracleId}`);
                              }}
                            >
                              <MessageSquare className="w-3 h-3" />
                              会話を続ける
                            </Button>
                            {/* Delete button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                              onClick={() => setDeleteTargetId(favorite.messageId)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Message content */}
                        <div className="prose prose-invert prose-sm max-w-none text-sm text-foreground/80 line-clamp-6">
                          <Streamdown>{favorite.cachedContent}</Streamdown>
                        </div>

                        {/* Note if exists */}
                        {favorite.note && (
                          <div className="mt-3 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                            <p className="text-xs text-amber-400">📝 メモ: {favorite.note}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Heart className="w-16 h-16 text-muted-foreground/30" />
            <p className="text-muted-foreground text-center">
              {selectedOracleFilter === "all" 
                ? "お気に入りに保存した鑑定はまだありません"
                : "この占い師のお気に入りはありません"}
            </p>
            <Link href="/dashboard">
              <Button variant="outline">
                鑑定を受ける
              </Button>
            </Link>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteTargetId !== null} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>お気に入りから削除</AlertDialogTitle>
              <AlertDialogDescription>
                この鑑定をお気に入りから削除しますか？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>キャンセル</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={() => {
                  if (deleteTargetId) {
                    removeFavoriteMutation.mutate({ messageId: deleteTargetId });
                  }
                }}
              >
                削除する
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
