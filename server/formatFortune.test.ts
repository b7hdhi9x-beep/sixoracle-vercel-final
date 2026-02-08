import { describe, it, expect } from 'vitest';

/**
 * 鑑定結果のセクションヘッダー（═══ 総合運 ═══ など）をMarkdownの見出しに変換
 * モバイルで読みやすいセクション分け表示を実現
 */
function formatFortuneContent(content: string): string {
  // ═══ セクション名 ═══ パターンを検出してMarkdownの見出しに変換
  return content.replace(/═{3,}\s*([^═]+?)\s*═{3,}/g, (_, sectionName) => {
    const trimmedName = sectionName.trim();
    return `\n\n## ${trimmedName}\n\n`;
  });
}

describe('formatFortuneContent', () => {
  it('should convert section headers with ═══ pattern to markdown h2', () => {
    const input = '═══ 総合運 ═══\nあなたの運勢は...';
    const result = formatFortuneContent(input);
    // セクションヘッダーがMarkdownの見出しに変換されていることを確認
    expect(result).toContain('## 総合運');
    expect(result).toContain('あなたの運勢は...');
  });

  it('should handle multiple sections', () => {
    const input = `═══ 総合運 ═══
今日の運勢は良好です。

═══ 恋愛運 ═══
恋愛面では...

═══ 仕事運 ═══
仕事面では...`;

    const result = formatFortuneContent(input);
    
    expect(result).toContain('## 総合運');
    expect(result).toContain('## 恋愛運');
    expect(result).toContain('## 仕事運');
  });

  it('should preserve content without section headers', () => {
    const input = 'これは普通のテキストです。セクションヘッダーはありません。';
    expect(formatFortuneContent(input)).toBe(input);
  });

  it('should handle section headers with extra spaces', () => {
    const input = '═══   総合運   ═══\n内容';
    const result = formatFortuneContent(input);
    expect(result).toContain('## 総合運');
  });

  it('should handle various section names', () => {
    const sections = [
      '═══ 金運 ═══',
      '═══ 健康運 ═══',
      '═══ ラッキーアイテム ═══',
      '═══ あなたへのメッセージ ═══',
    ];

    for (const section of sections) {
      const result = formatFortuneContent(section);
      expect(result).toMatch(/## .+/);
    }
  });

  it('should handle content with mixed regular text and sections', () => {
    const input = `こんにちは。今日の鑑定結果をお伝えします。

═══ 総合運 ═══
全体的に良い運勢です。

普通のテキストがここにあります。

═══ 恋愛運 ═══
恋愛面も順調です。`;

    const result = formatFortuneContent(input);
    
    expect(result).toContain('こんにちは。今日の鑑定結果をお伝えします。');
    expect(result).toContain('## 総合運');
    expect(result).toContain('普通のテキストがここにあります。');
    expect(result).toContain('## 恋愛運');
  });

  it('should handle empty content', () => {
    expect(formatFortuneContent('')).toBe('');
  });

  it('should not convert incomplete section patterns', () => {
    const input = '═══ 総合運\nこれは不完全なパターン';
    expect(formatFortuneContent(input)).toBe(input);
  });
});
