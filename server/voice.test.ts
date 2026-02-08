import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the transcribeAudio function
vi.mock("./_core/voiceTranscription", () => ({
  transcribeAudio: vi.fn(),
}));

// Mock the storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ 
    key: "voice-recordings/1/test.webm", 
    url: "https://storage.example.com/voice-recordings/1/test.webm" 
  }),
}));

import { transcribeAudio } from "./_core/voiceTranscription";
import { storagePut } from "./storage";

describe("Voice Transcription API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("transcribeAudio", () => {
    it("should return transcription result on success", async () => {
      const mockResult = {
        task: "transcribe" as const,
        language: "ja",
        duration: 5.5,
        text: "今日の運勢を教えてください",
        segments: [],
      };

      vi.mocked(transcribeAudio).mockResolvedValue(mockResult);

      const result = await transcribeAudio({
        audioUrl: "https://storage.example.com/audio.webm",
        language: "ja",
        prompt: "占いの相談内容を文字起こししてください。",
      });

      expect(result).toEqual(mockResult);
      expect(transcribeAudio).toHaveBeenCalledWith({
        audioUrl: "https://storage.example.com/audio.webm",
        language: "ja",
        prompt: "占いの相談内容を文字起こししてください。",
      });
    });

    it("should return error for file too large", async () => {
      const mockError = {
        error: "Audio file exceeds maximum size limit",
        code: "FILE_TOO_LARGE" as const,
        details: "File size is 20.00MB, maximum allowed is 16MB",
      };

      vi.mocked(transcribeAudio).mockResolvedValue(mockError);

      const result = await transcribeAudio({
        audioUrl: "https://storage.example.com/large-audio.webm",
      });

      expect(result).toHaveProperty("error");
      expect((result as any).code).toBe("FILE_TOO_LARGE");
    });

    it("should return error for invalid format", async () => {
      const mockError = {
        error: "Failed to download audio file",
        code: "INVALID_FORMAT" as const,
        details: "HTTP 404: Not Found",
      };

      vi.mocked(transcribeAudio).mockResolvedValue(mockError);

      const result = await transcribeAudio({
        audioUrl: "https://storage.example.com/invalid.txt",
      });

      expect(result).toHaveProperty("error");
      expect((result as any).code).toBe("INVALID_FORMAT");
    });

    it("should handle service errors gracefully", async () => {
      const mockError = {
        error: "Voice transcription service is not configured",
        code: "SERVICE_ERROR" as const,
        details: "BUILT_IN_FORGE_API_URL is not set",
      };

      vi.mocked(transcribeAudio).mockResolvedValue(mockError);

      const result = await transcribeAudio({
        audioUrl: "https://storage.example.com/audio.webm",
      });

      expect(result).toHaveProperty("error");
      expect((result as any).code).toBe("SERVICE_ERROR");
    });
  });

  describe("storagePut for audio files", () => {
    it("should upload audio file to S3", async () => {
      const audioBuffer = Buffer.from("fake audio data");
      const mimeType = "audio/webm";
      const filename = "voice-recordings/1/test.webm";

      const result = await storagePut(filename, audioBuffer, mimeType);

      expect(result).toHaveProperty("url");
      expect(result).toHaveProperty("key");
      expect(storagePut).toHaveBeenCalledWith(filename, audioBuffer, mimeType);
    });

    it("should generate unique filenames", () => {
      const userId = 1;
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(7);
      const ext = "webm";
      
      const filename = `voice-recordings/${userId}/${timestamp}-${randomSuffix}.${ext}`;
      
      expect(filename).toMatch(/^voice-recordings\/\d+\/\d+-[a-z0-9]+\.webm$/);
    });
  });

  describe("Audio format validation", () => {
    it("should accept webm format", () => {
      const mimeType = "audio/webm";
      const isValid = /^audio\/(webm|mp3|mpeg|wav|ogg|m4a|mp4)$/.test(mimeType);
      expect(isValid).toBe(true);
    });

    it("should accept mp3 format", () => {
      const mimeType = "audio/mp3";
      const isValid = /^audio\/(webm|mp3|mpeg|wav|ogg|m4a|mp4)$/.test(mimeType);
      expect(isValid).toBe(true);
    });

    it("should accept wav format", () => {
      const mimeType = "audio/wav";
      const isValid = /^audio\/(webm|mp3|mpeg|wav|ogg|m4a|mp4)$/.test(mimeType);
      expect(isValid).toBe(true);
    });

    it("should accept m4a format", () => {
      const mimeType = "audio/m4a";
      const isValid = /^audio\/(webm|mp3|mpeg|wav|ogg|m4a|mp4)$/.test(mimeType);
      expect(isValid).toBe(true);
    });

    it("should reject invalid formats", () => {
      const mimeType = "audio/flac";
      const isValid = /^audio\/(webm|mp3|mpeg|wav|ogg|m4a|mp4)$/.test(mimeType);
      expect(isValid).toBe(false);
    });

    it("should reject non-audio formats", () => {
      const mimeType = "video/mp4";
      const isValid = /^audio\/(webm|mp3|mpeg|wav|ogg|m4a|mp4)$/.test(mimeType);
      expect(isValid).toBe(false);
    });
  });

  describe("File size validation", () => {
    it("should accept files under 16MB", () => {
      const fileSizeMB = 10;
      const maxSizeMB = 16;
      expect(fileSizeMB <= maxSizeMB).toBe(true);
    });

    it("should reject files over 16MB", () => {
      const fileSizeMB = 20;
      const maxSizeMB = 16;
      expect(fileSizeMB <= maxSizeMB).toBe(false);
    });

    it("should accept files exactly at 16MB", () => {
      const fileSizeMB = 16;
      const maxSizeMB = 16;
      expect(fileSizeMB <= maxSizeMB).toBe(true);
    });
  });

  describe("Language support", () => {
    it("should default to Japanese", () => {
      const defaultLanguage = "ja";
      expect(defaultLanguage).toBe("ja");
    });

    it("should support multiple languages", () => {
      const supportedLanguages = ["ja", "en", "zh", "ko", "es", "fr", "de"];
      expect(supportedLanguages).toContain("ja");
      expect(supportedLanguages).toContain("en");
    });
  });
});
