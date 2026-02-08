import { Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface OracleFavoriteStarProps {
  oracleId: string;
  className?: string;
}

export function OracleFavoriteStar({ oracleId, className }: OracleFavoriteStarProps) {
  const utils = trpc.useUtils();
  
  const { data: favorites } = trpc.favorites.list.useQuery();
  
  const isFavorited = favorites?.some(f => f.oracleId === oracleId) ?? false;
  
  const addMutation = trpc.favorites.add.useMutation({
    onSuccess: () => {
      utils.favorites.list.invalidate();
      toast.success("お気に入りに追加しました ⭐");
    },
    onError: () => {
      toast.error("お気に入りの追加に失敗しました");
    },
  });
  
  const removeMutation = trpc.favorites.remove.useMutation({
    onSuccess: () => {
      utils.favorites.list.invalidate();
      toast.success("お気に入りから削除しました");
    },
    onError: () => {
      toast.error("お気に入りの削除に失敗しました");
    },
  });
  
  const isLoading = addMutation.isPending || removeMutation.isPending;
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;
    
    if (isFavorited) {
      removeMutation.mutate({ oracleId });
    } else {
      addMutation.mutate({ oracleId });
    }
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`p-1 rounded-full transition-all duration-300 hover:scale-125 ${className}`}
      title={isFavorited ? "お気に入りから削除" : "お気に入りに追加"}
    >
      <Star
        className={`w-4 h-4 transition-all duration-300 ${
          isFavorited
            ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.6)]"
            : "text-muted-foreground/40 hover:text-yellow-400/60"
        } ${isLoading ? "animate-pulse" : ""}`}
      />
    </button>
  );
}
