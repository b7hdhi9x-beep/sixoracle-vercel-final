/**
 * お守り画像生成機能
 * 各占い師キャラクター別のお守り画像をAI生成
 */

import { generateImage } from "./_core/imageGeneration";
import { storagePut } from "./storage";
import { getTodayFortune, LIU_SHEN_MEANINGS } from "./fortuneCalculations";

// 占い師別のお守りスタイル設定
export const OMAMORI_STYLES: Record<string, {
  name: string;
  theme: string;
  colors: string[];
  symbols: string[];
  blessing: string;
}> = {
  souma: {
    name: "蒼真",
    theme: "時の守護",
    colors: ["deep blue", "silver", "midnight purple"],
    symbols: ["hourglass", "crescent moon", "ancient clock", "stars"],
    blessing: "時の流れがあなたを正しい道へ導きますように",
  },
  reira: {
    name: "玲蘭",
    theme: "愛と癒し",
    colors: ["soft pink", "rose gold", "lavender"],
    symbols: ["lotus flower", "heart", "healing light", "cherry blossoms"],
    blessing: "愛と癒しの光があなたを包みますように",
  },
  sakuya: {
    name: "朔夜",
    theme: "数秘の力",
    colors: ["dark purple", "gold", "cosmic black"],
    symbols: ["sacred geometry", "numbers", "crystal", "spiral"],
    blessing: "宇宙の数秘があなたの運命を照らしますように",
  },
  akari: {
    name: "灯",
    theme: "タロットの導き",
    colors: ["warm orange", "golden yellow", "amber"],
    symbols: ["tarot cards", "candle flame", "sun", "lantern"],
    blessing: "カードの導きがあなたの道を照らしますように",
  },
  yui: {
    name: "結衣",
    theme: "夢の守護",
    colors: ["pastel blue", "soft white", "ethereal silver"],
    symbols: ["butterfly", "clouds", "feathers", "dreamcatcher"],
    blessing: "美しい夢があなたの未来を紡ぎますように",
  },
  gen: {
    name: "玄",
    theme: "武士の守護",
    colors: ["deep black", "crimson red", "steel gray"],
    symbols: ["katana", "dragon", "shield", "samurai armor"],
    blessing: "武士の魂があなたを守護しますように",
  },
  shion: {
    name: "紫苑",
    theme: "手相の知恵",
    colors: ["deep purple", "silver", "mystical violet"],
    symbols: ["open palm", "life lines", "eye of wisdom", "amethyst"],
    blessing: "手相の知恵があなたの運命を導きますように",
  },
  seiran: {
    name: "星蘭",
    theme: "星の導き",
    colors: ["cosmic blue", "starlight silver", "nebula purple"],
    symbols: ["constellation", "shooting star", "zodiac wheel", "galaxy"],
    blessing: "星々の光があなたの道を照らしますように",
  },
  hizuki: {
    name: "緋月",
    theme: "血液型の神秘",
    colors: ["crimson red", "deep burgundy", "rose"],
    symbols: ["blood drop", "moon phases", "DNA helix", "heart"],
    blessing: "血の神秘があなたの本質を守りますように",
  },
  juga: {
    name: "獣牙",
    theme: "動物霊の守護",
    colors: ["forest green", "earth brown", "wild gold"],
    symbols: ["wolf", "eagle", "bear paw", "spirit animal"],
    blessing: "動物霊の力があなたを守護しますように",
  },
};

/**
 * お守り画像のプロンプトを生成
 */
