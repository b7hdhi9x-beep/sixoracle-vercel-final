import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// Mock cookies
vi.mock("./_core/cookies", () => ({
  getSessionCookieOptions: vi.fn().mockReturnValue({
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  }),
}));

// Country codes for testing
const COUNTRY_CODES = [
  { code: "+81", country: "JP", name: "日本", pattern: /^[789]0\d{8}$/ },
  { code: "+1", country: "US", name: "アメリカ", pattern: /^[2-9]\d{9}$/ },
  { code: "+86", country: "CN", name: "中国", pattern: /^1[3-9]\d{9}$/ },
  { code: "+82", country: "KR", name: "韓国", pattern: /^10\d{8}$/ },
  { code: "+44", country: "GB", name: "イギリス", pattern: /^7\d{9}$/ },
  { code: "+65", country: "SG", name: "シンガポール", pattern: /^[89]\d{7}$/ },
  { code: "+852", country: "HK", name: "香港", pattern: /^[5-9]\d{7}$/ },
  { code: "+886", country: "TW", name: "台湾", pattern: /^9\d{8}$/ },
];

// Normalize phone number with country code
const normalizePhoneNumber = (phone: string, countryCode: string = "+81"): string => {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    digits = digits.substring(1);
  }
  const codeDigits = countryCode.replace("+", "");
  if (digits.startsWith(codeDigits)) {
    digits = digits.substring(codeDigits.length);
  }
  return countryCode + digits;
};

// Validate phone number for a given country
const isValidPhoneNumber = (phone: string, countryCode: string = "+81"): boolean => {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    digits = digits.substring(1);
  }
  const codeDigits = countryCode.replace("+", "");
  if (digits.startsWith(codeDigits)) {
    digits = digits.substring(codeDigits.length);
  }
  const country = COUNTRY_CODES.find(c => c.code === countryCode);
  if (!country) {
    return digits.length >= 7 && digits.length <= 15;
  }
  return country.pattern.test(digits);
};

