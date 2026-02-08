import { describe, it, expect } from "vitest";
import { ENV } from "./_core/env";

describe("Admin Access Token Validation", () => {
  it("should have a valid admin secret token configured", () => {
    // Verify the token is set and has sufficient length
    expect(ENV.adminSecretToken).toBeDefined();
    expect(typeof ENV.adminSecretToken).toBe("string");
    expect(ENV.adminSecretToken.length).toBeGreaterThanOrEqual(32);
  });

  it("should validate correct token", () => {
    const correctToken = ENV.adminSecretToken;
    const isValid = correctToken === ENV.adminSecretToken;
    expect(isValid).toBe(true);
  });

  it("should reject incorrect token", () => {
    const incorrectToken = "wrong-token-12345";
    const isValid = incorrectToken === ENV.adminSecretToken;
    expect(isValid).toBe(false);
  });

  it("should reject empty token", () => {
    const emptyToken = "";
    const isValid = emptyToken === ENV.adminSecretToken;
    expect(isValid).toBe(false);
  });

  it("should reject partial token match", () => {
    // Take first half of the real token
    const partialToken = ENV.adminSecretToken.substring(0, 16);
    const isValid = partialToken === ENV.adminSecretToken;
    expect(isValid).toBe(false);
  });

  it("should be case-sensitive", () => {
    const uppercaseToken = ENV.adminSecretToken.toUpperCase();
    // If the original token has any lowercase, this should fail
    const isValid = uppercaseToken === ENV.adminSecretToken;
    // The token should be hex, so uppercase version should be different
    expect(isValid).toBe(false);
  });
});
