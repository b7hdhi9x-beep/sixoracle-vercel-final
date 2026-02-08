/**
 * PDF鑑定書生成機能
 * 占い専用の「出力・演出」- ChatGPTとの差別化ポイント③
 * 
 * 鑑定結果を美しいPDF鑑定書としてダウンロードできる機能
 */

import { storagePut } from "./storage";
import { getTodayFortune, getDailyLiuShen, LIU_SHEN_MEANINGS } from "./fortuneCalculations";

/**
 * 鑑定書のデータ構造
 */
export interface ReadingCertificateData {
  userName: string;
  oracleId: string;
  oracleName: string;
  readingDate: Date;
  question: string;
  answer: string;
  luckyColor?: string;
  luckyNumber?: number;
  luckyDirection?: string;
  liuShen?: string;
  birthDate?: Date;
}

/**
 * 占い師の情報
 */
const ORACLE_INFO: Record<string, {
  name: string;
  englishName: string;
  title: string;
  specialty: string;
  color: string;
}> = {
  souma: {
    name: "蒼真",
    englishName: "Souma",
    title: "時の賢者",
    specialty: "時間占術・運命の流れ",
    color: "#1e3a5f",
  },
  reira: {
    name: "玲蘭",
    englishName: "Reira",
    title: "癒しの巫女",
    specialty: "恋愛・人間関係",
    color: "#5f1e3a",
  },
  sakuya: {
    name: "朔夜",
    englishName: "Sakuya",
    title: "数秘の使い手",
    specialty: "数秘術・運命数",
    color: "#3a1e5f",
  },
  akari: {
    name: "灯",
    englishName: "Akari",
    title: "タロットの導き手",
    specialty: "タロット・直感",
    color: "#5f3a1e",
  },
  yui: {
    name: "結衣",
    englishName: "Yui",
    title: "夢見の乙女",
    specialty: "夢占い・潜在意識",
    color: "#1e5f3a",
  },
  gen: {
    name: "玄",
    englishName: "Gen",
    title: "守護の武人",
    specialty: "厄除け・守護",
    color: "#2a2a2a",
  },
  shion: {
    name: "紫苑",
    englishName: "Shion",
    title: "手相の達人",
    specialty: "手相・運命線",
    color: "#5f1e5f",
  },
  seiran: {
    name: "星蘭",
    englishName: "Seiran",
    title: "星読みの姫",
    specialty: "西洋占星術・星座",
    color: "#1e5f5f",
  },
  hizuki: {
    name: "緋月",
    englishName: "Hizuki",
    title: "血液型の巫女",
    specialty: "血液型占い・相性",
    color: "#8b0000",
  },
  juga: {
    name: "獣牙",
    englishName: "Juga",
    title: "動物占いの使い手",
    specialty: "動物占い・本能",
    color: "#3a5f1e",
  },
};

/**
 * HTML形式の鑑定書を生成
 */
