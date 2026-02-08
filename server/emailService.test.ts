import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock nodemailer before importing the module
vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({ messageId: "test-message-id" }),
      verify: vi.fn().mockResolvedValue(true),
    })),
  },
}));

describe("EmailService", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  describe("isEmailConfigured", () => {
    it("should return false when email is not configured", async () => {
      delete process.env.EMAIL_SERVICE;
      delete process.env.EMAIL_USER;
      delete process.env.EMAIL_PASSWORD;
      
      const { isEmailConfigured } = await import("./emailService");
      expect(isEmailConfigured()).toBe(false);
    });

    it("should return true when email is configured", async () => {
      process.env.EMAIL_SERVICE = "gmail";
      process.env.EMAIL_USER = "test@gmail.com";
      process.env.EMAIL_PASSWORD = "test-password";
      
      const { isEmailConfigured } = await import("./emailService");
      expect(isEmailConfigured()).toBe(true);
    });
  });

  describe("getEmailConfigStatus", () => {
    it("should return not configured status when email is not set up", async () => {
      delete process.env.EMAIL_SERVICE;
      delete process.env.EMAIL_USER;
      delete process.env.EMAIL_PASSWORD;
      
      const { getEmailConfigStatus } = await import("./emailService");
      const status = getEmailConfigStatus();
      
      expect(status.configured).toBe(false);
      expect(status.service).toBeNull();
      expect(status.user).toBeNull();
    });

    it("should return configured status with service and user", async () => {
      process.env.EMAIL_SERVICE = "gmail";
      process.env.EMAIL_USER = "test@gmail.com";
      process.env.EMAIL_PASSWORD = "test-password";
      
      const { getEmailConfigStatus } = await import("./emailService");
      const status = getEmailConfigStatus();
      
      expect(status.configured).toBe(true);
      expect(status.service).toBe("gmail");
      expect(status.user).toBe("test@gmail.com");
    });
  });

  describe("sendEmail", () => {
    it("should return error when email is not configured", async () => {
      delete process.env.EMAIL_SERVICE;
      delete process.env.EMAIL_USER;
      delete process.env.EMAIL_PASSWORD;
      
      const { sendEmail } = await import("./emailService");
      const result = await sendEmail({
        to: "recipient@example.com",
        subject: "Test Subject",
        html: "<p>Test</p>",
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("Email service not configured");
    });

    it("should send email successfully when configured", async () => {
      process.env.EMAIL_SERVICE = "gmail";
      process.env.EMAIL_USER = "test@gmail.com";
      process.env.EMAIL_PASSWORD = "test-password";
      
      const { sendEmail } = await import("./emailService");
      const result = await sendEmail({
        to: "recipient@example.com",
        subject: "Test Subject",
        html: "<p>Test</p>",
      });
      
      expect(result.success).toBe(true);
      expect(result.messageId).toBe("test-message-id");
    });
  });

  describe("sendActivationCodeEmail", () => {
    it("should send activation code email with correct template data", async () => {
      process.env.EMAIL_SERVICE = "gmail";
      process.env.EMAIL_USER = "test@gmail.com";
      process.env.EMAIL_PASSWORD = "test-password";
      
      const { sendActivationCodeEmail } = await import("./emailService");
      const result = await sendActivationCodeEmail({
        to: "user@example.com",
        userName: "テストユーザー",
        activationCode: "ORACLE-TEST-CODE",
        planName: "月額プラン",
        durationDays: 30,
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe("sendRenewalReminderEmail", () => {
    it("should send renewal reminder email with correct template data", async () => {
      process.env.EMAIL_SERVICE = "gmail";
      process.env.EMAIL_USER = "test@gmail.com";
      process.env.EMAIL_PASSWORD = "test-password";
      
      const { sendRenewalReminderEmail } = await import("./emailService");
      const result = await sendRenewalReminderEmail({
        to: "user@example.com",
        userName: "テストユーザー",
        planName: "月額プラン",
        expiresAt: "2026年2月15日",
        renewalAmount: "¥1,980",
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe("sendPlanActivatedEmail", () => {
    it("should send plan activated email with correct template data", async () => {
      process.env.EMAIL_SERVICE = "gmail";
      process.env.EMAIL_USER = "test@gmail.com";
      process.env.EMAIL_PASSWORD = "test-password";
      
      const { sendPlanActivatedEmail } = await import("./emailService");
      const result = await sendPlanActivatedEmail({
        to: "user@example.com",
        userName: "テストユーザー",
        planName: "月額プラン",
        expiresAt: "2026年2月28日",
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe("sendPlanExpiredEmail", () => {
    it("should send plan expired email with correct template data", async () => {
      process.env.EMAIL_SERVICE = "gmail";
      process.env.EMAIL_USER = "test@gmail.com";
      process.env.EMAIL_PASSWORD = "test-password";
      
      const { sendPlanExpiredEmail } = await import("./emailService");
      const result = await sendPlanExpiredEmail({
        to: "user@example.com",
        userName: "テストユーザー",
      });
      
      expect(result.success).toBe(true);
    });
  });

  describe("testEmailConfiguration", () => {
    it("should return error when email is not configured", async () => {
      delete process.env.EMAIL_SERVICE;
      delete process.env.EMAIL_USER;
      delete process.env.EMAIL_PASSWORD;
      
      const { testEmailConfiguration } = await import("./emailService");
      const result = await testEmailConfiguration();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("Email service not configured");
    });

    it("should verify email configuration successfully", async () => {
      process.env.EMAIL_SERVICE = "gmail";
      process.env.EMAIL_USER = "test@gmail.com";
      process.env.EMAIL_PASSWORD = "test-password";
      
      const { testEmailConfiguration } = await import("./emailService");
      const result = await testEmailConfiguration();
      
      expect(result.success).toBe(true);
    });
  });
});
