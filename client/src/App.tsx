import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DisplaySettingsProvider } from "./contexts/DisplaySettingsContext";
import Home from "./pages/Home";
import { lazy, Suspense } from "react";
import { ChatSupport } from "./components/ChatSupport";

// Lazy load pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Legal = lazy(() => import("./pages/Legal"));
const Subscription = lazy(() => import("./pages/Subscription"));
const Profile = lazy(() => import("./pages/Profile"));
const History = lazy(() => import("./pages/History")); // プレミアム限定
const ReadingHistory = lazy(() => import("./pages/ReadingHistory"));
const ReadingHistoryDetail = lazy(() => import("./pages/ReadingHistoryDetail"));
const Notifications = lazy(() => import("./pages/Notifications"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Contact = lazy(() => import("./pages/Contact"));
const AdminInquiries = lazy(() => import("./pages/AdminInquiries"));
const FeedbackBox = lazy(() => import("./pages/FeedbackBox"));
const AdminFeedback = lazy(() => import("./pages/AdminFeedback"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const AdminCoupons = lazy(() => import("./pages/AdminCoupons"));
const AdminStats = lazy(() => import("./pages/AdminStats"));
const AdminBankTransfers = lazy(() => import("./pages/AdminBankTransfers"));
const AdminActivationCodes = lazy(() => import("./pages/AdminActivationCodes"));
const AdminMonthlyCode = lazy(() => import("./pages/AdminMonthlyCode"));
const Coupon = lazy(() => import("./pages/Coupon"));
const MonthlyCode = lazy(() => import("./pages/MonthlyCode"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Help = lazy(() => import("./pages/Help"));
const LoginHistory = lazy(() => import("./pages/LoginHistory"));
const PurchaseSuccess = lazy(() => import("./pages/PurchaseSuccess"));
const PurchaseHistory = lazy(() => import("./pages/PurchaseHistory"));
const SimpleMode = lazy(() => import("./pages/SimpleMode"));
const AdminSubscriptionStats = lazy(() => import("./pages/AdminSubscriptionStats"));
const AdminUpgradeRequests = lazy(() => import("./pages/AdminUpgradeRequests"));
const FavoriteOracles = lazy(() => import("./pages/FavoriteOracles"));
const MessageSettings = lazy(() => import("./pages/MessageSettings"));
const ScheduledMessages = lazy(() => import("./pages/ScheduledMessages"));
const SpecialDates = lazy(() => import("./pages/SpecialDates"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Loyalty = lazy(() => import("./pages/Loyalty"));
const Pricing = lazy(() => import("./pages/Pricing"));
const MBTIGroupResult = lazy(() => import("./pages/MBTIGroupResult"));
const AdminDeletedSessions = lazy(() => import("./pages/AdminDeletedSessions"));
const AdminAccountMerge = lazy(() => import("./pages/AdminAccountMerge"));
const AdminSuspiciousAccounts = lazy(() => import("./pages/AdminSuspiciousAccounts"));
const AdminPayments = lazy(() => import("./pages/AdminPayments"));


function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/login">
        <Suspense fallback={<LoadingSpinner />}>
          <Login />
        </Suspense>
      </Route>
      <Route path="/forgot-password">
        <Suspense fallback={<LoadingSpinner />}>
          <ForgotPassword />
        </Suspense>
      </Route>
      <Route path="/reset-password">
        <Suspense fallback={<LoadingSpinner />}>
          <ResetPassword />
        </Suspense>
      </Route>
      <Route path={"/dashboard"}>
        <Suspense fallback={<LoadingSpinner />}>
          <Dashboard />
        </Suspense>
      </Route>
      <Route path={"/simple"}>
        <Suspense fallback={<LoadingSpinner />}>
          <SimpleMode />
        </Suspense>
      </Route>
      <Route path={"/terms"}>
        <Suspense fallback={<LoadingSpinner />}>
          <Terms />
        </Suspense>
      </Route>
      <Route path={"/privacy"}>
        <Suspense fallback={<LoadingSpinner />}>
          <Privacy />
        </Suspense>
      </Route>
      <Route path={"/legal"}>
        <Suspense fallback={<LoadingSpinner />}>
          <Legal />
        </Suspense>
      </Route>
      <Route path={"/subscription"}>
        <Suspense fallback={<LoadingSpinner />}>
          <Subscription />
        </Suspense>
      </Route>
      <Route path={"/pricing"}>
        <Suspense fallback={<LoadingSpinner />}>
          <Pricing />
        </Suspense>
      </Route>
      <Route path="/mbti-group/:shareId">
        <Suspense fallback={<LoadingSpinner />}>
          <MBTIGroupResult />
        </Suspense>
      </Route>

      <Route path={"/purchase-history"}>
        <Suspense fallback={<LoadingSpinner />}>
          <PurchaseHistory />
        </Suspense>
      </Route>
      <Route path={"/profile"}>
        <Suspense fallback={<LoadingSpinner />}>
          <Profile />
        </Suspense>
      </Route>
      <Route path={"/login-history"}>
        <Suspense fallback={<LoadingSpinner />}>
          <LoginHistory />
        </Suspense>
      </Route>
      <Route path={"/history"}>
        <Suspense fallback={<LoadingSpinner />}>
          <History />
        </Suspense>
      </Route>
      <Route path={"/notifications"}>
        <Suspense fallback={<LoadingSpinner />}>
          <Notifications />
        </Suspense>
      </Route>
      <Route path={"/faq"}>
        <Suspense fallback={<LoadingSpinner />}>
          <FAQ />
        </Suspense>
      </Route>
      <Route path={"/contact"}>
        <Suspense fallback={<LoadingSpinner />}>
          <Contact />
        </Suspense>
      </Route>
      <Route path={"/admin/inquiries"}>
        <Suspense fallback={<LoadingSpinner />}>
          <AdminInquiries />
        </Suspense>
      </Route>
      <Route path={"/feedback"}>
        <Suspense fallback={<LoadingSpinner />}>
          <FeedbackBox />
        </Suspense>
      </Route>
      <Route path={"/admin/feedback"}>
        <Suspense fallback={<LoadingSpinner />}>
          <AdminFeedback />
        </Suspense>
      </Route>
      <Route path={"/admin"}>
        <Suspense fallback={<LoadingSpinner />}>
          <Admin />
        </Suspense>
      </Route>
      <Route path={"/admin/users"}>
        <Suspense fallback={<LoadingSpinner />}>
          <AdminUsers />
        </Suspense>
      </Route>
      <Route path={"/admin/coupons"}>
        <Suspense fallback={<LoadingSpinner />}>
          <AdminCoupons />
        </Suspense>
      </Route>
      <Route path={"/admin/stats"}>
        <Suspense fallback={<LoadingSpinner />}>
          <AdminStats />
        </Suspense>
      </Route>

      <Route path={"/admin/bank-transfers"}>
        <Suspense fallback={<LoadingSpinner />}>
          <AdminBankTransfers />
        </Suspense>
      </Route>
      <Route path={"/admin/activation-codes"}>
        <Suspense fallback={<LoadingSpinner />}>
          <AdminActivationCodes />
        </Suspense>
      </Route>
      <Route path={"/admin/monthly-code"}>
        <Suspense fallback={<LoadingSpinner />}>
          <AdminMonthlyCode />
        </Suspense>
      </Route>
      <Route path={"/coupon"}>
        <Suspense fallback={<LoadingSpinner />}>
          <Coupon />
        </Suspense>
      </Route>
      <Route path={"/monthly-code"}>
        <Suspense fallback={<LoadingSpinner />}>
          <MonthlyCode />
        </Suspense>
      </Route>

      <Route path="/admin/subscription-stats">
        <Suspense fallback={<LoadingSpinner />}>
          <AdminSubscriptionStats />
        </Suspense>
      </Route>

      <Route path="/admin/upgrade-requests">
        <Suspense fallback={<LoadingSpinner />}>
          <AdminUpgradeRequests />
        </Suspense>
      </Route>
      <Route path="/admin/deleted-sessions">
        <Suspense fallback={<LoadingSpinner />}>
          <AdminDeletedSessions />
        </Suspense>
      </Route>
      <Route path="/admin/account-merge">
        <Suspense fallback={<LoadingSpinner />}>
          <AdminAccountMerge />
        </Suspense>
      </Route>
      <Route path="/admin/suspicious-accounts">
        <Suspense fallback={<LoadingSpinner />}>
          <AdminSuspiciousAccounts />
        </Suspense>
      </Route>
      <Route path="/admin/payments">
        <Suspense fallback={<LoadingSpinner />}>
          <AdminPayments />
        </Suspense>
      </Route>
      <Route path="/help">
        <Suspense fallback={<LoadingSpinner />}>
          <Help />
        </Suspense>
      </Route>
      <Route path="/purchase-success">
        <Suspense fallback={<LoadingSpinner />}>
          <PurchaseSuccess />
        </Suspense>
      </Route>
      <Route path="/reading-history">
        <Suspense fallback={<LoadingSpinner />}>
          <ReadingHistory />
        </Suspense>
      </Route>
      <Route path="/history/:id">
        <Suspense fallback={<LoadingSpinner />}>
          <ReadingHistoryDetail />
        </Suspense>
      </Route>
      <Route path="/favorites">
        <Suspense fallback={<LoadingSpinner />}>
          <FavoriteOracles />
        </Suspense>
      </Route>
      <Route path="/favorite-readings">
        <Suspense fallback={<LoadingSpinner />}>
          <Favorites />
        </Suspense>
      </Route>
      <Route path="/message-settings">
        <Suspense fallback={<LoadingSpinner />}>
          <MessageSettings />
        </Suspense>
      </Route>
      <Route path="/scheduled-messages">
        <Suspense fallback={<LoadingSpinner />}>
          <ScheduledMessages />
        </Suspense>
      </Route>
      <Route path="/special-dates">
        <Suspense fallback={<LoadingSpinner />}>
          <SpecialDates />
        </Suspense>
      </Route>
      <Route path="/loyalty">
        <Suspense fallback={<LoadingSpinner />}>
          <Loyalty />
        </Suspense>
      </Route>
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <DisplaySettingsProvider>
      <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <Toaster />
            <Router />
            <ChatSupport />
          </TooltipProvider>
      </ThemeProvider>
      </DisplaySettingsProvider>
    </ErrorBoundary>
  );
}

export default App;
