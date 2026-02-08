import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calendar, Camera, Loader2, Save, Sparkles, User, Crown, Archive, Settings, Download, FileText, FileJson, Phone, Mail, Plus, Check, X, StickyNote, Smile } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { VIPBadge } from "@/components/LoyaltyStatusWidget";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import MobileNav from "@/components/MobileNav";

const zodiacSigns = [
  "牡羊座", "牡牛座", "双子座", "蟹座", "獅子座", "乙女座",
  "天秤座", "蠍座", "射手座", "山羊座", "水瓶座", "魚座"
];

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = trpc.user.getProfile.useQuery();
  const updateProfile = trpc.user.updateProfile.useMutation();
  const uploadAvatar = trpc.user.uploadAvatar.useMutation();
  const utils = trpc.useUtils();
  
  // Auto-archive settings
  const { data: autoArchiveSettings, isLoading: autoArchiveLoading } = trpc.chat.getAutoArchiveSettings.useQuery();
  const updateAutoArchiveSettings = trpc.chat.updateAutoArchiveSettings.useMutation({
    onSuccess: () => {
      utils.chat.getAutoArchiveSettings.invalidate();
      toast.success("自動アーカイブ設定を更新しました");
    },
    onError: () => {
      toast.error("設定の更新に失敗しました");
    },
  });
  const [autoArchiveEnabled, setAutoArchiveEnabled] = useState(false);
  const [autoArchiveDays, setAutoArchiveDays] = useState(30);
  
  // Initialize auto-archive settings
  useEffect(() => {
    if (autoArchiveSettings) {
      setAutoArchiveEnabled(autoArchiveSettings.enabled);
      setAutoArchiveDays(autoArchiveSettings.days);
    }
  }, [autoArchiveSettings]);
  
  const handleAutoArchiveToggle = (enabled: boolean) => {
    setAutoArchiveEnabled(enabled);
    updateAutoArchiveSettings.mutate({ enabled, days: autoArchiveDays });
  };
  
  const handleAutoArchiveDaysChange = (days: number) => {
    setAutoArchiveDays(days);
    if (autoArchiveEnabled) {
      updateAutoArchiveSettings.mutate({ enabled: autoArchiveEnabled, days });
    }
  };
  
  // Export settings
  const [exportFormat, setExportFormat] = useState<'text' | 'json'>('text');
  const [includeArchived, setIncludeArchived] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExportHistory = async () => {
    setIsExporting(true);
    try {
      const result = await utils.client.chat.exportAllHistory.query({
        format: exportFormat,
        includeArchived,
      });
      
      if (result.success) {
        let blob: Blob;
        let filename: string;
        
        if (exportFormat === 'json') {
          blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
          filename = `six-oracle-history-${new Date().toISOString().split('T')[0]}.json`;
        } else {
          blob = new Blob([result.data as string], { type: 'text/plain;charset=utf-8' });
          filename = `six-oracle-history-${new Date().toISOString().split('T')[0]}.txt`;
        }
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success(`${result.sessionCount}セッション、${result.messageCount}メッセージをエクスポートしました`);
      }
    } catch (error) {
      toast.error("エクスポートに失敗しました");
    } finally {
      setIsExporting(false);
    }
  };

  const [displayName, setDisplayName] = useState("");
  const [nickname, setNickname] = useState("");
  const [memo, setMemo] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [zodiacSign, setZodiacSign] = useState("");
  const [bio, setBio] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  
  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setNickname((profile as any).nickname || "");
      setMemo((profile as any).memo || "");
      setBirthDate(profile.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : "");
      setZodiacSign(profile.zodiacSign || "");
      setBio(profile.bio || "");
      // Set avatar preview from profile if exists
      if (profile.avatarUrl) {
        setAvatarPreview(profile.avatarUrl);
      }
    }
  }, [profile]);

  // Track changes
  useEffect(() => {
    if (profile) {
      const originalDisplayName = profile.displayName || "";
      const originalNickname = (profile as any).nickname || "";
      const originalMemo = (profile as any).memo || "";
      const originalBirthDate = profile.birthDate ? new Date(profile.birthDate).toISOString().split('T')[0] : "";
      const originalZodiacSign = profile.zodiacSign || "";
      const originalBio = profile.bio || "";

      setHasChanges(
        displayName !== originalDisplayName ||
        nickname !== originalNickname ||
        memo !== originalMemo ||
        birthDate !== originalBirthDate ||
        zodiacSign !== originalZodiacSign ||
        bio !== originalBio
      );
    }
  }, [displayName, nickname, memo, birthDate, zodiacSign, bio, profile]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        displayName: displayName || undefined,
        nickname: nickname || undefined,
        memo: memo || undefined,
        birthDate: birthDate || undefined,
        zodiacSign: zodiacSign || undefined,
        bio: bio || undefined,
      });
      utils.user.getProfile.invalidate();
      toast.success("プロフィールを更新しました");
      setHasChanges(false);
    } catch (error) {
      toast.error("プロフィールの更新に失敗しました");
    }
  };

  // Calculate zodiac sign from birth date
  const calculateZodiacFromDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "牡羊座";
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "牡牛座";
    if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return "双子座";
    if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return "蟹座";
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "獅子座";
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "乙女座";
    if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return "天秤座";
    if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return "蠍座";
    if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return "射手座";
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "山羊座";
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "水瓶座";
    return "魚座";
  };

  const handleBirthDateChange = (value: string) => {
    setBirthDate(value);
    if (value) {
      setZodiacSign(calculateZodiacFromDate(value));
    }
  };

  // Handle avatar file selection
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("対応していない画像形式です。JPEG、PNG、GIF、WEBPのみ対応しています。");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("画像サイズが大きすぎます。5MB以下の画像を選択してください。");
      return;
    }

    // Create instant preview using FileReader
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      
      // Set preview immediately
      setAvatarPreview(base64Data);
      
      // Upload to server
      setIsUploadingAvatar(true);
      try {
        const result = await uploadAvatar.mutateAsync({
          imageData: base64Data,
          mimeType: file.type,
        });
        
        // Update preview with the actual URL from server
        setAvatarPreview(result.avatarUrl);
        utils.user.getProfile.invalidate();
        toast.success("プロフィール画像を更新しました");
      } catch (error) {
        // Revert to original avatar on error
        setAvatarPreview(profile?.avatarUrl || null);
        toast.error("画像のアップロードに失敗しました");
      } finally {
        setIsUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Trigger file input click
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="glass-card max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">ログインが必要です</p>
            <Link href="/">
              <Button>ホームに戻る</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navigation */}
      <MobileNav user={user} />

      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-serif font-bold hidden md:block">プロフィール設定</h1>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <VIPBadge />
            <span className="text-sm text-muted-foreground">
              {profile?.isPremium ? "プレミアム会員" : "無料会員"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              プロフィール情報
            </CardTitle>
            <CardDescription>
              あなたの情報を設定してください。占い師があなたをより深く理解するのに役立ちます。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div 
                className="relative group cursor-pointer"
                onClick={handleAvatarClick}
              >
                <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10 border-2 border-white/20 flex items-center justify-center">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="プロフィール画像" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                {/* Overlay on hover */}
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {isUploadingAvatar ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </div>
                {/* Upload indicator */}
                {isUploadingAvatar && (
                  <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground">
                クリックして画像を変更（JPEG, PNG, GIF, WEBP / 最大5MB）
              </p>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">表示名</Label>
              <Input
                id="displayName"
                placeholder="占いで使用する名前"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={100}
                className="bg-white/5 border-white/10"
              />
              <p className="text-xs text-muted-foreground">
                占い師があなたを呼ぶ際に使用します
              </p>
            </div>

            {/* Nickname */}
            <div className="space-y-2">
              <Label htmlFor="nickname" className="flex items-center gap-2">
                <Smile className="w-4 h-4" />
                ニックネーム
              </Label>
              <Input
                id="nickname"
                placeholder="親しみを込めた呼び名（任意）"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={50}
                className="bg-white/5 border-white/10"
              />
              <p className="text-xs text-muted-foreground">
                お好みのニックネームを設定できます
              </p>
            </div>

            {/* Memo */}
            <div className="space-y-2">
              <Label htmlFor="memo" className="flex items-center gap-2">
                <StickyNote className="w-4 h-4" />
                メモ
              </Label>
              <Textarea
                id="memo"
                placeholder="自分用のメモを自由に書けます（任意）"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                maxLength={1000}
                rows={3}
                className="bg-white/5 border-white/10 resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {memo.length} / 1000
              </p>
            </div>

            {/* Birth Date - Year/Month/Day Selectors */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                生年月日
              </Label>
              <div className="flex gap-2">
                {/* Year Selector */}
                <select
                  value={birthDate ? birthDate.split('-')[0] : ''}
                  onChange={(e) => {
                    const year = e.target.value;
                    const month = birthDate ? birthDate.split('-')[1] : '01';
                    const day = birthDate ? birthDate.split('-')[2] : '01';
                    if (year) {
                      handleBirthDateChange(`${year}-${month}-${day}`);
                    }
                  }}
                  className="flex-1 h-10 px-3 rounded-md bg-white/5 border border-white/10 text-foreground"
                >
                  <option value="">年</option>
                  {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}年</option>
                  ))}
                </select>
                {/* Month Selector */}
                <select
                  value={birthDate ? birthDate.split('-')[1] : ''}
                  onChange={(e) => {
                    const year = birthDate ? birthDate.split('-')[0] : String(new Date().getFullYear());
                    const month = e.target.value;
                    const day = birthDate ? birthDate.split('-')[2] : '01';
                    if (month) {
                      handleBirthDateChange(`${year}-${month}-${day}`);
                    }
                  }}
                  className="w-24 h-10 px-3 rounded-md bg-white/5 border border-white/10 text-foreground"
                >
                  <option value="">月</option>
                  {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(month => (
                    <option key={month} value={month}>{parseInt(month)}月</option>
                  ))}
                </select>
                {/* Day Selector */}
                <select
                  value={birthDate ? birthDate.split('-')[2] : ''}
                  onChange={(e) => {
                    const year = birthDate ? birthDate.split('-')[0] : String(new Date().getFullYear());
                    const month = birthDate ? birthDate.split('-')[1] : '01';
                    const day = e.target.value;
                    if (day) {
                      handleBirthDateChange(`${year}-${month}-${day}`);
                    }
                  }}
                  className="w-24 h-10 px-3 rounded-md bg-white/5 border border-white/10 text-foreground"
                >
                  <option value="">日</option>
                  {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map(day => (
                    <option key={day} value={day}>{parseInt(day)}日</option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-muted-foreground">
                星座を自動計算し、より正確な占いを提供します
              </p>
            </div>

            {/* Zodiac Sign */}
            <div className="space-y-2">
              <Label htmlFor="zodiacSign" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                星座
              </Label>
              <select
                id="zodiacSign"
                value={zodiacSign}
                onChange={(e) => setZodiacSign(e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-foreground"
              >
                <option value="">選択してください</option>
                {zodiacSigns.map((sign) => (
                  <option key={sign} value={sign}>{sign}</option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                生年月日を入力すると自動で設定されます
              </p>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">自己紹介</Label>
              <Textarea
                id="bio"
                placeholder="あなた自身について教えてください（任意）"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                rows={4}
                className="bg-white/5 border-white/10 resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {bio.length} / 500
              </p>
            </div>

            {/* Auto-Archive Settings */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Archive className="w-4 h-4" />
                自動アーカイブ設定
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>自動アーカイブを有効にする</Label>
                    <p className="text-xs text-muted-foreground">
                      古い会話を自動的にアーカイブします
                    </p>
                  </div>
                  <Switch
                    checked={autoArchiveEnabled}
                    onCheckedChange={handleAutoArchiveToggle}
                    disabled={autoArchiveLoading || updateAutoArchiveSettings.isPending}
                  />
                </div>
                {autoArchiveEnabled && (
                  <div className="space-y-2">
                    <Label>アーカイブする期間</Label>
                    <select
                      value={autoArchiveDays}
                      onChange={(e) => handleAutoArchiveDaysChange(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-foreground"
                      disabled={updateAutoArchiveSettings.isPending}
                    >
                      <option value={7}>1週間以上前の会話</option>
                      <option value={14}>2週間以上前の会話</option>
                      <option value={30}>1ヶ月以上前の会話</option>
                      <option value={60}>2ヶ月以上前の会話</option>
                      <option value={90}>3ヶ月以上前の会話</option>
                      <option value={180}>6ヶ月以上前の会話</option>
                      <option value={365}>1年以上前の会話</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      ※ ピン留めされた会話は自動アーカイブされません
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Data Export Section */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Download className="w-4 h-4" />
                データエクスポート
              </h3>
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  全ての占い師との会話履歴をダウンロードできます。
                </p>
                
                <div className="space-y-2">
                  <Label>エクスポート形式</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={exportFormat === 'text' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setExportFormat('text')}
                      className={exportFormat === 'text' ? 'bg-primary' : 'border-white/20'}
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      テキスト
                    </Button>
                    <Button
                      variant={exportFormat === 'json' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setExportFormat('json')}
                      className={exportFormat === 'json' ? 'bg-primary' : 'border-white/20'}
                    >
                      <FileJson className="w-4 h-4 mr-1" />
                      JSON
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>アーカイブ済みも含める</Label>
                    <p className="text-xs text-muted-foreground">
                      アーカイブした会話もエクスポートに含めます
                    </p>
                  </div>
                  <Switch
                    checked={includeArchived}
                    onCheckedChange={setIncludeArchived}
                  />
                </div>
                
                <Button
                  onClick={handleExportHistory}
                  disabled={isExporting}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      エクスポート中...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      全履歴をダウンロード
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Account Info (Read-only) */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">アカウント情報</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">メールアドレス</Label>
                  <p className="text-sm">{profile?.email || "未設定"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">登録日</Label>
                  <p className="text-sm">
                    {profile?.createdAt 
                      ? new Date(profile.createdAt).toLocaleDateString('ja-JP')
                      : "不明"}
                  </p>
                </div>
              </div>
              
              {/* 認証方法の表示・追加 */}
              <AuthMethodsSection profile={profile} />
            </div>

            {/* Save Button */}
            <div className="pt-4 flex justify-end">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || updateProfile.isPending}
                className="btn-primary"
              >
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    変更を保存
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back to Dashboard */}
        <div className="mt-6 text-center">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ダッシュボードに戻る
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

// 認証方法セクションコンポーネント
function AuthMethodsSection({ profile }: { profile: any }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [addType, setAddType] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingIdentifier, setPendingIdentifier] = useState<string | null>(null);
  
  const utils = trpc.useUtils();
  const { data: authMethods, isLoading } = trpc.user.getAuthMethods.useQuery();
  
  const requestAddAuthMethod = trpc.user.requestAddAuthMethod.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setPendingIdentifier(identifier);
      setIdentifier('');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const verifyAuthMethod = trpc.user.verifyAuthMethod.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setPendingIdentifier(null);
      setVerificationCode('');
      setShowAddForm(false);
      utils.user.getAuthMethods.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const removeAuthMethod = trpc.user.removeAuthMethod.useMutation({
    onSuccess: () => {
      toast.success("認証方法を削除しました");
      utils.user.getAuthMethods.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const handleRequestAdd = () => {
    if (!identifier.trim()) {
      toast.error(addType === 'email' ? "メールアドレスを入力してください" : "電話番号を入力してください");
      return;
    }
    requestAddAuthMethod.mutate({ authType: addType, identifier: identifier.trim() });
  };
  
  const handleVerify = () => {
    if (!pendingIdentifier || !verificationCode.trim()) {
      toast.error("認証コードを入力してください");
      return;
    }
    verifyAuthMethod.mutate({ identifier: pendingIdentifier, code: verificationCode.trim() });
  };
  
  return (
    <div className="mt-4">
      <Label className="text-xs text-muted-foreground mb-2 block">ログイン方法</Label>
      
      {/* 現在の認証方法一覧 */}
      <div className="flex flex-wrap gap-2 mb-3">
        {profile?.loginMethod === 'email' && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-sm">
            <Mail className="w-4 h-4 text-blue-400" />
            <span>メールアドレス</span>
            <Check className="w-3 h-3 text-green-400" />
          </div>
        )}
        {profile?.loginMethod === 'phone' && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full text-sm">
            <Phone className="w-4 h-4 text-green-400" />
            <span>電話番号</span>
            <Check className="w-3 h-3 text-green-400" />
          </div>
        )}
        
        {/* 追加された認証方法 */}
        {authMethods?.filter(m => m.isVerified).map((method) => (
          <div key={method.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
            method.authType === 'email' 
              ? 'bg-blue-500/10 border border-blue-500/30' 
              : 'bg-green-500/10 border border-green-500/30'
          }`}>
            {method.authType === 'email' 
              ? <Mail className="w-4 h-4 text-blue-400" />
              : <Phone className="w-4 h-4 text-green-400" />}
            <span>{method.identifier}</span>
            <Check className="w-3 h-3 text-green-400" />
            {!method.isPrimary && (
              <button
                onClick={() => removeAuthMethod.mutate({ methodId: method.id })}
                className="ml-1 text-muted-foreground hover:text-red-400 transition-colors"
                title="削除"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
      
      {/* 認証方法追加ボタン */}
      {!showAddForm && !pendingIdentifier && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(true)}
          className="text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          認証方法を追加
        </Button>
      )}
      
      {/* 認証方法追加フォーム */}
      {showAddForm && !pendingIdentifier && (
        <div className="mt-3 p-4 bg-muted/30 rounded-lg border border-border">
          <div className="flex gap-2 mb-3">
            <Button
              variant={addType === 'email' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAddType('email')}
            >
              <Mail className="w-4 h-4 mr-1" />
              メール
            </Button>
            <Button
              variant={addType === 'phone' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAddType('phone')}
            >
              <Phone className="w-4 h-4 mr-1" />
              電話番号
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Input
              type={addType === 'email' ? 'email' : 'tel'}
              placeholder={addType === 'email' ? 'example@email.com' : '09012345678'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleRequestAdd}
              disabled={requestAddAuthMethod.isPending}
              size="sm"
            >
              {requestAddAuthMethod.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "送信"
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowAddForm(false);
                setIdentifier('');
              }}
            >
              キャンセル
            </Button>
          </div>
        </div>
      )}
      
      {/* 認証コード入力フォーム */}
      {pendingIdentifier && (
        <div className="mt-3 p-4 bg-muted/30 rounded-lg border border-border">
          <p className="text-sm mb-3">
            <span className="font-medium">{pendingIdentifier}</span> に認証コードを送信しました
          </p>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="6桁の認証コード"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              className="flex-1"
            />
            <Button
              onClick={handleVerify}
              disabled={verifyAuthMethod.isPending}
              size="sm"
            >
              {verifyAuthMethod.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "確認"
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPendingIdentifier(null);
                setVerificationCode('');
                setShowAddForm(false);
              }}
            >
              キャンセル
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            ※ 認証コードの有効期限は10分です
          </p>
        </div>
      )}
    </div>
  );
}
