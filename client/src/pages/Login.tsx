import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Moon, Mail, Lock, User, ArrowLeft, Loader2, Phone, MessageSquare, Globe, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"phone" | "email">("phone");
  const [authStep, setAuthStep] = useState<"input" | "verify">("input");
  
  // Phone auth state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+81");
  const [otpCode, setOtpCode] = useState("");
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [normalizedPhone, setNormalizedPhone] = useState("");
  
  // Email login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Email register form state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState("");
  const [emailMode, setEmailMode] = useState<"login" | "register">("login");
  
  // Referral code state (from URL or manual input)
  const [referralCode, setReferralCode] = useState("");
  
  // Check for referral code in URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      // Store in localStorage for later use after registration
      localStorage.setItem('pendingReferralCode', refCode);
    } else {
      // Check if there's a pending referral code
      const pending = localStorage.getItem('pendingReferralCode');
      if (pending) {
        setReferralCode(pending);
      }
    }
  }, []);

  // Get country codes from server
  const { data: countryCodes } = trpc.phoneAuth.getCountryCodes.useQuery();

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Phone auth mutations
  const sendOtpMutation = trpc.phoneAuth.sendOtp.useMutation({
    onSuccess: (data) => {
      if (data.isDemo && data.demoCode) {
        setDemoCode(data.demoCode);
        toast.success(`【デモモード】認証コード: ${data.demoCode}`, {
          duration: 30000,
        });
      } else {
        toast.success("認証コードを送信しました");
      }
      setNormalizedPhone(data.phoneNumber);
      setAuthStep("verify");
      setCountdown(60);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const verifyOtpMutation = trpc.phoneAuth.verifyOtp.useMutation({
    onSuccess: (data) => {
      // Clear demo code and all toasts on successful login
      setDemoCode(null);
      toast.dismiss(); // Clear all existing toasts including demo code notification
      toast.success("ログインしました", { duration: 2000 });
      
      // If this is a new user and there's a pending referral code, keep it in localStorage
      // It will be applied on the dashboard page
      const pendingCode = localStorage.getItem('pendingReferralCode') || referralCode;
      if (pendingCode && data.isNewUser) {
        localStorage.setItem('pendingReferralCode', pendingCode);
      }
      
      // Use window.location for reliable redirect
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resendOtpMutation = trpc.phoneAuth.resendOtp.useMutation({
    onSuccess: (data) => {
      if (data.isDemo && data.demoCode) {
        setDemoCode(data.demoCode);
        toast.success(`【デモモード】認証コード: ${data.demoCode}`, {
          duration: 30000,
        });
      } else {
        toast.success("認証コードを再送信しました");
      }
      setCountdown(60);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Email auth mutations
  const loginMutation = trpc.emailAuth.login.useMutation({
    onSuccess: () => {
      toast.dismiss();
      toast.success("ログインしました", { duration: 2000 });
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Referral code application mutation
  const applyReferralMutation = trpc.referral.applyCode.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("紹介コードを適用しました！", { duration: 3000 });
      }
      // Clear the stored referral code
      localStorage.removeItem('pendingReferralCode');
    },
    onError: () => {
      // Silently fail - user can apply later
      localStorage.removeItem('pendingReferralCode');
    },
  });

  const registerMutation = trpc.emailAuth.register.useMutation({
    onSuccess: () => {
      toast.dismiss();
      toast.success("登録が完了しました", { duration: 2000 });
      
      // Apply referral code if present
      const pendingCode = localStorage.getItem('pendingReferralCode') || referralCode;
      if (pendingCode) {
        // Small delay to ensure user is created
        setTimeout(() => {
          applyReferralMutation.mutate({ code: pendingCode });
        }, 500);
      }
      
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Phone auth handlers
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      toast.error("電話番号を入力してください");
      return;
    }
    sendOtpMutation.mutate({ phoneNumber, countryCode });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      toast.error("6桁の認証コードを入力してください");
      return;
    }
    verifyOtpMutation.mutate({ phoneNumber: normalizedPhone, otpCode });
  };

  const handleResendOtp = () => {
    if (countdown > 0) return;
    resendOtpMutation.mutate({ phoneNumber: normalizedPhone });
  };

  const handleBackToInput = () => {
    setAuthStep("input");
    setOtpCode("");
    setDemoCode(null);
  };

  // Email auth handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("メールアドレスとパスワードを入力してください");
      return;
    }
    loginMutation.mutate({ email: loginEmail, password: loginPassword });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPassword) {
      toast.error("すべての項目を入力してください");
      return;
    }
    if (registerPassword !== registerPasswordConfirm) {
      toast.error("パスワードが一致しません");
      return;
    }
    if (registerPassword.length < 8) {
      toast.error("パスワードは8文字以上必要です");
      return;
    }
    registerMutation.mutate({
      name: registerName,
      email: registerEmail,
      password: registerPassword,
    });
  };

  // Get placeholder based on country code
  const getPhonePlaceholder = () => {
    const country = countryCodes?.find(c => c.code === countryCode);
    switch (country?.country) {
      case "JP": return "90-1234-5678";
      case "US": return "555-123-4567";
      case "CN": return "138-1234-5678";
      case "KR": return "10-1234-5678";
      case "GB": return "7911 123456";
      case "FR": return "6 12 34 56 78";
      case "DE": return "151 12345678";
      case "AU": return "412 345 678";
      case "SG": return "8123 4567";
      case "HK": return "5123 4567";
      case "TW": return "912 345 678";
      default: return "電話番号";
    }
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

      {/* Back to Home */}
      <div className="absolute top-4 left-4 z-20">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 pointer-events-auto">
            <ArrowLeft className="w-4 h-4" />
            ホームに戻る
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-md z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Moon className="w-8 h-8 text-primary-foreground" />
            <span className="text-2xl font-serif font-bold tracking-widest">六神ノ間</span>
          </div>
          <p className="text-muted-foreground">あなたの運命を導く6人の占い師</p>
        </div>

        <Card className="glass-card border-white/10">
          <CardHeader className="text-center">
            <CardTitle>ログイン / 新規登録</CardTitle>
            <CardDescription>
              電話番号またはメールアドレスでログイン
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => {
              setActiveTab(v as "phone" | "email");
              setAuthStep("input");
              setDemoCode(null);
            }}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="phone" className="gap-2">
                  <Phone className="w-4 h-4" />
                  電話番号
                </TabsTrigger>
                <TabsTrigger value="email" className="gap-2">
                  <Mail className="w-4 h-4" />
                  メール
                </TabsTrigger>
              </TabsList>

              {/* Phone Auth Tab */}
              <TabsContent value="phone">
                {authStep === "input" ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="space-y-4">
                      <div className="text-center mb-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 mb-3">
                          <Phone className="w-8 h-8 text-amber-400" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          電話番号を入力するだけでOK！
                        </p>
                      </div>
                      
                      {/* 国コード選択（コンパクト） */}
                      <Select value={countryCode} onValueChange={setCountryCode}>
                        <SelectTrigger className="w-full h-12">
                          <SelectValue>
                            <span className="flex items-center gap-2">
                              <span className="text-lg">{countryCodes?.find(c => c.code === countryCode)?.flag}</span>
                              <span>{countryCode}</span>
                            </span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {countryCodes?.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              <span className="flex items-center gap-2">
                                <span>{country.flag}</span>
                                <span>{country.name}</span>
                                <span className="text-muted-foreground">({country.code})</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {/* 電話番号入力（大きく目立つ） */}
                      <div className="relative">
                        <Input
                          id="phone"
                          type="tel"
                          placeholder={getPhonePlaceholder()}
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="h-14 text-lg text-center font-medium tracking-wider"
                          autoFocus
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-14 text-lg font-bold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black rounded-xl"
                      disabled={sendOtpMutation.isPending}
                    >
                      {sendOtpMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      ) : (
                        <Sparkles className="w-5 h-5 mr-2" />
                      )}
                      ログイン
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      SMSで認証コードを送信します
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    {/* Demo code display */}
                    {demoCode && (
                      <div className="p-4 rounded-lg bg-amber-500/20 border border-amber-500/30 text-center">
                        <p className="text-xs text-amber-200 mb-1">【デモモード】認証コード</p>
                        <p className="text-3xl font-mono font-bold tracking-widest text-amber-100">
                          {demoCode}
                        </p>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="otp">認証コード（6桁）</Label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="otp"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          placeholder="123456"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          className="pl-10 text-center text-2xl tracking-widest font-mono"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        {normalizedPhone} に送信しました
                      </p>
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full btn-primary"
                      disabled={verifyOtpMutation.isPending}
                    >
                      {verifyOtpMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      ログイン
                    </Button>
                    
                    <div className="flex items-center justify-between text-sm">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleBackToInput}
                      >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        電話番号を変更
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleResendOtp}
                        disabled={countdown > 0 || resendOtpMutation.isPending}
                      >
                        {resendOtpMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                        ) : null}
                        {countdown > 0 ? `再送信 (${countdown}秒)` : "コードを再送信"}
                      </Button>
                    </div>
                  </form>
                )}
              </TabsContent>

              {/* Email Auth Tab */}
              <TabsContent value="email">
                <div className="mb-4">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={emailMode === "login" ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => setEmailMode("login")}
                    >
                      ログイン
                    </Button>
                    <Button
                      type="button"
                      variant={emailMode === "register" ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => setEmailMode("register")}
                    >
                      新規登録
                    </Button>
                  </div>
                </div>

                {emailMode === "login" ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">メールアドレス</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="example@email.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">パスワード</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                        パスワードを忘れた方
                      </Link>
                    </div>
                    <Button
                      type="submit"
                      className="w-full btn-primary"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      ログイン
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">お名前</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="register-name"
                          type="text"
                          placeholder="山田 太郎"
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">メールアドレス</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="example@email.com"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">パスワード</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="8文字以上"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password-confirm">パスワード（確認）</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="register-password-confirm"
                          type="password"
                          placeholder="もう一度入力"
                          value={registerPasswordConfirm}
                          onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="referral-code" className="flex items-center gap-2">
                        紹介コード
                        <span className="text-xs text-muted-foreground">(任意)</span>
                      </Label>
                      <div className="relative">
                        <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                        <Input
                          id="referral-code"
                          type="text"
                          placeholder="SIX..."
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                          className="pl-10 uppercase"
                          maxLength={20}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        紹介コードを入力すると、紹介者にボーナスが付与されます
                      </p>
                    </div>
                    <Button
                      type="submit"
                      className="w-full btn-primary"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      新規登録
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          ログインすることで、
          <Link href="/terms" className="underline hover:text-white">利用規約</Link>
          と
          <Link href="/privacy" className="underline hover:text-white">プライバシーポリシー</Link>
          に同意したものとみなされます。
        </p>
      </div>
    </div>
  );
}
