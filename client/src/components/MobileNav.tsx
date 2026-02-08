import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Menu, 
  X, 
  Home, 
  CreditCard, 
  LogOut, 
  Crown,
  Clock,
  Heart,
  Calculator,
  Lightbulb,
  Moon,
  Shield,
  User,
  Users,
  Bell,
  Settings,
  MessageSquare,
  Mail,
  ShieldCheck,
  HelpCircle,
  Gift,
  Ticket,
  BarChart3,
  History,
  Hand,
  Star
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { DisplaySettings } from "@/components/DisplaySettings";

const iconMap: Record<string, any> = {
  Clock, Heart, Calculator, Lightbulb, Moon, Shield, Hand, Star
};

interface Oracle {
  id: string;
  name: string;
  role: string;
  image: string;
  icon: string;
  color: string;
  isCore: boolean; // true = 既存6人（無料プランで常に利用可能）, false = 追加占い師
}

interface MobileNavProps {
  user?: {
    id?: number;
    name?: string | null;
    email?: string | null;
    role?: string;
  } | null;
  isPremium?: boolean;
  onLogout?: () => void;
  oracles?: Oracle[];
  selectedOracle?: string | null;
  onSelectOracle?: (id: string) => void;
  onUpgrade?: () => void;
  isUpgrading?: boolean;
  userSelectedOracleId?: string | null; // For free user oracle restriction
}

