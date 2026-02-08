import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Moon, Lock, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const tokenParam = params.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchString]);

  const resetMutation = trpc.emailAuth.resetPassword.useMutation({
    onSuccess: () => {
      setSuccess(true);
      toast.success("パスワードが変更されました");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !passwordConfirm) {
      toast.error("パスワードを入力してください");
      return;
    }
    if (password !== passwordConfirm) {
      toast.error("パスワードが一致しません");
      return;
    }
    if (password.length < 8) {
      toast.error("パスワードは8文字以上必要です");
      return;
    }
    resetMutation.mutate({ token, newPassword: password });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
        <div className="fixed inset-0 z-0 pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                opacity: Math.random() * 0.7 + 0.3,
              }}
            />
          ))}
        </div>
        <Card className="glass-card border-white/10 max-w-md w-full z-10">
          <CardContent className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">無効なリンク</h3>
            <p className="text-muted-foreground text-sm mb-6">
              このリンクは無効または期限切れです。
            </p>
            <Link href="/forgot-password">
              <Button variant="outline">パスワードリセットをやり直す</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      {/* Background Stars */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              opacity: Math.random() * 0.7 + 0.3,
              animation: `twinkle ${Math.random() * 3 + 2}s infinite ease-in-out ${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Back to Login */}
      <Link href="/login" className="absolute top-4 left-4 z-10">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          ログインに戻る
        </Button>
      </Link>

      <div className="w-full max-w-md z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Moon className="w-8 h-8 text-primary-foreground" />
            <span className="text-2xl font-serif font-bold tracking-widest">六神ノ間</span>
          </div>
        </div>

        <Card className="glass-card border-white/10">
          <CardHeader className="text-center">
            <CardTitle>新しいパスワードを設定</CardTitle>
            <CardDescription>
              新しいパスワードを入力してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">パスワードを変更しました</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  新しいパスワードでログインしてください。
                </p>
                <Link href="/login">
                  <Button className="btn-primary">ログインする</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">新しいパスワード</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="8文字以上"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-confirm">パスワード（確認）</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password-confirm"
                      type="password"
                      placeholder="もう一度入力"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full btn-primary"
                  disabled={resetMutation.isPending}
                >
                  {resetMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  パスワードを変更
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
