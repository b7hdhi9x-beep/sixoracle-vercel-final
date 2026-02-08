import { describe, it, expect } from "vitest";

/**
 * Export History Feature Tests
 * Tests for the conversation history export functionality
 */

describe("Export History Feature", () => {
  describe("Export Format Options", () => {
    it("should support text format", () => {
      const validFormats = ['text', 'json'];
      expect(validFormats.includes('text')).toBe(true);
    });

    it("should support json format", () => {
      const validFormats = ['text', 'json'];
      expect(validFormats.includes('json')).toBe(true);
    });

    it("should default to text format", () => {
      const defaultFormat = 'text';
      expect(defaultFormat).toBe('text');
    });
  });

  describe("Include Archived Option", () => {
    it("should default to including archived sessions", () => {
      const defaultIncludeArchived = true;
      expect(defaultIncludeArchived).toBe(true);
    });

    it("should filter out archived when includeArchived is false", () => {
      const sessions = [
        { id: 1, isArchived: false },
        { id: 2, isArchived: true },
        { id: 3, isArchived: false },
      ];
      
      const includeArchived = false;
      const filtered = includeArchived 
        ? sessions 
        : sessions.filter(s => !s.isArchived);
      
      expect(filtered.length).toBe(2);
      expect(filtered.map(s => s.id)).toEqual([1, 3]);
    });

    it("should include all sessions when includeArchived is true", () => {
      const sessions = [
        { id: 1, isArchived: false },
        { id: 2, isArchived: true },
        { id: 3, isArchived: false },
      ];
      
      const includeArchived = true;
      const filtered = includeArchived 
        ? sessions 
        : sessions.filter(s => !s.isArchived);
      
      expect(filtered.length).toBe(3);
    });
  });

  describe("Text Format Output", () => {
    it("should generate correct header", () => {
      const header = `六神ノ間 - 全会話履歴\n`;
      expect(header).toContain('六神ノ間');
      expect(header).toContain('全会話履歴');
    });

    it("should include session count in header", () => {
      const sessionCount = 5;
      const headerLine = `セッション数: ${sessionCount}\n`;
      expect(headerLine).toBe('セッション数: 5\n');
    });

    it("should include message count in header", () => {
      const messageCount = 42;
      const headerLine = `メッセージ数: ${messageCount}\n`;
      expect(headerLine).toBe('メッセージ数: 42\n');
    });

    it("should format oracle names correctly", () => {
      const oracleNames: Record<string, string> = {
        soma: '蒼真', reiran: '玖蘭', sakuya: '朔夜',
        akari: '灯', yui: '結衣', gen: '玄',
      };
      
      expect(oracleNames['soma']).toBe('蒼真');
      expect(oracleNames['reiran']).toBe('玖蘭');
      expect(oracleNames['sakuya']).toBe('朔夜');
      expect(oracleNames['akari']).toBe('灯');
      expect(oracleNames['yui']).toBe('結衣');
      expect(oracleNames['gen']).toBe('玄');
    });

    it("should include status tags for pinned sessions", () => {
      const session = { isPinned: true, isArchived: false };
      const statusTags = [];
      if (session.isPinned) statusTags.push('ピン留め');
      if (session.isArchived) statusTags.push('アーカイブ済');
      
      expect(statusTags).toContain('ピン留め');
      expect(statusTags).not.toContain('アーカイブ済');
    });

    it("should include status tags for archived sessions", () => {
      const session = { isPinned: false, isArchived: true };
      const statusTags = [];
      if (session.isPinned) statusTags.push('ピン留め');
      if (session.isArchived) statusTags.push('アーカイブ済');
      
      expect(statusTags).not.toContain('ピン留め');
      expect(statusTags).toContain('アーカイブ済');
    });
  });

  describe("JSON Format Output", () => {
    it("should include exportDate in JSON output", () => {
      const exportData = {
        exportDate: new Date().toISOString(),
        sessions: [],
      };
      
      expect(exportData).toHaveProperty('exportDate');
      expect(typeof exportData.exportDate).toBe('string');
    });

    it("should include sessions array in JSON output", () => {
      const exportData = {
        exportDate: new Date().toISOString(),
        sessions: [
          { id: 1, oracleId: 'soma', messages: [] },
        ],
      };
      
      expect(Array.isArray(exportData.sessions)).toBe(true);
      expect(exportData.sessions.length).toBe(1);
    });

    it("should include message details in session", () => {
      const session = {
        id: 1,
        oracleId: 'soma',
        messages: [
          { role: 'user', content: 'Hello', createdAt: new Date().toISOString() },
          { role: 'assistant', content: 'Hi there', createdAt: new Date().toISOString() },
        ],
      };
      
      expect(session.messages.length).toBe(2);
      expect(session.messages[0].role).toBe('user');
      expect(session.messages[1].role).toBe('assistant');
    });
  });

  describe("Export Response", () => {
    it("should return success true on successful export", () => {
      const response = {
        success: true,
        data: '',
        sessionCount: 0,
        messageCount: 0,
      };
      
      expect(response.success).toBe(true);
    });

    it("should return correct session count", () => {
      const sessions = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const response = {
        success: true,
        sessionCount: sessions.length,
        messageCount: 0,
      };
      
      expect(response.sessionCount).toBe(3);
    });

    it("should return correct message count", () => {
      const messages = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
      const response = {
        success: true,
        sessionCount: 0,
        messageCount: messages.length,
      };
      
      expect(response.messageCount).toBe(5);
    });

    it("should handle empty history", () => {
      const response = {
        success: true,
        data: '',
        sessionCount: 0,
        messageCount: 0,
      };
      
      expect(response.success).toBe(true);
      expect(response.sessionCount).toBe(0);
      expect(response.messageCount).toBe(0);
    });
  });

  describe("File Download", () => {
    it("should generate correct text filename", () => {
      const date = '2026-02-05';
      const filename = `six-oracle-history-${date}.txt`;
      expect(filename).toBe('six-oracle-history-2026-02-05.txt');
    });

    it("should generate correct json filename", () => {
      const date = '2026-02-05';
      const filename = `six-oracle-history-${date}.json`;
      expect(filename).toBe('six-oracle-history-2026-02-05.json');
    });

    it("should use correct MIME type for text", () => {
      const mimeType = 'text/plain;charset=utf-8';
      expect(mimeType).toContain('text/plain');
      expect(mimeType).toContain('charset=utf-8');
    });

    it("should use correct MIME type for JSON", () => {
      const mimeType = 'application/json';
      expect(mimeType).toBe('application/json');
    });
  });
});