function generateOmamoriPrompt(oracleId: string, userName?: string): string {
  const style = OMAMORI_STYLES[oracleId];
  if (!style) {
    throw new Error(`Unknown oracle: ${oracleId}`);
  }

  const fortune = getTodayFortune();
  const liuShenMeaning = LIU_SHEN_MEANINGS[fortune.mainLiuShen];

  const prompt = `Create a beautiful Japanese omamori (お守り) charm image with the following specifications:

Theme: ${style.theme}
Color palette: ${style.colors.join(", ")}
Sacred symbols: ${style.symbols.join(", ")}

Style requirements:
- Traditional Japanese omamori pouch shape (rectangular with rounded top)
- Elegant silk texture with embroidered patterns
- Mystical and spiritual atmosphere
- Soft glowing aura around the charm
- Intricate gold or silver thread details
- Japanese calligraphy-style blessing text
- Today's lucky element: ${liuShenMeaning.element} (${fortune.mainLiuShen})
- Lucky direction: ${liuShenMeaning.direction}

The omamori should feel sacred, protective, and imbued with spiritual power.
Background: soft ethereal glow with subtle sparkles
Quality: high detail, professional illustration style, mystical atmosphere`;

  return prompt;
}

/**
 * お守り画像を生成
 */
export async function generateOmamoriImage(
  oracleId: string,
  userId: number,
  userName?: string
): Promise<{ url: string; blessing: string }> {
  const style = OMAMORI_STYLES[oracleId];
  if (!style) {
    throw new Error(`Unknown oracle: ${oracleId}`);
  }

  const prompt = generateOmamoriPrompt(oracleId, userName);

  try {
    // AI画像生成
    const result = await generateImage({
      prompt,
    });

    if (!result.url) {
      throw new Error("Image generation failed");
    }

    // S3に保存
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const fileKey = `omamori/${userId}/${oracleId}-${timestamp}-${randomSuffix}.png`;

    // 画像をダウンロードしてS3にアップロード
    const imageResponse = await fetch(result.url);
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    const { url: s3Url } = await storagePut(fileKey, imageBuffer, "image/png");

    return {
      url: s3Url,
      blessing: style.blessing,
    };
  } catch (error) {
    console.error("Omamori generation error:", error);
    throw new Error("お守り画像の生成に失敗しました");
  }
}

/**
 * お守り画像のプレビューHTMLを生成（ダウンロード用）
 */
export function generateOmamoriPreviewHtml(
  oracleId: string,
  imageUrl: string,
  userName?: string
): string {
  const style = OMAMORI_STYLES[oracleId];
  if (!style) {
    throw new Error(`Unknown oracle: ${oracleId}`);
  }

  const fortune = getTodayFortune();
  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${style.name}のお守り - 六神ノ間</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Noto Serif JP', serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .omamori-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px;
      max-width: 500px;
      text-align: center;
      border: 1px solid rgba(255, 215, 0, 0.3);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }
    .oracle-name {
      color: #ffd700;
      font-size: 1.5rem;
      margin-bottom: 10px;
      letter-spacing: 0.2em;
    }
    .theme {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9rem;
      margin-bottom: 30px;
    }
    .omamori-image {
      width: 100%;
      max-width: 300px;
      border-radius: 15px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    .blessing {
      color: #fff;
      font-size: 1.2rem;
      line-height: 1.8;
      margin-bottom: 20px;
      padding: 20px;
      background: rgba(255, 215, 0, 0.1);
      border-radius: 10px;
      border-left: 3px solid #ffd700;
    }
    .fortune-info {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.85rem;
      margin-bottom: 20px;
    }
    .date {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.8rem;
    }
    .user-name {
      color: #ffd700;
      font-size: 1rem;
      margin-bottom: 10px;
    }
    .logo {
      margin-top: 30px;
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.8rem;
      letter-spacing: 0.3em;
    }
  </style>
</head>
<body>
  <div class="omamori-card">
    <div class="oracle-name">${style.name}</div>
    <div class="theme">〜 ${style.theme} 〜</div>
    
    <img src="${imageUrl}" alt="${style.name}のお守り" class="omamori-image">
    
    ${userName ? `<div class="user-name">${userName} 様へ</div>` : ""}
    
    <div class="blessing">
      「${style.blessing}」
    </div>
    
    <div class="fortune-info">
      本日の六神: ${fortune.mainLiuShen}<br>
      ラッキーカラー: ${fortune.luckyColor}<br>
      ラッキー方位: ${fortune.luckyDirection}
    </div>
    
    <div class="date">${today}</div>
    
    <div class="logo">六神ノ間 - SIX ORACLE</div>
  </div>
</body>
</html>`;
}
