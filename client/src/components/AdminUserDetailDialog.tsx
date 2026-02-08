import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Crown, Shield, FlaskConical, Phone, Mail, Calendar, MessageSquare,
  Clock, User, CreditCard, Star, Ban, Sparkles, FileText, Hash,
  Activity, Loader2
} from "lucide-react";

interface UserDetailData {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  displayName: string | null;
  nickname: string | null;
  memo: string | null;
  role: "user" | "admin";
  isPremium: boolean;
  usedFreeReadings: number;
  totalFreeReadings: number;
  bonusReadings: number;
  createdAt: Date;
  loginMethod: string | null;
  planType: string;
  premiumExpiresAt: Date | null;
  isTester: boolean;
  subscriptionStatus: string;
  lastLoginAt: Date | null;
  lastSignedIn: Date;
  isBlocked: boolean;
  blockReason: string | null;
  dailyReadingsUsed: number;
  dailyReadingLimit: number;
  bio: string | null;
  birthDate: string | null;
  zodiacSign: string | null;
  avatarUrl: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  continuousMonths: number;
  trialExchangesUsed: number;
  selectedOracleId: string | null;
  purchasedOracleIds: string | null;
  activationCode: { code: string; usedAt: Date | null; planType: string } | null;
  totalChatSessions: number;
  totalChatMessages: number;
}

interface AdminUserDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDetailData | null;
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: any }) {
  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm text-white break-all">{value || <span className="text-muted-foreground">-</span>}</div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-admin-primary uppercase tracking-wider mt-4 mb-2">
      {children}
    </h3>
  );
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateOnly(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ja-JP");
}

function getPlanLabel(planType: string): string {
  const labels: Record<string, string> = {
    free: "無料",
    trial: "トライアル",
    standard: "スタンダード",
    premium: "プレミアム",
    premium_unlimited: "プレミアム(無制限)",
  };
  return labels[planType] || planType;
}

function getSubscriptionStatusLabel(status: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    active: { label: "有効", color: "bg-green-500/20 text-green-400" },
    canceled: { label: "解約済み", color: "bg-red-500/20 text-red-400" },
    past_due: { label: "支払い遅延", color: "bg-yellow-500/20 text-yellow-400" },
    none: { label: "なし", color: "bg-gray-500/20 text-gray-400" },
  };
  return map[status] || { label: status, color: "bg-gray-500/20 text-gray-400" };
}

