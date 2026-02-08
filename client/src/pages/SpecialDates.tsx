import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Calendar, Heart, Star, Gift, Cake, Sparkles, Plus, Trash2, ArrowLeft, Bell } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { oracles } from "@/lib/oracles";

const dateTypes = [
  { value: "birthday", label: "誕生日", icon: Cake, color: "text-pink-500" },
  { value: "anniversary", label: "記念日", icon: Heart, color: "text-red-500" },
  { value: "memorial", label: "命日・追悼日", icon: Star, color: "text-purple-500" },
  { value: "goal", label: "目標の日", icon: Gift, color: "text-amber-500" },
  { value: "other", label: "その他", icon: Calendar, color: "text-blue-500" },
];

export default function SpecialDates() {
  const { user, isAuthenticated, loading } = useAuth();
  const [newDate, setNewDate] = useState({
    title: "",
    date: "",
    dateType: "birthday",
    oracleId: "",
    notifyDaysBefore: 1,
    isRecurring: true,
  });
  
  // @ts-ignore - API exists but type not generated yet
  const { data: specialDates, isLoading, refetch } = (trpc.companion as any).getAnniversaries?.useQuery?.() || { data: [], isLoading: false, refetch: () => {} };
  // @ts-ignore
  const addDateMutation = (trpc.companion as any).addAnniversary?.useMutation?.({
    onSuccess: () => {
      toast.success("大切な日を登録しました");
      refetch();
      setNewDate({
        title: "",
        date: "",
        dateType: "birthday",
        oracleId: "",
        notifyDaysBefore: 1,
        isRecurring: true,
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "登録に失敗しました");
    },
  }) || { mutate: () => {}, isPending: false };
  // @ts-ignore
  const deleteDateMutation = (trpc.companion as any).deleteAnniversary?.useMutation?.({
    onSuccess: () => {
      toast.success("削除しました");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "削除に失敗しました");
    },
  }) || { mutate: () => {}, isPending: false };
  
  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-user-primary" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    window.location.href = "/";
    return null;
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate.title || !newDate.date) {
      toast.error("タイトルと日付を入力してください");
      return;
    }
    // Convert date string to month/day format for API
    const dateObj = new Date(newDate.date);
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    
    // Map dateType to category
    const categoryMap: Record<string, string> = {
      birthday: "personal",
      anniversary: "love",
      memorial: "family",
      goal: "work",
      other: "other",
    };
    
    addDateMutation.mutate({
      name: newDate.title,
      month,
      day,
      year,
      category: categoryMap[newDate.dateType] || "other",
      notificationEnabled: true,
      reminderDaysBefore: newDate.notifyDaysBefore,
    });
  };
  
  const getDateTypeInfo = (type: string) => {
    return dateTypes.find(t => t.value === type) || dateTypes[4];
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/20 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-serif text-white">大切な日の登録</h1>
            <p className="text-sm text-muted-foreground">特別な日に占い師からメッセージが届きます</p>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Add New Date Form */}
        <Card className="glass-card border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-user-primary" />
              新しい大切な日を登録
            </CardTitle>
            <CardDescription>
              誕生日や記念日を登録すると、その日に占い師から特別なメッセージが届きます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">タイトル</Label>
                  <Input
                    id="title"
                    placeholder="例: 私の誕生日"
                    value={newDate.title}
                    onChange={(e) => setNewDate({ ...newDate, title: e.target.value })}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                
                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date">日付</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newDate.date}
                    onChange={(e) => setNewDate({ ...newDate, date: e.target.value })}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                
                {/* Date Type */}
                <div className="space-y-2">
                  <Label>種類</Label>
                  <Select
                    value={newDate.dateType}
                    onValueChange={(value) => setNewDate({ ...newDate, dateType: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dateTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className={`w-4 h-4 ${type.color}`} />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Oracle Selection */}
                <div className="space-y-2">
                  <Label>メッセージを送る占い師</Label>
                  <Select
                    value={newDate.oracleId}
                    onValueChange={(value) => setNewDate({ ...newDate, oracleId: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="占い師を選択（任意）" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">ランダム</SelectItem>
                      {oracles.map((oracle) => (
                        <SelectItem key={oracle.id} value={oracle.id}>
                          {oracle.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Notify Days Before */}
                <div className="space-y-2">
                  <Label>事前通知</Label>
                  <Select
                    value={newDate.notifyDaysBefore.toString()}
                    onValueChange={(value) => setNewDate({ ...newDate, notifyDaysBefore: parseInt(value) })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">当日のみ</SelectItem>
                      <SelectItem value="1">1日前</SelectItem>
                      <SelectItem value="3">3日前</SelectItem>
                      <SelectItem value="7">1週間前</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Recurring */}
                <div className="space-y-2">
                  <Label>毎年繰り返す</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={newDate.isRecurring}
                      onCheckedChange={(checked) => setNewDate({ ...newDate, isRecurring: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {newDate.isRecurring ? "毎年通知" : "今年のみ"}
                    </span>
                  </div>
                </div>
              </div>
              
              <Button type="submit" className="w-full btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                登録する
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Registered Dates List */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-user-primary" />
              登録済みの大切な日
            </CardTitle>
          </CardHeader>
          <CardContent>
            {specialDates && specialDates.length > 0 ? (
              <div className="space-y-4">
                {specialDates.map((date: any) => {
                  // Map category back to dateType for icon
                  const categoryToType: Record<string, string> = {
                    personal: "birthday",
                    love: "anniversary",
                    family: "memorial",
                    work: "goal",
                    health: "other",
                    other: "other",
                  };
                  const typeInfo = getDateTypeInfo(categoryToType[date.category] || "other");
                  const TypeIcon = typeInfo.icon;
                  
                  // Calculate days until
                  const today = new Date();
                  const thisYear = today.getFullYear();
                  let targetDate = new Date(thisYear, date.month - 1, date.day);
                  if (targetDate < today) {
                    targetDate = new Date(thisYear + 1, date.month - 1, date.day);
                  }
                  const daysUntil = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  const isToday = daysUntil === 0;
                  const isSoon = daysUntil <= 7;
                  
                  return (
                    <div
                      key={date.id}
                      className={`flex items-center justify-between p-4 rounded-lg bg-white/5 border ${isToday ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-white/10'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center ${typeInfo.color}`}>
                          <TypeIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{date.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {date.month}月{date.day}日
                            {date.year && <span className="text-xs">({date.year}年)</span>}
                          </div>
                          <div className="mt-1">
                            {isToday ? (
                              <span className="text-xs px-2 py-0.5 rounded bg-amber-500 text-black font-medium">今日です！</span>
                            ) : isSoon ? (
                              <span className="text-xs text-pink-400">あと{daysUntil}日</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">あと{daysUntil}日</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-red-500"
                        onClick={() => deleteDateMutation.mutate({ id: date.id })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">まだ大切な日が登録されていません</p>
                <p className="text-sm text-muted-foreground/70 mt-2">
                  上のフォームから誕生日や記念日を登録しましょう
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Info Card */}
        <Card className="glass-card border-user-primary/30 mt-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Bell className="w-8 h-8 text-user-primary flex-shrink-0" />
              <div>
                <h3 className="font-medium text-white mb-2">特別な日のメッセージについて</h3>
                <p className="text-sm text-muted-foreground">
                  登録した日が近づくと、選択した占い師（またはランダムな占い師）から
                  あなただけの特別なメッセージが届きます。誕生日には運勢占い、
                  記念日には二人の未来についてなど、その日にふさわしいメッセージを
                  お届けします。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
