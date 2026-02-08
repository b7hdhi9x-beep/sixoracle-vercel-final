import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GuardianModeToggleProps {
  compact?: boolean;
  className?: string;
}

export function GuardianModeToggle({ compact = false, className = "" }: GuardianModeToggleProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // @ts-ignore - API exists but type not generated yet
  const { data: settings, isLoading, refetch } = (trpc.companion as any).getSettings?.useQuery?.() || { 
    data: null, 
    isLoading: false,
    refetch: () => {} 
  };

  // @ts-ignore
  const updateMutation = (trpc.companion as any).updateSettings?.useMutation?.({
    onSuccess: () => {
      toast.success(isEnabled ? "見守りモードをオフにしました" : "見守りモードをオンにしました", {
        description: isEnabled 
          ? "通常の相談モードに戻りました" 
          : "六神があなたを静かに見守ります",
      });
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "設定の更新に失敗しました");
      // Revert UI state on error
      setIsEnabled(!isEnabled);
    },
    onSettled: () => {
      setIsUpdating(false);
    },
  }) || { mutate: () => {}, isPending: false };

  // Sync local state with server data
  useEffect(() => {
    if (settings) {
      setIsEnabled(settings.watchModeEnabled || false);
    }
  }, [settings]);

  const handleToggle = (checked: boolean) => {
    setIsEnabled(checked);
    setIsUpdating(true);
    updateMutation.mutate({ watchModeEnabled: checked });
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => handleToggle(!isEnabled)}
            disabled={isUpdating || updateMutation.isPending}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition-colors ${
              isEnabled 
                ? "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30" 
                : "bg-white/5 text-muted-foreground hover:bg-white/10"
            } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
          >
            {isUpdating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isEnabled ? (
              <Eye className="w-3.5 h-3.5" />
            ) : (
              <EyeOff className="w-3.5 h-3.5" />
            )}
            <span className="text-xs font-medium">見守り</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">見守りモード</p>
            <p className="text-xs text-muted-foreground">
              {isEnabled 
                ? "六神があなたを静かに見守っています。大切な日や暦のイベント時にメッセージが届きます。" 
                : "オンにすると、六神が静かにあなたを見守り、大切な日にメッセージを届けます。"}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 ${className}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isEnabled ? "bg-purple-500/20" : "bg-white/5"
        }`}>
          {isEnabled ? (
            <Eye className="w-5 h-5 text-purple-400" />
          ) : (
            <EyeOff className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div>
          <Label htmlFor="guardian-mode" className="text-sm font-medium cursor-pointer">
            見守りモード
          </Label>
          <p className="text-xs text-muted-foreground">
            {isEnabled 
              ? "六神が静かにあなたを見守っています" 
              : "大切な日にメッセージが届きます"}
          </p>
        </div>
      </div>
      <Switch
        id="guardian-mode"
        checked={isEnabled}
        onCheckedChange={handleToggle}
        disabled={isUpdating || updateMutation.isPending}
        className="data-[state=checked]:bg-purple-500"
      />
    </div>
  );
}

export default GuardianModeToggle;
