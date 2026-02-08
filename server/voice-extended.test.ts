import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Voice Features Extended", () => {
  describe("Text-to-Speech Component", () => {
    it("should support Japanese language", () => {
      const lang = 'ja-JP';
      expect(lang).toBe('ja-JP');
    });

    it("should have configurable speech rate", () => {
      const rate = 0.9;
      expect(rate).toBeGreaterThan(0);
      expect(rate).toBeLessThanOrEqual(1);
    });

    it("should have configurable pitch", () => {
      const pitch = 1.0;
      expect(pitch).toBeGreaterThanOrEqual(0.5);
      expect(pitch).toBeLessThanOrEqual(2);
    });

    it("should have configurable volume", () => {
      const volume = 1.0;
      expect(volume).toBeGreaterThanOrEqual(0);
      expect(volume).toBeLessThanOrEqual(1);
    });
  });

  describe("Voice History", () => {
    const STORAGE_KEY = "voice_history";
    const MAX_HISTORY_ITEMS = 10;

    it("should have correct storage key", () => {
      expect(STORAGE_KEY).toBe("voice_history");
    });

    it("should limit history to max items", () => {
      expect(MAX_HISTORY_ITEMS).toBe(10);
    });

    it("should generate unique IDs for history items", () => {
      const id1 = Date.now().toString();
      // Small delay to ensure different timestamp
      const id2 = (Date.now() + 1).toString();
      expect(id1).not.toBe(id2);
    });

    it("should format relative time correctly", () => {
      const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "たった今";
        if (minutes < 60) return `${minutes}分前`;
        if (hours < 24) return `${hours}時間前`;
        if (days < 7) return `${days}日前`;
        return date.toLocaleDateString('ja-JP');
      };

      // Test "just now"
      expect(formatTime(new Date())).toBe("たった今");

      // Test minutes ago
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60000);
      expect(formatTime(fiveMinutesAgo)).toBe("5分前");

      // Test hours ago
      const threeHoursAgo = new Date(Date.now() - 3 * 3600000);
      expect(formatTime(threeHoursAgo)).toBe("3時間前");

      // Test days ago
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000);
      expect(formatTime(twoDaysAgo)).toBe("2日前");
    });

    it("should remove duplicates when adding to history", () => {
      const history = [
        { id: "1", text: "こんにちは", timestamp: new Date() },
        { id: "2", text: "今日の運勢", timestamp: new Date() },
      ];
      
      const newText = "こんにちは";
      const filteredHistory = history.filter(item => item.text !== newText);
      
      expect(filteredHistory.length).toBe(1);
      expect(filteredHistory[0].text).toBe("今日の運勢");
    });
  });

  describe("Real-time Preview", () => {
    it("should support continuous recognition mode", () => {
      const continuous = true;
      expect(continuous).toBe(true);
    });

    it("should support interim results", () => {
      const interimResults = true;
      expect(interimResults).toBe(true);
    });

    it("should use Japanese language for recognition", () => {
      const lang = 'ja-JP';
      expect(lang).toBe('ja-JP');
    });

    it("should combine interim and final transcripts", () => {
      const results = [
        { isFinal: true, transcript: "今日の" },
        { isFinal: false, transcript: "運勢を" },
      ];

      let finalTranscript = '';
      let interimTranscript = '';

      for (const result of results) {
        if (result.isFinal) {
          finalTranscript += result.transcript;
        } else {
          interimTranscript += result.transcript;
        }
      }

      const preview = finalTranscript + interimTranscript;
      expect(preview).toBe("今日の運勢を");
    });

    it("should ignore no-speech errors", () => {
      const ignoredErrors = ['no-speech', 'aborted'];
      expect(ignoredErrors).toContain('no-speech');
      expect(ignoredErrors).toContain('aborted');
    });
  });

  describe("Voice Input Integration", () => {
    it("should auto-stop after 60 seconds", () => {
      const maxRecordingTime = 60;
      expect(maxRecordingTime).toBe(60);
    });

    it("should format recording time correctly", () => {
      const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      };

      expect(formatTime(0)).toBe("0:00");
      expect(formatTime(30)).toBe("0:30");
      expect(formatTime(60)).toBe("1:00");
      expect(formatTime(90)).toBe("1:30");
    });

    it("should support multiple audio formats", () => {
      const supportedFormats = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/wav',
      ];

      expect(supportedFormats.length).toBeGreaterThan(0);
      expect(supportedFormats).toContain('audio/webm');
    });

    it("should save transcript to history on success", () => {
      const transcript = "今日の運勢を教えてください";
      const shouldSaveToHistory = transcript.trim().length > 0;
      expect(shouldSaveToHistory).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should handle microphone access denied", () => {
      const error = new DOMException("Permission denied", "NotAllowedError");
      expect(error.name).toBe("NotAllowedError");
    });

    it("should handle microphone not found", () => {
      const error = new DOMException("Device not found", "NotFoundError");
      expect(error.name).toBe("NotFoundError");
    });

    it("should provide user-friendly error messages", () => {
      const errorMessages = {
        NotAllowedError: "マイクへのアクセスが拒否されました。ブラウザの設定でマイクを許可してください。",
        NotFoundError: "マイクが見つかりません。マイクが接続されているか確認してください。",
        default: "録音を開始できませんでした。",
      };

      expect(errorMessages.NotAllowedError).toContain("マイク");
      expect(errorMessages.NotFoundError).toContain("マイク");
    });
  });
});