function generateCertificateHTML(data: ReadingCertificateData): string {
  const oracle = ORACLE_INFO[data.oracleId] || {
    name: data.oracleName,
    englishName: data.oracleId,
    title: "占い師",
    specialty: "総合占術",
    color: "#1e3a5f",
  };

  const fortune = getTodayFortune();
  const { mainLiuShen } = getDailyLiuShen(data.readingDate);
  const liuShenMeaning = LIU_SHEN_MEANINGS[mainLiuShen];

  const formattedDate = data.readingDate.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedBirthDate = data.birthDate
    ? data.birthDate.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "未設定";

  // 回答を段落に分割
  const answerParagraphs = data.answer
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>鑑定書 - 六神ノ間</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Noto Serif JP', serif;
      background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0a0a1a 100%);
      color: #e8e8e8;
      min-height: 100vh;
      padding: 40px;
    }
    
    .certificate {
      max-width: 800px;
      margin: 0 auto;
      background: linear-gradient(180deg, rgba(20, 20, 40, 0.95) 0%, rgba(10, 10, 25, 0.98) 100%);
      border: 2px solid ${oracle.color};
      border-radius: 20px;
      padding: 60px;
      position: relative;
      box-shadow: 0 0 60px rgba(${parseInt(oracle.color.slice(1, 3), 16)}, ${parseInt(oracle.color.slice(3, 5), 16)}, ${parseInt(oracle.color.slice(5, 7), 16)}, 0.3);
    }
    
    .certificate::before {
      content: '';
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      bottom: 10px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 15px;
      pointer-events: none;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .logo {
      font-size: 14px;
      letter-spacing: 8px;
      color: #888;
      margin-bottom: 10px;
    }
    
    .title {
      font-size: 36px;
      font-weight: 700;
      background: linear-gradient(135deg, #d4af37 0%, #f4e5b0 50%, #d4af37 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 20px;
    }
    
    .oracle-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      margin-top: 20px;
    }
    
    .oracle-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${oracle.color} 0%, ${oracle.color}88 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      border: 2px solid #d4af37;
    }
    
    .oracle-details {
      text-align: left;
    }
    
    .oracle-name {
      font-size: 24px;
      font-weight: 600;
      color: #d4af37;
    }
    
    .oracle-english {
      font-size: 12px;
      letter-spacing: 3px;
      color: #888;
    }
    
    .oracle-title {
      font-size: 14px;
      color: #aaa;
      margin-top: 5px;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 14px;
      letter-spacing: 3px;
      color: #d4af37;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(212, 175, 55, 0.3);
    }
    
    .client-info {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
    
    .info-item {
      background: rgba(255, 255, 255, 0.03);
      padding: 15px 20px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .info-label {
      font-size: 11px;
      color: #888;
      margin-bottom: 5px;
    }
    
    .info-value {
      font-size: 16px;
      color: #e8e8e8;
    }
    
    .question-box {
      background: rgba(255, 255, 255, 0.03);
      padding: 25px;
      border-radius: 10px;
      border-left: 3px solid ${oracle.color};
      font-style: italic;
      color: #ccc;
    }
    
    .reading-content {
      line-height: 2;
      font-size: 15px;
      color: #ddd;
    }
    
    .reading-content p {
      margin-bottom: 20px;
      text-indent: 1em;
    }
    
    .fortune-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-top: 20px;
    }
    
    .fortune-item {
      text-align: center;
      background: rgba(255, 255, 255, 0.03);
      padding: 20px 15px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .fortune-icon {
      font-size: 24px;
      margin-bottom: 10px;
    }
    
    .fortune-label {
      font-size: 11px;
      color: #888;
      margin-bottom: 5px;
    }
    
    .fortune-value {
      font-size: 14px;
      color: #d4af37;
      font-weight: 600;
    }
    
    .liu-shen-section {
      background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%);
      padding: 25px;
      border-radius: 10px;
      margin-top: 20px;
      border: 1px solid rgba(212, 175, 55, 0.2);
    }
    
    .liu-shen-title {
      font-size: 18px;
      color: #d4af37;
      margin-bottom: 10px;
    }
    
    .liu-shen-meaning {
      font-size: 14px;
      color: #ccc;
      line-height: 1.8;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 30px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      text-align: center;
    }
    
    .seal {
      width: 100px;
      height: 100px;
      margin: 0 auto 20px;
      border: 2px solid #d4af37;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: #d4af37;
      transform: rotate(-15deg);
    }
    
    .footer-text {
      font-size: 12px;
      color: #666;
      line-height: 1.8;
    }
    
    .disclaimer {
      margin-top: 20px;
      font-size: 10px;
      color: #555;
      text-align: center;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .certificate {
        box-shadow: none;
        border: 1px solid #ccc;
      }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header">
      <div class="logo">六 神 ノ 間</div>
      <h1 class="title">鑑 定 書</h1>
      <div class="oracle-info">
        <div class="oracle-avatar">☯</div>
        <div class="oracle-details">
          <div class="oracle-name">${oracle.name}</div>
          <div class="oracle-english">${oracle.englishName.toUpperCase()}</div>
          <div class="oracle-title">${oracle.title} ─ ${oracle.specialty}</div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">ご 依 頼 者 情 報</div>
      <div class="client-info">
        <div class="info-item">
          <div class="info-label">お名前</div>
          <div class="info-value">${data.userName || "匿名"} 様</div>
        </div>
        <div class="info-item">
          <div class="info-label">鑑定日</div>
          <div class="info-value">${formattedDate}</div>
        </div>
        <div class="info-item">
          <div class="info-label">生年月日</div>
          <div class="info-value">${formattedBirthDate}</div>
        </div>
        <div class="info-item">
          <div class="info-label">本日の六神</div>
          <div class="info-value">${mainLiuShen}</div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">ご 相 談 内 容</div>
      <div class="question-box">
        「${data.question}」
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">鑑 定 結 果</div>
      <div class="reading-content">
        ${answerParagraphs}
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">本 日 の 開 運 情 報</div>
      <div class="fortune-grid">
        <div class="fortune-item">
          <div class="fortune-icon">🎨</div>
          <div class="fortune-label">ラッキーカラー</div>
          <div class="fortune-value">${data.luckyColor || fortune.luckyColor}</div>
        </div>
        <div class="fortune-item">
          <div class="fortune-icon">🔢</div>
          <div class="fortune-label">ラッキーナンバー</div>
          <div class="fortune-value">${data.luckyNumber || fortune.luckyNumber}</div>
        </div>
        <div class="fortune-item">
          <div class="fortune-icon">🧭</div>
          <div class="fortune-label">ラッキー方位</div>
          <div class="fortune-value">${data.luckyDirection || liuShenMeaning.direction}</div>
        </div>
        <div class="fortune-item">
          <div class="fortune-icon">☯</div>
          <div class="fortune-label">五行</div>
          <div class="fortune-value">${liuShenMeaning.element}</div>
        </div>
      </div>
      
      <div class="liu-shen-section">
        <div class="liu-shen-title">本日の六神「${mainLiuShen}」について</div>
        <div class="liu-shen-meaning">
          ${liuShenMeaning.meaning}<br><br>
          <strong>運勢:</strong> ${liuShenMeaning.fortune}<br>
          <strong>アドバイス:</strong> ${liuShenMeaning.advice}
        </div>
      </div>
    </div>
    
    <div class="footer">
      <div class="seal">
        六神ノ間<br>認定
      </div>
      <div class="footer-text">
        この鑑定書は、六神ノ間の${oracle.name}による正式な鑑定結果です。<br>
        発行日: ${formattedDate}
      </div>
      <div class="disclaimer">
        ※ 本鑑定は娯楽目的であり、医療・法律・金融等の専門的助言に代わるものではありません。<br>
        重要な決定を行う際は、必ず専門家にご相談ください。
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * PDF鑑定書を生成してS3にアップロード
 */
export async function generateReadingCertificate(
  data: ReadingCertificateData
): Promise<{ url: string; key: string }> {
  const html = generateCertificateHTML(data);

  // HTMLをS3にアップロード（PDFの代わりにHTMLを使用）
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const fileKey = `certificates/${data.oracleId}-${timestamp}-${randomSuffix}.html`;

  const { url, key } = await storagePut(fileKey, Buffer.from(html, "utf-8"), "text/html");

  return { url, key };
}

/**
 * 鑑定書のプレビューHTMLを生成（ダウンロード前の確認用）
 */
export function generateCertificatePreview(data: ReadingCertificateData): string {
  return generateCertificateHTML(data);
}

export { ORACLE_INFO };


/**
 * グループMBTI相性診断結果のデータ構造
 */
export interface MBTIGroupResultData {
  groupName?: string;
  members: { name: string; type: string }[];
  groupScore: number;
  analysis: {
    strengths: string[];
    weaknesses: string[];
    tips: string[];
  };
  matrix: { member1: string; member2: string; score: number }[];
  createdAt: Date;
}

/**
 * スコアに応じた色を取得
 */
function getScoreColorHex(score: number): string {
  if (score >= 4.5) return '#ec4899'; // pink
  if (score >= 3.5) return '#22c55e'; // green
  if (score >= 2.5) return '#eab308'; // yellow
  if (score >= 1.5) return '#f97316'; // orange
  return '#ef4444'; // red
}

/**
 * スコアに応じたラベルを取得
 */
function getScoreLabelText(score: number): string {
  if (score >= 4.5) return '最高のチーム！';
  if (score >= 3.5) return '良いチーム';
  if (score >= 2.5) return '普通のチーム';
  if (score >= 1.5) return '努力が必要';
  return '挑戦的なチーム';
}

/**
 * グループMBTI相性診断結果のHTML生成
 */
function generateGroupResultHTML(data: MBTIGroupResultData): string {
  const formattedDate = data.createdAt.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const scoreColor = getScoreColorHex(data.groupScore);
  const scoreLabel = getScoreLabelText(data.groupScore);

  // メンバーリストのHTML
  const membersHTML = data.members
    .map(m => `<span class="member-badge">${m.name || m.type} (${m.type})</span>`)
    .join('');

  // 相性マトリックスのHTML
  const matrixHTML = data.matrix
    .map(m => {
      const pairScoreColor = getScoreColorHex(m.score);
      return `<div class="matrix-row">
        <span class="pair-names">${m.member1} × ${m.member2}</span>
        <span class="pair-score" style="color: ${pairScoreColor}">★ ${m.score.toFixed(1)}</span>
      </div>`;
    })
    .join('');

  // 強みのHTML
  const strengthsHTML = data.analysis.strengths
    .map(s => `<li><span class="icon">✓</span> ${s}</li>`)
    .join('');

  // 弱みのHTML
  const weaknessesHTML = data.analysis.weaknesses
    .map(w => `<li><span class="icon">!</span> ${w}</li>`)
    .join('');

  // アドバイスのHTML
  const tipsHTML = data.analysis.tips
    .map(t => `<li><span class="icon">→</span> ${t}</li>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>グループMBTI相性診断結果 - 六神ノ間</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Noto Sans JP', sans-serif;
      background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%);
      color: #e8e8e8;
      min-height: 100vh;
      padding: 40px 20px;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: linear-gradient(180deg, rgba(30, 30, 60, 0.95) 0%, rgba(15, 15, 35, 0.98) 100%);
      border: 2px solid #8b5cf6;
      border-radius: 24px;
      padding: 48px;
      box-shadow: 0 0 80px rgba(139, 92, 246, 0.3);
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .logo {
      font-size: 12px;
      letter-spacing: 4px;
      color: #a78bfa;
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    
    .title {
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(135deg, #c084fc, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
    }
    
    .group-name {
      font-size: 20px;
      color: #d1d5db;
      margin-bottom: 8px;
    }
    
    .date {
      font-size: 14px;
      color: #9ca3af;
    }
    
    .score-section {
      text-align: center;
      padding: 32px;
      margin-bottom: 32px;
      background: rgba(139, 92, 246, 0.1);
      border-radius: 16px;
      border: 1px solid rgba(139, 92, 246, 0.3);
    }
    
    .score-value {
      font-size: 64px;
      font-weight: 700;
      color: ${scoreColor};
      line-height: 1;
      margin-bottom: 8px;
    }
    
    .score-label {
      font-size: 18px;
      color: ${scoreColor};
      margin-bottom: 16px;
    }
    
    .members-list {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;
    }
    
    .member-badge {
      display: inline-block;
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      font-size: 13px;
      color: #d1d5db;
    }
    
    .section {
      margin-bottom: 28px;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #a78bfa;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .matrix-container {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      padding: 16px;
    }
    
    .matrix-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .matrix-row:last-child {
      border-bottom: none;
    }
    
    .pair-names {
      font-size: 14px;
      color: #d1d5db;
    }
    
    .pair-score {
      font-size: 14px;
      font-weight: 600;
    }
    
    .analysis-card {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
    }
    
    .analysis-card.strengths {
      border-left: 4px solid #22c55e;
    }
    
    .analysis-card.weaknesses {
      border-left: 4px solid #f97316;
    }
    
    .analysis-card.tips {
      border-left: 4px solid #3b82f6;
    }
    
    .analysis-card h3 {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    
    .analysis-card.strengths h3 { color: #22c55e; }
    .analysis-card.weaknesses h3 { color: #f97316; }
    .analysis-card.tips h3 { color: #3b82f6; }
    
    .analysis-card ul {
      list-style: none;
    }
    
    .analysis-card li {
      font-size: 14px;
      color: #d1d5db;
      padding: 6px 0;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    
    .analysis-card li .icon {
      flex-shrink: 0;
      width: 18px;
      text-align: center;
    }
    
    .analysis-card.strengths li .icon { color: #22c55e; }
    .analysis-card.weaknesses li .icon { color: #f97316; }
    .analysis-card.tips li .icon { color: #3b82f6; }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .footer-logo {
      font-size: 20px;
      font-weight: 700;
      background: linear-gradient(135deg, #c084fc, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
    }
    
    .footer-text {
      font-size: 12px;
      color: #6b7280;
    }
    
    .disclaimer {
      font-size: 11px;
      color: #4b5563;
      margin-top: 16px;
      line-height: 1.6;
    }
    
    @media print {
      body {
        background: #0f0f23;
        padding: 0;
      }
      .container {
        box-shadow: none;
        border: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Six Oracle - 六神ノ間</div>
      <h1 class="title">グループMBTI相性診断結果</h1>
      ${data.groupName ? `<div class="group-name">${data.groupName}</div>` : ''}
      <div class="date">${formattedDate}</div>
    </div>
    
    <div class="score-section">
      <div class="score-value">${data.groupScore.toFixed(1)}</div>
      <div class="score-label">${scoreLabel}</div>
      <div class="members-list">
        ${membersHTML}
      </div>
    </div>
    
    <div class="section">
      <h2 class="section-title">👥 メンバー間の相性</h2>
      <div class="matrix-container">
        ${matrixHTML}
      </div>
    </div>
    
    <div class="section">
      <div class="analysis-card strengths">
        <h3>✨ グループの強み</h3>
        <ul>${strengthsHTML}</ul>
      </div>
      
      ${data.analysis.weaknesses.length > 0 ? `
      <div class="analysis-card weaknesses">
        <h3>⚠️ 注意すべき点</h3>
        <ul>${weaknessesHTML}</ul>
      </div>
      ` : ''}
      
      <div class="analysis-card tips">
        <h3>💡 チームワーク改善のヒント</h3>
        <ul>${tipsHTML}</ul>
      </div>
    </div>
    
    <div class="footer">
      <div class="footer-logo">六神ノ間</div>
      <div class="footer-text">心理 - MBTI性格診断の専門家</div>
      <div class="disclaimer">
        ※ 本診断は娯楽目的であり、心理学的な正式診断に代わるものではありません。<br>
        MBTIは自己理解と他者理解を深めるためのツールとしてご活用ください。
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * グループMBTI相性診断結果のHTMLを生成してS3にアップロード
 */
export async function generateGroupResultCertificate(
  data: MBTIGroupResultData
): Promise<{ url: string; key: string }> {
  const html = generateGroupResultHTML(data);

  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const fileKey = `mbti-group/${timestamp}-${randomSuffix}.html`;

  const { url, key } = await storagePut(fileKey, Buffer.from(html, "utf-8"), "text/html");

  return { url, key };
}

/**
 * グループMBTI相性診断結果のプレビューHTMLを生成
 */
export function generateGroupResultPreview(data: MBTIGroupResultData): string {
  return generateGroupResultHTML(data);
}
