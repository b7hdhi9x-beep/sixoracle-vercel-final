import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { users, emailCredentials } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { notifyOwner } from "./_core/notification";
import { SignJWT } from "jose";
import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME } from "../shared/const";
import { recordLoginAttempt } from "./loginHistory";

// Generate a random token
function generateToken(): string {
  return randomBytes(32).toString("hex");
}

// Generate a unique openId for email users
function generateOpenId(): string {
  return `email_${randomBytes(16).toString("hex")}`;
}

// Generate a random password
function generateRandomPassword(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Get JWT secret
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return new TextEncoder().encode(secret);
}

// Create JWT token for session
async function createSessionToken(userId: number, email: string): Promise<string> {
  const token = await new SignJWT({ userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getJwtSecret());
  return token;
}

export const emailAuthRouter = router({
  // Register a new user with email and password
  register: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8, "パスワードは8文字以上必要です"),
      name: z.string().min(1, "名前を入力してください"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if email already exists
      const existingCredential = await db
        .select()
        .from(emailCredentials)
        .where(eq(emailCredentials.email, input.email.toLowerCase()))
        .limit(1);

      if (existingCredential[0]) {
        throw new Error("このメールアドレスは既に登録されています");
      }

      // Hash password
      const passwordHash = await bcrypt.hash(input.password, 12);

      // Generate verification token
      const verificationToken = generateToken();
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user
      const openId = generateOpenId();
      const [newUser] = await db.insert(users).values({
        openId,
        name: input.name,
        email: input.email.toLowerCase(),
        loginMethod: "email",
        role: "user",
        isPremium: false,
      });

      const userId = newUser.insertId;

      // Create email credentials
      await db.insert(emailCredentials).values({
        userId: Number(userId),
        email: input.email.toLowerCase(),
        passwordHash,
        isVerified: false,
        verificationToken,
        verificationExpires,
      });

      // Auto-verify email since we can't send emails to users directly yet
      // In production, you would integrate with an email service like SendGrid, Resend, etc.
      await db
        .update(emailCredentials)
        .set({ isVerified: true, verificationToken: null, verificationExpires: null })
        .where(eq(emailCredentials.email, input.email.toLowerCase()));

      // Notify owner of new registration (optional)
      try {
        await notifyOwner({
          title: "新規ユーザー登録",
          content: `新しいユーザーが登録しました\n\nメール: ${input.email}\n名前: ${input.name}`,
        });
      } catch (e) {
        // Ignore notification errors
        console.log("Failed to notify owner of new registration", e);
      }

      // Auto-login after registration
      const token = await createSessionToken(Number(userId), input.email.toLowerCase());
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

      return {
        success: true,
        message: "登録が完了しました。ログインしました。",
        userId: Number(userId),
      };
    }),

  // Login with email and password
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Find credentials
      const [credential] = await db
        .select()
        .from(emailCredentials)
        .where(eq(emailCredentials.email, input.email.toLowerCase()))
        .limit(1);

      if (!credential) {
        throw new Error("メールアドレスまたはパスワードが正しくありません");
      }

      // Verify password
      const isValid = await bcrypt.compare(input.password, credential.passwordHash);
      if (!isValid) {
        throw new Error("メールアドレスまたはパスワードが正しくありません");
      }

      // Check if verified
      if (!credential.isVerified) {
        throw new Error("メールアドレスの確認が完了していません");
      }

      // Generate unique session token for duplicate login prevention
      const sessionToken = randomBytes(32).toString("hex");
      
      // Get device info from request
      const userAgent = ctx.req.headers["user-agent"] || "Unknown";
      
      // Update last signed in and session token (invalidates previous sessions)
      await db
        .update(users)
        .set({ 
          lastSignedIn: new Date(),
          currentSessionToken: sessionToken,
          lastLoginAt: new Date(),
          lastLoginDevice: userAgent,
        })
        .where(eq(users.id, credential.userId));

      // Create session
      const token = await createSessionToken(credential.userId, input.email.toLowerCase());
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, cookieOptions);
      
      // Store session token in a separate cookie for validation
      ctx.res.cookie("session_token", sessionToken, { ...cookieOptions, httpOnly: true });

      // Record successful login
      await recordLoginAttempt({
        userId: credential.userId,
        loginMethod: "email",
        req: ctx.req,
        success: true,
        sessionId: token.substring(0, 32), // Store partial token for reference
      });

      return {
        success: true,
        message: "ログインしました",
        userId: credential.userId,
      };
    }),

  // Request password reset
  requestReset: publicProcedure
    .input(z.object({
      email: z.string().email(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Find credentials
      const [credential] = await db
        .select()
        .from(emailCredentials)
        .where(eq(emailCredentials.email, input.email.toLowerCase()))
        .limit(1);

      // Always return success to prevent email enumeration
      if (!credential) {
        return {
          success: true,
          message: "パスワードリセットのメールを送信しました（登録されている場合）",
        };
      }

      // Generate reset token
      const resetToken = generateToken();
      const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

      await db
        .update(emailCredentials)
        .set({ resetToken, resetExpires })
        .where(eq(emailCredentials.email, input.email.toLowerCase()));

      // For now, we can't send emails directly to users
      // In production, integrate with an email service
      // For testing, the reset token is logged (remove in production)
      const resetUrl = `${ctx.req.headers.origin}/reset-password?token=${resetToken}`;
      console.log(`[Password Reset] URL for ${input.email}: ${resetUrl}`);
      
      // Notify owner (for admin visibility)
      try {
        await notifyOwner({
          title: "パスワードリセット要求",
          content: `パスワードリセットが要求されました\n\nメール: ${input.email}\nリセットリンク: ${resetUrl}`,
        });
      } catch (e) {
        console.log("Failed to notify owner of password reset", e);
      }

      return {
        success: true,
        message: "パスワードリセットのメールを送信しました",
      };
    }),

  // Reset password with token
  resetPassword: publicProcedure
    .input(z.object({
      token: z.string(),
      newPassword: z.string().min(8, "パスワードは8文字以上必要です"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Find credentials by reset token
      const [credential] = await db
        .select()
        .from(emailCredentials)
        .where(eq(emailCredentials.resetToken, input.token))
        .limit(1);

      if (!credential) {
        throw new Error("無効なリセットトークンです");
      }

      // Check if token is expired
      if (credential.resetExpires && credential.resetExpires < new Date()) {
        throw new Error("リセットトークンの有効期限が切れています");
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(input.newPassword, 12);

      // Update password and clear reset token
      await db
        .update(emailCredentials)
        .set({
          passwordHash,
          resetToken: null,
          resetExpires: null,
        })
        .where(eq(emailCredentials.id, credential.id));

      return {
        success: true,
        message: "パスワードが変更されました。ログインしてください。",
      };
    }),

  // Verify email with token
  verifyEmail: publicProcedure
    .input(z.object({
      token: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Find credentials by verification token
      const [credential] = await db
        .select()
        .from(emailCredentials)
        .where(eq(emailCredentials.verificationToken, input.token))
        .limit(1);

      if (!credential) {
        throw new Error("無効な確認トークンです");
      }

      // Check if token is expired
      if (credential.verificationExpires && credential.verificationExpires < new Date()) {
        throw new Error("確認トークンの有効期限が切れています");
      }

      // Mark as verified
      await db
        .update(emailCredentials)
        .set({
          isVerified: true,
          verificationToken: null,
          verificationExpires: null,
        })
        .where(eq(emailCredentials.id, credential.id));

      return {
        success: true,
        message: "メールアドレスの確認が完了しました。ログインしてください。",
      };
    }),

  // ===== Admin User Management =====

  // Create a new user (admin only)
  createUser: protectedProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().min(1, "名前を入力してください"),
      password: z.string().optional(), // If not provided, generate random password
      isPremium: z.boolean().default(false),
      role: z.enum(["user", "admin"]).default("user"),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check admin access
      if (ctx.user.role !== "admin") {
        throw new Error("管理者権限が必要です");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if email already exists
      const existingCredential = await db
        .select()
        .from(emailCredentials)
        .where(eq(emailCredentials.email, input.email.toLowerCase()))
        .limit(1);

      if (existingCredential[0]) {
        throw new Error("このメールアドレスは既に登録されています");
      }

      // Generate password if not provided
      const password = input.password || generateRandomPassword();
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const openId = generateOpenId();
      const [newUser] = await db.insert(users).values({
        openId,
        name: input.name,
        email: input.email.toLowerCase(),
        loginMethod: "email",
        role: input.role,
        isPremium: input.isPremium,
      });

      const userId = newUser.insertId;

      // Create email credentials (auto-verified for admin-created users)
      await db.insert(emailCredentials).values({
        userId: Number(userId),
        email: input.email.toLowerCase(),
        passwordHash,
        isVerified: true, // Admin-created users are auto-verified
      });

      return {
        success: true,
        message: "ユーザーを作成しました",
        userId: Number(userId),
        email: input.email.toLowerCase(),
        password: password, // Return password so admin can share it with user
      };
    }),

  // Get all users with credentials (admin only)
  getAllUsersWithCredentials: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("管理者権限が必要です");
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allUsers = await db
      .select({
        id: users.id,
        openId: users.openId,
        name: users.name,
        email: users.email,
        displayName: users.displayName,
        role: users.role,
        isPremium: users.isPremium,
        planType: users.planType,
        premiumExpiresAt: users.premiumExpiresAt,
        loginMethod: users.loginMethod,
        createdAt: users.createdAt,
        lastSignedIn: users.lastSignedIn,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    return allUsers;
  }),

  // Update user password (admin only)
  updateUserPassword: protectedProcedure
    .input(z.object({
      userId: z.number(),
      newPassword: z.string().min(8, "パスワードは8文字以上必要です"),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("管理者権限が必要です");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Find credentials by user ID
      const [credential] = await db
        .select()
        .from(emailCredentials)
        .where(eq(emailCredentials.userId, input.userId))
        .limit(1);

      if (!credential) {
        throw new Error("このユーザーのメール認証情報が見つかりません");
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(input.newPassword, 12);

      // Update password
      await db
        .update(emailCredentials)
        .set({ passwordHash })
        .where(eq(emailCredentials.userId, input.userId));

      return {
        success: true,
        message: "パスワードを更新しました",
      };
    }),

  // Reset user password and generate new one (admin only)
  resetUserPassword: protectedProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("管理者権限が必要です");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Find credentials by user ID
      const [credential] = await db
        .select()
        .from(emailCredentials)
        .where(eq(emailCredentials.userId, input.userId))
        .limit(1);

      if (!credential) {
        throw new Error("このユーザーのメール認証情報が見つかりません");
      }

      // Generate new password
      const newPassword = generateRandomPassword();
      const passwordHash = await bcrypt.hash(newPassword, 12);

      // Update password
      await db
        .update(emailCredentials)
        .set({ passwordHash })
        .where(eq(emailCredentials.userId, input.userId));

      return {
        success: true,
        message: "パスワードをリセットしました",
        newPassword, // Return new password so admin can share it with user
      };
    }),

  // Delete user completely (admin only)
  deleteUserCompletely: protectedProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("管理者権限が必要です");
      }

      // Prevent deleting self
      if (input.userId === ctx.user.id) {
        throw new Error("自分のアカウントは削除できません");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Delete email credentials first
      await db.delete(emailCredentials).where(eq(emailCredentials.userId, input.userId));

      // Note: Other related data (chat logs, etc.) should be deleted by the main admin.deleteUser procedure
      // This procedure focuses on email credentials cleanup

      return {
        success: true,
        message: "ユーザーの認証情報を削除しました",
      };
    }),
});
