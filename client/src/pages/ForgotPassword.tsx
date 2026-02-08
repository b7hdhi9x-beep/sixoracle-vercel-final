import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Moon, Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const resetMutation = trpc.emailAuth.requestReset.useMutation({
    onSuccess: () => {
      setSent(true);
      toast.success("パスワードリセットのメールを送信しました");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("メールアドレスを入力してください");
      return;
    }
    resetMutation.mutate({ email });
  };

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
            <CardTitle>パスワードをリセット</CardTitle>
            <CardDescription>
              登録したメールアドレスを入力してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">メールを送信しました</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  パスワードリセットのリンクをメールで送信しました。<br />
                  メールをご確認ください。
                </p>
                <Link href="/login">
                  <Button variant="outline">ログインに戻る</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                  リセットリンクを送信
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
