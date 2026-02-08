import { publicProcedure, router } from "./_core/trpc";
import { recordLoginAttempt } from "./loginHistory";
import { z } from "zod";
import { getDb } from "./db";
import { users, phoneCredentials } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { notifyOwner } from "./_core/notification";
import { SignJWT } from "jose";
import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME } from "../shared/const";
import { getTodayJST, needsDailyReset } from "./dailyReset";

// Generate a 6-digit OTP code
function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate a unique openId for phone users
function generateOpenId(): string {
  return `phone_${randomBytes(16).toString("hex")}`;
}

// Get JWT secret
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return new TextEncoder().encode(secret);
}

// Create JWT token for session
async function createSessionToken(userId: number, phoneNumber: string): Promise<string> {
  const token = await new SignJWT({ userId, phoneNumber })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getJwtSecret());
  return token;
}

// Country codes for international phone number support
export const COUNTRY_CODES = [
  { code: "+81", country: "JP", name: "日本", flag: "🇯🇵", pattern: /^[789]0\d{8}$/ },
  { code: "+1", country: "US", name: "アメリカ", flag: "🇺🇸", pattern: /^[2-9]\d{9}$/ },
  { code: "+86", country: "CN", name: "中国", flag: "🇨🇳", pattern: /^1[3-9]\d{9}$/ },
  { code: "+82", country: "KR", name: "韓国", flag: "🇰🇷", pattern: /^10\d{8}$/ },
  { code: "+44", country: "GB", name: "イギリス", flag: "🇬🇧", pattern: /^7\d{9}$/ },
  { code: "+33", country: "FR", name: "フランス", flag: "🇫🇷", pattern: /^[67]\d{8}$/ },
  { code: "+49", country: "DE", name: "ドイツ", flag: "🇩🇪", pattern: /^1[567]\d{8,9}$/ },
  { code: "+61", country: "AU", name: "オーストラリア", flag: "🇦🇺", pattern: /^4\d{8}$/ },
  { code: "+65", country: "SG", name: "シンガポール", flag: "🇸🇬", pattern: /^[89]\d{7}$/ },
  { code: "+852", country: "HK", name: "香港", flag: "🇭🇰", pattern: /^[5-9]\d{7}$/ },
  { code: "+886", country: "TW", name: "台湾", flag: "🇹🇼", pattern: /^9\d{8}$/ },
];

// Normalize phone number to E.164 format with country code
function normalizePhoneNumber(phone: string, countryCode: string = "+81"): string {
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, "");
  
  // Remove leading zero if present (common in local formats)
  if (digits.startsWith("0")) {
    digits = digits.substring(1);
  }
  
  // Remove country code from digits if already included
  const codeDigits = countryCode.replace("+", "");
  if (digits.startsWith(codeDigits)) {
    digits = digits.substring(codeDigits.length);
  }
  
  return countryCode + digits;
}

// Validate phone number format for a given country
function isValidPhoneNumber(phone: string, countryCode: string = "+81"): boolean {
  // Remove all non-digit characters and leading zero
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    digits = digits.substring(1);
  }
  
  // Remove country code from digits if already included
  const codeDigits = countryCode.replace("+", "");
  if (digits.startsWith(codeDigits)) {
    digits = digits.substring(codeDigits.length);
  }
  
  // Find the country config
  const country = COUNTRY_CODES.find(c => c.code === countryCode);
  if (!country) {
    // Default validation: at least 7 digits
    return digits.length >= 7 && digits.length <= 15;
  }
  
  return country.pattern.test(digits);
}

// Resend cooldown (no daily limit)
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute

// Check if SMS service is configured (Twilio, etc.)
function isSmsServiceConfigured(): boolean {
  return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);
}

// Send SMS (mock for demo mode, real for production)
async function sendSms(phoneNumber: string, message: string): Promise<{ success: boolean; demoCode?: string }> {
  if (isSmsServiceConfigured()) {
    // Production: Use Twilio
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID!;
      const authToken = process.env.TWILIO_AUTH_TOKEN!;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER!;
      
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Authorization": "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: phoneNumber,
            From: fromNumber,
            Body: message,
          }),
        }
      );
      
      if (!response.ok) {
        console.error("Twilio SMS failed:", await response.text());
        return { success: false };
      }
      
      return { success: true };
    } catch (error) {
      console.error("SMS sending error:", error);
      return { success: false };
    }
  } else {
    // Demo mode: Return code for display
    const codeMatch = message.match(/\d{6}/);
    const demoCode = codeMatch ? codeMatch[0] : undefined;
    console.log(`[DEMO SMS] To: ${phoneNumber}, Message: ${message}`);
    return { success: true, demoCode };
  }
}

