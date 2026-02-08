import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseUserAgent, getClientIp } from "./loginHistory";
import type { Request } from "express";

describe("loginHistory", () => {
  describe("parseUserAgent", () => {
    it("should detect Chrome on Windows desktop", () => {
      const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
      const result = parseUserAgent(ua);
      
      expect(result.browser).toBe("Chrome");
      expect(result.os).toBe("Windows 10/11");
      expect(result.deviceType).toBe("desktop");
    });

    it("should detect Safari on iOS mobile", () => {
      const ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
      const result = parseUserAgent(ua);
      
      expect(result.browser).toBe("Safari");
      expect(result.os).toBe("iOS");
      expect(result.deviceType).toBe("mobile");
    });

    it("should detect Chrome on Android mobile", () => {
      const ua = "Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
      const result = parseUserAgent(ua);
      
      expect(result.browser).toBe("Chrome");
      expect(result.os).toBe("Android");
      expect(result.deviceType).toBe("mobile");
    });

    it("should detect Safari on macOS desktop", () => {
      const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
      const result = parseUserAgent(ua);
      
      expect(result.browser).toBe("Safari");
      expect(result.os).toBe("macOS");
      expect(result.deviceType).toBe("desktop");
    });

    it("should detect Firefox on Linux desktop", () => {
      const ua = "Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0";
      const result = parseUserAgent(ua);
      
      expect(result.browser).toBe("Firefox");
      expect(result.os).toBe("Linux");
      expect(result.deviceType).toBe("desktop");
    });

    it("should detect Edge on Windows desktop", () => {
      const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0";
      const result = parseUserAgent(ua);
      
      expect(result.browser).toBe("Microsoft Edge");
      expect(result.os).toBe("Windows 10/11");
      expect(result.deviceType).toBe("desktop");
    });

    it("should detect tablet devices", () => {
      const ua = "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
      const result = parseUserAgent(ua);
      
      expect(result.deviceType).toBe("tablet");
      expect(result.os).toBe("iOS");
    });

    it("should handle undefined user agent", () => {
      const result = parseUserAgent(undefined);
      
      expect(result.browser).toBe("unknown");
      expect(result.os).toBe("unknown");
      expect(result.deviceType).toBe("unknown");
    });

    it("should handle empty user agent", () => {
      const result = parseUserAgent("");
      
      expect(result.browser).toBe("unknown");
      expect(result.os).toBe("unknown");
      expect(result.deviceType).toBe("unknown"); // Unknown for empty string
    });
  });

  describe("getClientIp", () => {
    it("should extract IP from x-forwarded-for header", () => {
      const mockReq = {
        headers: {
          "x-forwarded-for": "203.0.113.195, 70.41.3.18, 150.172.238.178",
        },
        socket: { remoteAddress: "127.0.0.1" },
        ip: "127.0.0.1",
      } as unknown as Request;

      const ip = getClientIp(mockReq);
      expect(ip).toBe("203.0.113.195");
    });

    it("should extract IP from x-real-ip header", () => {
      const mockReq = {
        headers: {
          "x-real-ip": "203.0.113.195",
        },
        socket: { remoteAddress: "127.0.0.1" },
        ip: "127.0.0.1",
      } as unknown as Request;

      const ip = getClientIp(mockReq);
      expect(ip).toBe("203.0.113.195");
    });

    it("should fallback to socket remoteAddress", () => {
      const mockReq = {
        headers: {},
        socket: { remoteAddress: "192.168.1.100" },
        ip: "127.0.0.1",
      } as unknown as Request;

      const ip = getClientIp(mockReq);
      expect(ip).toBe("192.168.1.100");
    });

    it("should fallback to req.ip", () => {
      const mockReq = {
        headers: {},
        socket: {},
        ip: "10.0.0.1",
      } as unknown as Request;

      const ip = getClientIp(mockReq);
      expect(ip).toBe("10.0.0.1");
    });

    it("should return unknown if no IP available", () => {
      const mockReq = {
        headers: {},
        socket: {},
      } as unknown as Request;

      const ip = getClientIp(mockReq);
      expect(ip).toBe("unknown");
    });
  });
});
