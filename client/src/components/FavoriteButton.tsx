import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface FavoriteButtonProps {
  messageId: number;
  oracleId: string;
  content: string;
  className?: string;
}

export function FavoriteButton({ messageId, oracleId, content, className }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  
  // Check if message is favorited
  const { data: favoriteStatus } = trpc.chat.isFavorited.useQuery(
    { messageId },
    { enabled: messageId > 0 }
  );
  
  useEffect(() => {
    if (favoriteStatus) {
      setIsFavorited(favoriteStatus.isFavorited);
    }
  }, [favoriteStatus]);
  
  const addFavoriteMutation = trpc.chat.addFavorite.useMutation({
    onSuccess: () => {
      setIsFavorited(true);
      toast.success("お気に入りに追加しました");
    },
    onError: (error) => {
      toast.error(error.message || "お気に入りの追加に失敗しました");
    },
  });
  
  const removeFavoriteMutation = trpc.chat.removeFavorite.useMutation({
    onSuccess: () => {
      setIsFavorited(false);
      toast.success("お気に入りから削除しました");
    },
    onError: (error) => {
      toast.error(error.message || "お気に入りの削除に失敗しました");
    },
  });
  
  const handleToggleFavorite = () => {
    if (messageId <= 0) {
      toast.error("このメッセージはお気に入りに追加できません");
      return;
    }
    
    if (isFavorited) {
      removeFavoriteMutation.mutate({ messageId });
    } else {
      addFavoriteMutation.mutate({ messageId, oracleId, content });
    }
  };
  
  const isLoading = addFavoriteMutation.isPending || removeFavoriteMutation.isPending;
  
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`p-1 h-auto ${className}`}
      onClick={handleToggleFavorite}
      disabled={isLoading || messageId <= 0}
    >
      <Heart 
        className={`w-4 h-4 transition-all ${
          isFavorited 
            ? "fill-red-500 text-red-500" 
            : "text-muted-foreground hover:text-red-400"
        }`} 
      />
    </Button>
  );
}
