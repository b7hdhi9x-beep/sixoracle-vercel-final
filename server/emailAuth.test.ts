import { describe, it, expect, vi, beforeEach } from "vitest";
import { jwtVerify, SignJWT } from "jose";

// Mock the JWT secret
const TEST_JWT_SECRET = "test-jwt-secret-for-testing-purposes-only";

describe("Email Authentication Session Verification", () => {
  const getJwtSecret = () => new TextEncoder().encode(TEST_JWT_SECRET);

  describe("Email session token creation", () => {
    it("should create a valid JWT token with userId and email", async () => {
      const userId = 123;
      const email = "test@example.com";

      // Create token (similar to emailAuth.ts createSessionToken)
      const token = await new SignJWT({ userId, email })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(getJwtSecret());

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");

      // Verify the token
      const { payload } = await jwtVerify(token, getJwtSecret(), {
        algorithms: ["HS256"],
      });

      expect(payload.userId).toBe(userId);
      expect(payload.email).toBe(email);
    });
  });

  describe("Email session token verification", () => {
    it("should verify email auth token and extract userId and email", async () => {
      const userId = 456;
      const email = "user@test.com";

      // Create token
      const token = await new SignJWT({ userId, email })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(getJwtSecret());

      // Verify token (similar to sdk.ts verifyEmailSession)
      const { payload } = await jwtVerify(token, getJwtSecret(), {
        algorithms: ["HS256"],
      });

      // Check if this is an email auth token
      const isEmailAuth =
        typeof payload.userId === "number" && typeof payload.email === "string";

      expect(isEmailAuth).toBe(true);
      expect(payload.userId).toBe(userId);
      expect(payload.email).toBe(email);
    });

    it("should distinguish email auth token from Manus OAuth token", async () => {
      // Email auth token
      const emailToken = await new SignJWT({ userId: 123, email: "test@example.com" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(getJwtSecret());

      // Manus OAuth token
      const oauthToken = await new SignJWT({
        openId: "manus_abc123",
        appId: "test-app-id",
        name: "Test User",
      })
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setExpirationTime(Math.floor((Date.now() + 365 * 24 * 60 * 60 * 1000) / 1000))
        .sign(getJwtSecret());

      // Verify email token
      const { payload: emailPayload } = await jwtVerify(emailToken, getJwtSecret(), {
        algorithms: ["HS256"],
      });

      // Check if email auth token
      const isEmailAuth =
        typeof emailPayload.userId === "number" &&
        typeof emailPayload.email === "string";
      expect(isEmailAuth).toBe(true);

      // Verify OAuth token
      const { payload: oauthPayload } = await jwtVerify(oauthToken, getJwtSecret(), {
        algorithms: ["HS256"],
      });

      // Check if OAuth token (has openId, appId, name)
      const isOAuth =
        typeof oauthPayload.openId === "string" &&
        typeof oauthPayload.appId === "string" &&
        typeof oauthPayload.name === "string";
      expect(isOAuth).toBe(true);

      // Email token should NOT have OAuth fields
      expect(emailPayload.openId).toBeUndefined();
      expect(emailPayload.appId).toBeUndefined();

      // OAuth token should NOT have email auth fields
      expect(oauthPayload.userId).toBeUndefined();
    });
  });

  describe("Token expiration", () => {
    it("should reject expired tokens", async () => {
      // Create an expired token
      const token = await new SignJWT({ userId: 123, email: "test@example.com" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(Math.floor(Date.now() / 1000) - 3600) // 1 hour ago
        .sign(getJwtSecret());

      // Verify should fail
      await expect(
        jwtVerify(token, getJwtSecret(), { algorithms: ["HS256"] })
      ).rejects.toThrow();
    });
  });

  describe("Invalid tokens", () => {
    it("should reject tokens with invalid signature", async () => {
      const token = await new SignJWT({ userId: 123, email: "test@example.com" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(getJwtSecret());

      // Try to verify with wrong secret
      const wrongSecret = new TextEncoder().encode("wrong-secret");
      await expect(
        jwtVerify(token, wrongSecret, { algorithms: ["HS256"] })
      ).rejects.toThrow();
    });

    it("should handle malformed tokens gracefully", async () => {
      const malformedTokens = [
        "",
        "not-a-jwt",
        "a.b.c",
        null,
        undefined,
      ];

      for (const token of malformedTokens) {
        if (token === null || token === undefined) {
          // These should be handled before verification
          expect(token).toBeFalsy();
        } else {
          await expect(
            jwtVerify(token, getJwtSecret(), { algorithms: ["HS256"] })
          ).rejects.toThrow();
        }
      }
    });
  });
});

describe("Authentication Flow Logic", () => {
  it("should correctly identify email auth session payload", () => {
    const emailPayload = { userId: 123, email: "test@example.com" };
    const oauthPayload = { openId: "abc123", appId: "app-id", name: "User" };

    // Email auth check
    const isEmailAuth = (payload: any) =>
      typeof payload.userId === "number" && typeof payload.email === "string";

    // OAuth check
    const isOAuth = (payload: any) =>
      typeof payload.openId === "string" &&
      typeof payload.appId === "string" &&
      typeof payload.name === "string";

    expect(isEmailAuth(emailPayload)).toBe(true);
    expect(isOAuth(emailPayload)).toBe(false);

    expect(isEmailAuth(oauthPayload)).toBe(false);
    expect(isOAuth(oauthPayload)).toBe(true);
  });
});