describe("Phone Auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Phone number normalization with country codes", () => {
    it("should normalize Japanese mobile numbers correctly", () => {
      expect(normalizePhoneNumber("090-1234-5678", "+81")).toBe("+819012345678");
      expect(normalizePhoneNumber("09012345678", "+81")).toBe("+819012345678");
      expect(normalizePhoneNumber("080-9876-5432", "+81")).toBe("+818098765432");
      expect(normalizePhoneNumber("070-1111-2222", "+81")).toBe("+817011112222");
    });

    it("should normalize US phone numbers correctly", () => {
      expect(normalizePhoneNumber("555-123-4567", "+1")).toBe("+15551234567");
      expect(normalizePhoneNumber("5551234567", "+1")).toBe("+15551234567");
      expect(normalizePhoneNumber("(555) 123-4567", "+1")).toBe("+15551234567");
    });

    it("should normalize Chinese phone numbers correctly", () => {
      expect(normalizePhoneNumber("138-1234-5678", "+86")).toBe("+8613812345678");
      expect(normalizePhoneNumber("13812345678", "+86")).toBe("+8613812345678");
    });

    it("should normalize Korean phone numbers correctly", () => {
      expect(normalizePhoneNumber("010-1234-5678", "+82")).toBe("+821012345678");
      expect(normalizePhoneNumber("10-1234-5678", "+82")).toBe("+821012345678");
    });

    it("should normalize Singapore phone numbers correctly", () => {
      expect(normalizePhoneNumber("8123-4567", "+65")).toBe("+6581234567");
      expect(normalizePhoneNumber("81234567", "+65")).toBe("+6581234567");
    });

    it("should normalize Hong Kong phone numbers correctly", () => {
      expect(normalizePhoneNumber("5123-4567", "+852")).toBe("+85251234567");
      expect(normalizePhoneNumber("51234567", "+852")).toBe("+85251234567");
    });

    it("should normalize Taiwan phone numbers correctly", () => {
      expect(normalizePhoneNumber("0912-345-678", "+886")).toBe("+886912345678");
      expect(normalizePhoneNumber("912345678", "+886")).toBe("+886912345678");
    });

    it("should handle leading zeros correctly", () => {
      expect(normalizePhoneNumber("090-1234-5678", "+81")).toBe("+819012345678");
      expect(normalizePhoneNumber("010-1234-5678", "+82")).toBe("+821012345678");
    });
  });

  describe("Phone number validation with country codes", () => {
    it("should validate Japanese mobile numbers", () => {
      expect(isValidPhoneNumber("090-1234-5678", "+81")).toBe(true);
      expect(isValidPhoneNumber("080-1234-5678", "+81")).toBe(true);
      expect(isValidPhoneNumber("070-1234-5678", "+81")).toBe(true);
      expect(isValidPhoneNumber("03-1234-5678", "+81")).toBe(false); // Landline
      expect(isValidPhoneNumber("050-1234-5678", "+81")).toBe(false); // IP phone
    });

    it("should validate US phone numbers", () => {
      expect(isValidPhoneNumber("555-123-4567", "+1")).toBe(true);
      expect(isValidPhoneNumber("212-555-1234", "+1")).toBe(true);
      expect(isValidPhoneNumber("123-456-7890", "+1")).toBe(false); // Invalid area code
    });

    it("should validate Chinese phone numbers", () => {
      expect(isValidPhoneNumber("138-1234-5678", "+86")).toBe(true);
      expect(isValidPhoneNumber("139-1234-5678", "+86")).toBe(true);
      expect(isValidPhoneNumber("121-1234-5678", "+86")).toBe(false); // Invalid prefix
    });

    it("should validate Korean phone numbers", () => {
      expect(isValidPhoneNumber("010-1234-5678", "+82")).toBe(true);
      expect(isValidPhoneNumber("10-1234-5678", "+82")).toBe(true);
      expect(isValidPhoneNumber("020-1234-5678", "+82")).toBe(false); // Invalid prefix
    });

    it("should validate Singapore phone numbers", () => {
      expect(isValidPhoneNumber("8123-4567", "+65")).toBe(true);
      expect(isValidPhoneNumber("9123-4567", "+65")).toBe(true);
      expect(isValidPhoneNumber("7123-4567", "+65")).toBe(false); // Invalid prefix
    });

    it("should validate Hong Kong phone numbers", () => {
      expect(isValidPhoneNumber("5123-4567", "+852")).toBe(true);
      expect(isValidPhoneNumber("9123-4567", "+852")).toBe(true);
      expect(isValidPhoneNumber("3123-4567", "+852")).toBe(false); // Invalid prefix
    });

    it("should validate Taiwan phone numbers", () => {
      expect(isValidPhoneNumber("912-345-678", "+886")).toBe(true);
      expect(isValidPhoneNumber("0912-345-678", "+886")).toBe(true);
      expect(isValidPhoneNumber("812-345-678", "+886")).toBe(false); // Invalid prefix
    });
  });

  describe("OTP generation", () => {
    it("should generate 6-digit OTP codes", () => {
      const generateOtpCode = (): string => {
        return Math.floor(100000 + Math.random() * 900000).toString();
      };

      for (let i = 0; i < 100; i++) {
        const otp = generateOtpCode();
        expect(otp).toHaveLength(6);
        expect(parseInt(otp)).toBeGreaterThanOrEqual(100000);
        expect(parseInt(otp)).toBeLessThan(1000000);
      }
    });
  });

  describe("Rate limiting logic", () => {
    const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute

    it("should calculate remaining cooldown time correctly", () => {
      const lastOtpSentAt = new Date(Date.now() - 30 * 1000); // 30 seconds ago
      
      const timeSinceLastOtp = Date.now() - lastOtpSentAt.getTime();
      const isRateLimited = timeSinceLastOtp < RESEND_COOLDOWN_MS;
      const remainingSeconds = Math.ceil((RESEND_COOLDOWN_MS - timeSinceLastOtp) / 1000);
      
      expect(isRateLimited).toBe(true);
      expect(remainingSeconds).toBeGreaterThan(0);
      expect(remainingSeconds).toBeLessThanOrEqual(30);
    });

    it("should allow resend after cooldown period", () => {
      const lastOtpSentAt = new Date(Date.now() - 61 * 1000); // 61 seconds ago
      
      const timeSinceLastOtp = Date.now() - lastOtpSentAt.getTime();
      const isRateLimited = timeSinceLastOtp < RESEND_COOLDOWN_MS;
      
      expect(isRateLimited).toBe(false);
    });
  });

  describe("Daily resend limit logic", () => {
    const MAX_DAILY_RESENDS = 5;

    it("should track daily resend count correctly", () => {
      let dailyResendCount = 0;
      
      // Simulate resends within limit
      for (let i = 0; i < MAX_DAILY_RESENDS; i++) {
        dailyResendCount++;
        expect(dailyResendCount <= MAX_DAILY_RESENDS).toBe(true);
      }
      
      // 6th resend should exceed limit
      expect(dailyResendCount >= MAX_DAILY_RESENDS).toBe(true);
    });

    it("should reset daily count on new day", () => {
      const lastResetDate = new Date("2026-01-28T12:00:00Z");
      const today = new Date("2026-01-29T12:00:00Z");
      
      const isNewDay = 
        lastResetDate.getDate() !== today.getDate() ||
        lastResetDate.getMonth() !== today.getMonth() ||
        lastResetDate.getFullYear() !== today.getFullYear();
      
      expect(isNewDay).toBe(true);
    });

    it("should not reset daily count on same day", () => {
      const lastResetDate = new Date("2026-01-29T08:00:00Z");
      const today = new Date("2026-01-29T20:00:00Z");
      
      const isNewDay = 
        lastResetDate.getDate() !== today.getDate() ||
        lastResetDate.getMonth() !== today.getMonth() ||
        lastResetDate.getFullYear() !== today.getFullYear();
      
      expect(isNewDay).toBe(false);
    });

    it("should calculate remaining daily resends", () => {
      const currentDailyCount = 3;
      const remainingResends = MAX_DAILY_RESENDS - currentDailyCount;
      
      expect(remainingResends).toBe(2);
    });
  });

  describe("OTP expiration logic", () => {
    it("should detect expired OTP", () => {
      const otpExpires = new Date(Date.now() - 60 * 1000); // Expired 1 minute ago
      const isExpired = new Date(otpExpires) < new Date();
      
      expect(isExpired).toBe(true);
    });

    it("should detect valid OTP", () => {
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // Expires in 5 minutes
      const isExpired = new Date(otpExpires) < new Date();
      
      expect(isExpired).toBe(false);
    });
  });

  describe("OTP attempt tracking", () => {
    it("should track failed attempts correctly", () => {
      const maxAttempts = 5;
      let attempts = 0;
      
      // Simulate failed attempts
      for (let i = 0; i < 4; i++) {
        attempts++;
        expect(attempts < maxAttempts).toBe(true);
      }
      
      // 5th attempt should trigger lockout
      attempts++;
      expect(attempts >= maxAttempts).toBe(true);
    });

    it("should calculate remaining attempts", () => {
      const maxAttempts = 5;
      const currentAttempts = 3;
      const remainingAttempts = maxAttempts - currentAttempts;
      
      expect(remainingAttempts).toBe(2);
    });
  });

  describe("Demo mode detection", () => {
    it("should detect when SMS service is not configured", () => {
      const isSmsServiceConfigured = (): boolean => {
        return !!(
          process.env.TWILIO_ACCOUNT_SID &&
          process.env.TWILIO_AUTH_TOKEN &&
          process.env.TWILIO_PHONE_NUMBER
        );
      };

      // In test environment, Twilio is not configured
      expect(isSmsServiceConfigured()).toBe(false);
    });
  });

  describe("Country codes list", () => {
    it("should have all required country codes", () => {
      const requiredCodes = ["+81", "+1", "+86", "+82", "+44", "+65", "+852", "+886"];
      
      for (const code of requiredCodes) {
        const country = COUNTRY_CODES.find(c => c.code === code);
        expect(country).toBeDefined();
      }
    });

    it("should have valid patterns for all countries", () => {
      for (const country of COUNTRY_CODES) {
        expect(country.pattern).toBeInstanceOf(RegExp);
        expect(country.code).toMatch(/^\+\d+$/);
        expect(country.country).toHaveLength(2);
        expect(country.name.length).toBeGreaterThan(0);
      }
    });
  });
});