export default function MobileNav({
  user,
  isPremium = false,
  onLogout,
  oracles = [],
  selectedOracle,
  onSelectOracle,
  onUpgrade,
  isUpgrading = false,
  userSelectedOracleId,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  const handleOracleSelect = (id: string) => {
    if (onSelectOracle) {
      onSelectOracle(id);
    }
    setOpen(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setOpen(false);
  };

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    }
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          aria-label="メニューを開く"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 bg-background/95 backdrop-blur-lg border-user-primary/20 p-0">
        <SheetHeader className="p-4 border-b border-border/20">
          <SheetTitle className="flex items-center gap-2 text-white font-serif">
            <Moon className="w-5 h-5" />
            六神ノ間
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-[calc(100%-60px)]">
          {/* User Info */}
          {user && (
            <div className="p-4 border-b border-border/20">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-user-primary/20 text-user-primary">
                    {user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.name || "ユーザー"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                {isPremium && (
                  <Crown className="w-4 h-4 text-user-primary flex-shrink-0" />
                )}
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="p-4 border-b border-border/20">
            <nav className="space-y-1">
              <Link href="/dashboard" onClick={() => setOpen(false)}>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${location === "/dashboard" ? "bg-user-primary/10 text-user-primary" : ""}`}
                >
                  <Home className="w-4 h-4 mr-3" />
                  ダッシュボード
                </Button>
              </Link>
              <Link href="/subscription" onClick={() => setOpen(false)}>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${location === "/subscription" ? "bg-user-primary/10 text-user-primary" : ""}`}
                >
                  <CreditCard className="w-4 h-4 mr-3" />
                  プラン・お支払い
                </Button>
              </Link>
              <Link href="/profile" onClick={() => setOpen(false)}>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${location === "/profile" ? "bg-user-primary/10 text-user-primary" : ""}`}
                >
                  <User className="w-4 h-4 mr-3" />
                  プロフィール
                </Button>
              </Link>

              <Link href="/notifications" onClick={() => setOpen(false)}>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${location === "/notifications" ? "bg-user-primary/10 text-user-primary" : ""}`}
                >
                  <Bell className="w-4 h-4 mr-3" />
                  通知
                </Button>
              </Link>
              <Link href="/coupon" onClick={() => setOpen(false)}>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${location === "/coupon" ? "bg-user-primary/10 text-user-primary" : ""}`}
                >
                  <Ticket className="w-4 h-4 mr-3" />
                  クーポン入力
                </Button>
              </Link>

              <Link href="/reading-history" onClick={() => setOpen(false)}>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${location === "/reading-history" ? "bg-user-primary/10 text-user-primary" : ""}`}
                >
                  <History className="w-4 h-4 mr-3" />
                  鑑定履歴
                </Button>
              </Link>
              <Link href="/help" onClick={() => setOpen(false)}>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${location === "/help" ? "bg-user-primary/10 text-user-primary" : ""}`}
                >
                  <HelpCircle className="w-4 h-4 mr-3" />
                  ヘルプ
                </Button>
              </Link>
              
              {/* Display Settings */}
              <DisplaySettings variant="button" className="w-full justify-start" />
            </nav>
          </div>

          {/* User Info - ユーザーID表示 */}
          {user && (
            <div className="p-4 border-b border-border/20">
              <div className="text-xs text-muted-foreground">
                <span>ユーザーID: </span>
                <span className="font-mono text-user-primary">{user.id}</span>
                {user.id === 1 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-user-primary/20 text-user-primary rounded text-[10px] font-medium">オーナー</span>
                )}
              </div>
            </div>
          )}

          {/* Admin Menu - 管理者専用 (role === 'admin') */}
          {user && user.role === 'admin' && (
            <div className="p-4 border-b border-admin-primary/30 bg-admin-primary/5">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="w-5 h-5 text-admin-primary" />
                <span className="text-sm font-bold text-admin-primary">管理者メニュー</span>
              </div>
              <nav className="space-y-2">
                <Link href="/admin" onClick={() => setOpen(false)}>
                  <Button 
                    variant="outline" 
                    className={`w-full justify-start border-admin-primary/50 bg-admin-primary/10 ${location === "/admin" ? "bg-admin-primary/30 text-admin-primary" : "text-admin-primary hover:bg-admin-primary/20"}`}
                  >
                    <ShieldCheck className="w-4 h-4 mr-3" />
                    管理者ダッシュボード
                  </Button>
                </Link>
                <Link href="/admin/feedback" onClick={() => setOpen(false)}>
                  <Button 
                    variant="outline" 
                    className={`w-full justify-start border-admin-primary/30 ${location === "/admin/feedback" ? "bg-admin-primary/20 text-admin-primary" : "text-admin-primary hover:bg-admin-primary/20"}`}
                  >
                    <MessageSquare className="w-4 h-4 mr-3" />
                    意見箱管理
                  </Button>
                </Link>
                <Link href="/admin/inquiries" onClick={() => setOpen(false)}>
                  <Button 
                    variant="outline" 
                    className={`w-full justify-start border-admin-primary/30 ${location === "/admin/inquiries" ? "bg-admin-primary/20 text-admin-primary" : "text-admin-primary hover:bg-admin-primary/20"}`}
                  >
                    <Mail className="w-4 h-4 mr-3" />
                    問い合わせ管理
                  </Button>
                </Link>
                <Link href="/admin/users" onClick={() => setOpen(false)}>
                  <Button 
                    variant="outline" 
                    className={`w-full justify-start border-admin-primary/30 ${location === "/admin/users" ? "bg-admin-primary/20 text-admin-primary" : "text-admin-primary hover:bg-admin-primary/20"}`}
                  >
                    <Users className="w-4 h-4 mr-3" />
                    ユーザー管理
                  </Button>
                </Link>
                <Link href="/admin/coupons" onClick={() => setOpen(false)}>
                  <Button 
                    variant="outline" 
                    className={`w-full justify-start border-admin-primary/30 ${location === "/admin/coupons" ? "bg-admin-primary/20 text-admin-primary" : "text-admin-primary hover:bg-admin-primary/20"}`}
                  >
                    <Ticket className="w-4 h-4 mr-3" />
                    クーポン管理
                  </Button>
                </Link>
                <Link href="/admin/stats" onClick={() => setOpen(false)}>
                  <Button 
                    variant="outline" 
                    className={`w-full justify-start border-admin-primary/30 ${location === "/admin/stats" ? "bg-admin-primary/20 text-admin-primary" : "text-admin-primary hover:bg-admin-primary/20"}`}
                  >
                    <BarChart3 className="w-4 h-4 mr-3" />
                    統計ダッシュボード
                  </Button>
                </Link>
              </nav>
            </div>
          )}

          {/* Oracle Selection (only on dashboard) */}
          {oracles.length > 0 && (
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">占い師を選択</h3>
              <div className="space-y-2">
                {oracles.map((oracle) => {
                  const Icon = iconMap[oracle.icon];
                  const isSelected = selectedOracle === oracle.id;
                  // Core oracles (existing 6) are always available for free users
                  // Extra oracles (isCore: false) - free users can only select 1
                  const isLocked = !isPremium && !oracle.isCore && userSelectedOracleId && userSelectedOracleId !== oracle.id;
                  const isUserSelectedExtra = !oracle.isCore && userSelectedOracleId === oracle.id;
                  const isExtraOracle = !oracle.isCore;
                  
                  return (
                    <button
                      key={oracle.id}
                      onClick={() => !isLocked && handleOracleSelect(oracle.id)}
                      className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all relative ${
                        isSelected 
                          ? 'bg-user-primary/20 border border-user-primary/50' 
                          : isLocked
                          ? 'opacity-50 cursor-not-allowed border border-transparent'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      {isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                          <Crown className="w-4 h-4 text-user-primary" />
                        </div>
                      )}
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={oracle.image} alt={oracle.name} />
                        <AvatarFallback className={`bg-gradient-to-br ${oracle.color}`}>
                          {Icon && <Icon className="w-5 h-5 text-white" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left flex-1">
                        <div className="font-medium text-white text-sm flex items-center gap-2">
                          {oracle.name}
                          {isExtraOracle && !isPremium && (
                            isUserSelectedExtra ? (
                              <span className="text-[10px] bg-user-primary/20 text-user-primary px-1 py-0.5 rounded">選択中</span>
                            ) : !userSelectedOracleId ? (
                              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1 py-0.5 rounded">NEW</span>
                            ) : null
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">{oracle.role}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="mt-auto p-4 border-t border-border/20 space-y-2">
            {!isPremium && onUpgrade && (
              <Button 
                className="btn-primary w-full"
                onClick={handleUpgrade}
                disabled={isUpgrading}
              >
                <Crown className="w-4 h-4 mr-2" />
                {isUpgrading ? "処理中..." : "プレミアムにアップグレード"}
              </Button>
            )}
            {onLogout && (
              <Button 
                variant="ghost" 
                className="w-full justify-start text-muted-foreground"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-3" />
                ログアウト
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