export const phoneAuthRouter = router({
  // Get available country codes
  getCountryCodes: publicProcedure.query(() => {
    return COUNTRY_CODES.map(c => ({
      code: c.code,
      country: c.country,
      name: c.name,
      flag: c.flag,
    }));
  }),

  // Send OTP to phone number
  sendOtp: publicProcedure
    .input(z.object({
      phoneNumber: z.string().min(5, "電話番号を入力してください"),
      countryCode: z.string().default("+81"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const normalizedPhone = normalizePhoneNumber(input.phoneNumber, input.countryCode);
      
      // Validate phone number format
      if (!isValidPhoneNumber(input.phoneNumber, input.countryCode)) {
        const country = COUNTRY_CODES.find(c => c.code === input.countryCode);
        throw new Error(`有効な${country?.name || ''}の携帯電話番号を入力してください`);
      }

      // Check for existing phone credential
      const [existingCredential] = await db
        .select()
        .from(phoneCredentials)
        .where(eq(phoneCredentials.phoneNumber, normalizedPhone))
        .limit(1);

      // Rate limiting: Check if OTP was sent recently (1 minute cooldown)
      if (existingCredential?.lastOtpSentAt) {
        const timeSinceLastOtp = Date.now() - new Date(existingCredential.lastOtpSentAt).getTime();
        if (timeSinceLastOtp < RESEND_COOLDOWN_MS) {
          const remainingSeconds = Math.ceil((RESEND_COOLDOWN_MS - timeSinceLastOtp) / 1000);
          throw new Error(`${remainingSeconds}秒後に再送信できます`);
        }
      }

      // Daily resend limit check - DISABLED (no limit)
      // Rate limiting is handled by the 1-minute cooldown only

      // Generate OTP
      const otpCode = generateOtpCode();
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      if (existingCredential) {
        // Check if we need to reset daily count (using JST timezone)
        const isNewDay = needsDailyReset(existingCredential.lastResendResetAt);
        const todayJSTStr = getTodayJST();
        
        // Update existing credential with new OTP
        await db
          .update(phoneCredentials)
          .set({
            otpCode,
            otpExpires,
            otpAttempts: 0,
            lastOtpSentAt: new Date(),
            dailyResendCount: isNewDay ? 1 : (existingCredential.dailyResendCount || 0) + 1,
            lastResendResetAt: isNewDay ? new Date(todayJSTStr) : existingCredential.lastResendResetAt,
          })
          .where(eq(phoneCredentials.id, existingCredential.id));
      } else {
        // Create new user and phone credential
        // Phone users don't get free trial - they must subscribe
        const openId = generateOpenId();
        const [newUser] = await db.insert(users).values({
          openId,
          name: null,
          email: null,
          loginMethod: "phone",
          role: "user",
          isPremium: false,
          planType: "free", // No trial for phone users
          trialExchangesUsed: 3, // Mark trial as fully used
          totalFreeReadings: 0,
          usedFreeReadings: 0,
          bonusReadings: 0,
        });

        const userId = newUser.insertId;

        await db.insert(phoneCredentials).values({
          userId: Number(userId),
          phoneNumber: normalizedPhone,
          isVerified: false,
          otpCode,
          otpExpires,
          otpAttempts: 0,
          lastOtpSentAt: new Date(),
          dailyResendCount: 1,
          lastResendResetAt: new Date(),
        });
      }

      // Send SMS
      const message = `【六神ノ間】認証コード: ${otpCode}\nこのコードは5分間有効です。`;
      const smsResult = await sendSms(normalizedPhone, message);

      if (!smsResult.success) {
        throw new Error("SMSの送信に失敗しました。しばらくしてから再度お試しください。");
      }

      // Return demo code if in demo mode
      const isDemo = !isSmsServiceConfigured();
      
      return {
        success: true,
        message: isDemo 
          ? "【デモモード】認証コードを画面に表示しています" 
          : "認証コードをSMSで送信しました",
        isDemo,
        demoCode: isDemo ? otpCode : undefined,
        phoneNumber: normalizedPhone,
      };
    }),

  // Verify OTP and login
  verifyOtp: publicProcedure
    .input(z.object({
      phoneNumber: z.string(),
      otpCode: z.string().length(6, "認証コードは6桁です"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // If phoneNumber already starts with +, it's already normalized from sendOtp response
      const normalizedPhone = input.phoneNumber.startsWith("+") 
        ? input.phoneNumber 
        : normalizePhoneNumber(input.phoneNumber);

      // Find phone credential
      const [credential] = await db
        .select()
        .from(phoneCredentials)
        .where(eq(phoneCredentials.phoneNumber, normalizedPhone))
        .limit(1);

      if (!credential) {
        throw new Error("電話番号が見つかりません。認証コードを再送信してください。");
      }

      // Check OTP attempts (max 5)
      if (credential.otpAttempts >= 5) {
        throw new Error("認証の試行回数が上限に達しました。認証コードを再送信してください。");
      }

      // Check OTP expiration
      if (!credential.otpExpires || new Date(credential.otpExpires) < new Date()) {
        throw new Error("認証コードの有効期限が切れています。再送信してください。");
      }

      // Verify OTP
      if (credential.otpCode !== input.otpCode) {
        // Increment attempts
        await db
          .update(phoneCredentials)
          .set({ otpAttempts: credential.otpAttempts + 1 })
          .where(eq(phoneCredentials.id, credential.id));
        
        const remainingAttempts = 5 - (credential.otpAttempts + 1);
        throw new Error(`認証コードが正しくありません。残り${remainingAttempts}回`);
      }

      // OTP verified - mark as verified and clear OTP
      await db
        .update(phoneCredentials)
        .set({
          isVerified: true,
          otpCode: null,
          otpExpires: null,
          otpAttempts: 0,
        })
        .where(eq(phoneCredentials.id, credential.id));

      // Update user's last signed in
      await db
        .update(users)
        .set({ lastSignedIn: new Date() })
        .where(eq(users.id, credential.userId));

      // Notify owner of new login (for first-time users)
      if (!credential.isVerified) {
        try {
          await notifyOwner({
            title: "新規ユーザー登録（電話番号）",
            content: `新しいユーザーが電話番号で登録しました\n\n電話番号: ${normalizedPhone}`,
          });
        } catch (e) {
          console.log("Failed to notify owner of new registration", e);
        }
      }

      // Generate unique session token for duplicate login prevention
      const sessionToken = randomBytes(32).toString("hex");
      
      // Get device info from request
      const userAgent = ctx.req.headers["user-agent"] || "Unknown";
      
      // Update session token (invalidates previous sessions)
      await db
        .update(users)
        .set({ 
          currentSessionToken: sessionToken,
          lastLoginAt: new Date(),
          lastLoginDevice: userAgent,
        })
        .where(eq(users.id, credential.userId));

      // Create session
      const token = await createSessionToken(credential.userId, normalizedPhone);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, cookieOptions);
      
      // Store session token in a separate cookie for validation
      ctx.res.cookie("session_token", sessionToken, { ...cookieOptions, httpOnly: true });

      // Record successful login
      await recordLoginAttempt({
        userId: credential.userId,
        loginMethod: "phone",
        req: ctx.req,
        success: true,
        sessionId: token.substring(0, 32),
      });

      return {
        success: true,
        message: "ログインしました",
        userId: credential.userId,
        isNewUser: !credential.isVerified,
      };
    }),

  // Resend OTP
  resendOtp: publicProcedure
    .input(z.object({
      phoneNumber: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // If phoneNumber already starts with +, it's already normalized
      const normalizedPhone = input.phoneNumber.startsWith("+") 
        ? input.phoneNumber 
        : normalizePhoneNumber(input.phoneNumber);

      // Find phone credential
      const [credential] = await db
        .select()
        .from(phoneCredentials)
        .where(eq(phoneCredentials.phoneNumber, normalizedPhone))
        .limit(1);

      if (!credential) {
        throw new Error("電話番号が見つかりません。最初からやり直してください。");
      }

      // Rate limiting: Check if OTP was sent recently (1 minute cooldown)
      if (credential.lastOtpSentAt) {
        const timeSinceLastOtp = Date.now() - new Date(credential.lastOtpSentAt).getTime();
        if (timeSinceLastOtp < RESEND_COOLDOWN_MS) {
          const remainingSeconds = Math.ceil((RESEND_COOLDOWN_MS - timeSinceLastOtp) / 1000);
          throw new Error(`${remainingSeconds}秒後に再送信できます`);
        }
      }

      // Daily resend limit check - DISABLED (no limit)
      // Rate limiting is handled by the 1-minute cooldown only

      // Generate new OTP
      const otpCode = generateOtpCode();
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      await db
        .update(phoneCredentials)
        .set({
          otpCode,
          otpExpires,
          otpAttempts: 0,
          lastOtpSentAt: new Date(),
        })
        .where(eq(phoneCredentials.id, credential.id));

      // Send SMS
      const message = `【六神ノ間】認証コード: ${otpCode}\nこのコードは5分間有効です。`;
      const smsResult = await sendSms(normalizedPhone, message);

      if (!smsResult.success) {
        throw new Error("SMSの送信に失敗しました。しばらくしてから再度お試しください。");
      }

      const isDemo = !isSmsServiceConfigured();

      return {
        success: true,
        message: isDemo 
          ? "【デモモード】認証コードを画面に表示しています" 
          : "認証コードを再送信しました",
        isDemo,
        demoCode: isDemo ? otpCode : undefined,
      };
    }),
});