export default function AdminUserDetailDialog({ open, onOpenChange, user }: AdminUserDetailDialogProps) {
  if (!user) return null;

  const subStatus = getSubscriptionStatusLabel(user.subscriptionStatus);
  const purchasedOracles = user.purchasedOracleIds ? JSON.parse(user.purchasedOracleIds) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span>{user.name || user.displayName || user.nickname || "未設定"}</span>
                {user.role === "admin" && (
                  <Badge variant="outline" className="border-admin-primary text-admin-primary text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    管理者
                  </Badge>
                )}
                {user.isTester && (
                  <Badge variant="outline" className="border-cyan-400 text-cyan-400 text-xs">
                    <FlaskConical className="w-3 h-3 mr-1" />
                    テスター
                  </Badge>
                )}
                {user.isBlocked && (
                  <Badge variant="destructive" className="text-xs">
                    <Ban className="w-3 h-3 mr-1" />
                    ブロック中
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-normal">ID: {user.id} | OpenID: {user.openId}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-1">
          {/* === 基本情報 === */}
          <SectionTitle>基本情報</SectionTitle>
          <div className="grid grid-cols-2 gap-x-6">
            <InfoRow icon={User} label="名前" value={user.name} />
            <InfoRow icon={User} label="表示名" value={user.displayName} />
            <InfoRow icon={User} label="ニックネーム" value={user.nickname} />
            <InfoRow icon={Mail} label="メールアドレス" value={user.email} />
            <InfoRow icon={Phone} label="認証方法" value={
              user.loginMethod === "phone" ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
                  <Phone className="w-3 h-3" /> 電話
                </span>
              ) : user.loginMethod === "email" ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs">
                  <Mail className="w-3 h-3" /> メール
                </span>
              ) : (
                user.loginMethod || "-"
              )
            } />
            <InfoRow icon={Calendar} label="誕生日" value={user.birthDate ? formatDateOnly(user.birthDate) : null} />
            <InfoRow icon={Star} label="星座" value={user.zodiacSign} />
            <InfoRow icon={Calendar} label="登録日" value={formatDate(user.createdAt)} />
          </div>

          {user.bio && (
            <InfoRow icon={FileText} label="自己紹介" value={user.bio} />
          )}

          {user.memo && (
            <InfoRow icon={FileText} label="メモ" value={
              <div className="p-2 bg-muted/50 rounded text-sm whitespace-pre-wrap">{user.memo}</div>
            } />
          )}

          <Separator className="my-3" />

          {/* === プラン・サブスクリプション === */}
          <SectionTitle>プラン・サブスクリプション</SectionTitle>
          <div className="grid grid-cols-2 gap-x-6">
            <InfoRow icon={Crown} label="プラン" value={
              <div className="flex items-center gap-2">
                <span>{getPlanLabel(user.planType)}</span>
                {user.isPremium && (
                  <Badge className="bg-amber-500/20 text-amber-400 text-xs">
                    <Crown className="w-3 h-3 mr-1 fill-amber-400" />
                    プレミアム
                  </Badge>
                )}
              </div>
            } />
            <InfoRow icon={Activity} label="サブスクリプション状態" value={
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${subStatus.color}`}>
                {subStatus.label}
              </span>
            } />
            <InfoRow icon={Calendar} label="プレミアム有効期限" value={user.premiumExpiresAt ? formatDate(user.premiumExpiresAt) : null} />
            <InfoRow icon={Star} label="継続月数" value={user.continuousMonths > 0 ? `${user.continuousMonths}ヶ月` : "0ヶ月"} />
          </div>

          {user.activationCode && (
            <InfoRow icon={Hash} label="使用済み合言葉" value={
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                  {user.activationCode.code}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({user.activationCode.planType} | {user.activationCode.usedAt ? formatDate(user.activationCode.usedAt) : "日時不明"})
                </span>
              </div>
            } />
          )}

          {(user.stripeCustomerId || user.stripeSubscriptionId) && (
            <div className="grid grid-cols-2 gap-x-6">
              <InfoRow icon={CreditCard} label="Stripe Customer ID" value={user.stripeCustomerId} />
              <InfoRow icon={CreditCard} label="Stripe Subscription ID" value={user.stripeSubscriptionId} />
            </div>
          )}

          <Separator className="my-3" />

          {/* === 利用状況 === */}
          <SectionTitle>利用状況</SectionTitle>
          <div className="grid grid-cols-2 gap-x-6">
            <InfoRow icon={MessageSquare} label="チャットセッション数" value={
              <span className="text-lg font-semibold text-white">{user.totalChatSessions}</span>
            } />
            <InfoRow icon={MessageSquare} label="チャットメッセージ数" value={
              <span className="text-lg font-semibold text-white">{user.totalChatMessages}</span>
            } />
            <InfoRow icon={Activity} label="今日の鑑定回数" value={`${user.dailyReadingsUsed} / ${user.dailyReadingLimit}`} />
            <InfoRow icon={Activity} label="トライアル使用回数" value={`${user.trialExchangesUsed}回`} />
            <InfoRow icon={Sparkles} label="ボーナス鑑定回数" value={`${user.bonusReadings}回`} />
            <InfoRow icon={Activity} label="累計鑑定回数 (旧)" value={`${user.usedFreeReadings} / ${user.totalFreeReadings}`} />
          </div>

          <Separator className="my-3" />

          {/* === 占い師設定 === */}
          <SectionTitle>占い師設定</SectionTitle>
          <div className="grid grid-cols-2 gap-x-6">
            <InfoRow icon={Star} label="選択中の占い師" value={user.selectedOracleId || "未選択"} />
            <InfoRow icon={Star} label="購入済み占い師" value={
              purchasedOracles.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {purchasedOracles.map((id: string) => (
                    <span key={id} className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs">
                      {id}
                    </span>
                  ))}
                </div>
              ) : "なし"
            } />
          </div>

          <Separator className="my-3" />

          {/* === ログイン情報 === */}
          <SectionTitle>ログイン情報</SectionTitle>
          <div className="grid grid-cols-2 gap-x-6">
            <InfoRow icon={Clock} label="最終ログイン" value={formatDate(user.lastLoginAt)} />
            <InfoRow icon={Clock} label="最終サインイン" value={formatDate(user.lastSignedIn)} />
          </div>

          {user.isBlocked && (
            <>
              <Separator className="my-3" />
              <SectionTitle>ブロック情報</SectionTitle>
              <InfoRow icon={Ban} label="ブロック理由" value={
                <span className="text-red-400">{user.blockReason || "不明"}</span>
              } />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
