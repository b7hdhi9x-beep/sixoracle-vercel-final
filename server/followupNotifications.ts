/**
 * フォローアップ通知機能
 * 「連続性」と「記憶」の演出 - ChatGPTとの差別化ポイント②
 * 
 * 鑑定履歴に基づき、数日後に「あの時の悩みはどうなりましたか？」と
 * AI側から声をかける機能
 */

import { getDb } from "./db";
import { chatSessions, chatMessages, users, notifications } from "../drizzle/schema";
import { eq, and, gte, lt, desc, sql } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { getTodayFortune, getDailyLiuShen, LIU_SHEN_MEANINGS } from "./fortuneCalculations";

/**
 * フォローアップ通知のタイプ
 */
type FollowupType = 
  | "consultation_followup"  // 相談のフォローアップ
  | "monthly_fortune"        // 月ごとの六神パーソナライズ通知
  | "daily_fortune"          // 毎日の運勢通知
  | "oracle_message";        // 占い師からのメッセージ

/**
 * 相談内容を要約してフォローアップメッセージを生成
 */
async function generateFollowupMessage(
  sessionSummary: string,
  oracleId: string,
  daysAgo: number
): Promise<string> {
  const oracleNames: Record<string, string> = {
    souma: "蒼真",
    reira: "玲蘭",
    sakuya: "朔夜",
    akari: "灯",
    yui: "結衣",
    gen: "玄",
    shion: "紫苑",
    seiran: "星蘭",
    hizuki: "緋月",
    juga: "獣牙",
  };

  const oracleName = oracleNames[oracleId] || "占い師";

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `あなたは「${oracleName}」という占い師です。
${daysAgo}日前に相談を受けた方へのフォローアップメッセージを作成してください。

【ルール】
- 温かく、思いやりのある言葉で
- 相談内容を踏まえて、その後の様子を尋ねる
- 100文字以内で簡潔に
- 「私は○○です」という自己紹介は不要
- 押し付けがましくならないように

【相談内容の要約】
${sessionSummary}`,
      },
      {
        role: "user",
        content: "フォローアップメッセージを作成してください。",
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  return typeof content === "string" 
    ? content 
    : `${oracleName}より：先日の鑑定はいかがでしたか？その後、何か変化はありましたか？`;
}

/**
 * 月ごとの六神パーソナライズ通知を生成
 */
export async function generateMonthlyFortuneMessage(userId: number): Promise<{
  title: string;
  message: string;
  liuShen: string;
}> {
  const fortune = getTodayFortune();
  const { mainLiuShen } = getDailyLiuShen(new Date());
  const liuShenMeaning = LIU_SHEN_MEANINGS[mainLiuShen];

  const db = await getDb();
  if (!db) {
    return {
      title: `今月の六神: ${mainLiuShen}`,
      message: liuShenMeaning.fortune,
      liuShen: mainLiuShen,
    };
  }

  // ユーザーの過去の相談傾向を取得
  const recentSessions = await db
    .select({
      oracleId: chatSessions.oracleId,
      title: chatSessions.title,
    })
    .from(chatSessions)
    .where(eq(chatSessions.userId, userId))
    .orderBy(desc(chatSessions.createdAt))
    .limit(5);

  const consultationTopics = recentSessions.map(s => s.title).join(", ");

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `あなたは六神ノ間の占い師です。
今月の六神「${mainLiuShen}」に基づいて、パーソナライズされた月間運勢メッセージを作成してください。

【今月の六神情報】
- 六神: ${mainLiuShen}
- 意味: ${liuShenMeaning.meaning}
- 五行: ${liuShenMeaning.element}
- 方位: ${liuShenMeaning.direction}
- 運勢: ${liuShenMeaning.fortune}
- アドバイス: ${liuShenMeaning.advice}

【ユーザーの最近の相談傾向】
${consultationTopics || "まだ相談履歴がありません"}

【ルール】
- 150文字以内で簡潔に
- 六神の特徴を活かした具体的なアドバイス
- 温かく励ましのある言葉で
- 「今月は○○の月です」という形式で始める`,
      },
      {
        role: "user",
        content: "今月の運勢メッセージを作成してください。",
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  const message = typeof content === "string" 
    ? content 
    : `今月は${mainLiuShen}の月です。${liuShenMeaning.fortune}`;

  return {
    title: `🌙 今月の六神: ${mainLiuShen}`,
    message,
    liuShen: mainLiuShen,
  };
}

/**
 * 相談から3日後のフォローアップ通知を送信
 */
export async function sendConsultationFollowups(): Promise<{
  success: boolean;
  count: number;
}> {
  const db = await getDb();
  if (!db) return { success: false, count: 0 };

  // 3日前の相談セッションを取得
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const fourDaysAgo = new Date();
  fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

  const sessionsToFollowUp = await db
    .select({
      sessionId: chatSessions.id,
      userId: chatSessions.userId,
      oracleId: chatSessions.oracleId,
      title: chatSessions.title,
    })
    .from(chatSessions)
    .where(
      and(
        gte(chatSessions.createdAt, fourDaysAgo),
        lt(chatSessions.createdAt, threeDaysAgo)
      )
    );

  if (sessionsToFollowUp.length === 0) {
    return { success: true, count: 0 };
  }

  let sentCount = 0;

  for (const session of sessionsToFollowUp) {
    try {
      // 既にフォローアップ通知を送信済みかチェック
      const existingNotification = await db
        .select({ id: notifications.id })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, session.userId),
            eq(notifications.type, "consultation_followup"),
            sql`JSON_EXTRACT(${notifications.metadata}, '$.sessionId') = ${session.sessionId}`
          )
        )
        .limit(1);

      if (existingNotification.length > 0) {
        continue; // 既に送信済み
      }

      // セッションの最初のメッセージを取得して要約
      const firstMessage = await db
        .select({ content: chatMessages.content })
        .from(chatMessages)
        .where(
          and(
            eq(chatMessages.sessionId, session.sessionId),
            eq(chatMessages.role, "user")
          )
        )
        .orderBy(chatMessages.createdAt)
        .limit(1);

      const sessionSummary = firstMessage[0]?.content || session.title || "相談内容";

      // フォローアップメッセージを生成
      const followupMessage = await generateFollowupMessage(
        sessionSummary,
        session.oracleId,
        3
      );

      const oracleNames: Record<string, string> = {
        souma: "蒼真",
        reira: "玲蘭",
        sakuya: "朔夜",
        akari: "灯",
        yui: "結衣",
        gen: "玄",
        shion: "紫苑",
        seiran: "星蘭",
        hizuki: "緋月",
        juga: "獣牙",
      };

      // 通知を作成
      await db.insert(notifications).values({
        userId: session.userId,
        type: "consultation_followup",
        title: `💫 ${oracleNames[session.oracleId] || "占い師"}からのメッセージ`,
        message: followupMessage,
        link: `/chat/${session.oracleId}?session=${session.sessionId}`,
        isRead: false,
        metadata: JSON.stringify({
          sessionId: session.sessionId,
          oracleId: session.oracleId,
        }),
      });

      sentCount++;
    } catch (error) {
      console.error(`[Followup] Error sending followup for session ${session.sessionId}:`, error);
    }
  }

  // オーナーに通知
  if (sentCount > 0) {
    await notifyOwner({
      title: "📬 フォローアップ通知送信完了",
      content: `${sentCount}件のフォローアップ通知を送信しました。`,
    });
  }

  console.log(`[Followup] Sent ${sentCount} consultation followup notifications`);

  return { success: true, count: sentCount };
}

/**
 * 月初めの六神パーソナライズ通知を全ユーザーに送信
 */
export async function sendMonthlyFortuneNotifications(): Promise<{
  success: boolean;
  count: number;
}> {
  const db = await getDb();
  if (!db) return { success: false, count: 0 };

  // 全ユーザーを取得
  const allUsers = await db
    .select({ id: users.id, name: users.name })
    .from(users);

  if (allUsers.length === 0) {
    return { success: true, count: 0 };
  }

  let sentCount = 0;

  for (const user of allUsers) {
    try {
      const { title, message, liuShen } = await generateMonthlyFortuneMessage(user.id);

      await db.insert(notifications).values({
        userId: user.id,
        type: "monthly_fortune",
        title,
        message,
        link: "/dashboard",
        isRead: false,
        metadata: JSON.stringify({
          liuShen,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        }),
      });

      sentCount++;
    } catch (error) {
      console.error(`[Followup] Error sending monthly fortune for user ${user.id}:`, error);
    }
  }

  // オーナーに通知
  if (sentCount > 0) {
    await notifyOwner({
      title: "🌙 月間運勢通知送信完了",
      content: `${sentCount}人のユーザーに月間運勢通知を送信しました。`,
    });
  }

  console.log(`[Followup] Sent ${sentCount} monthly fortune notifications`);

  return { success: true, count: sentCount };
}

/**
 * 毎日の運勢通知を送信（オプトインユーザーのみ）
 */
export async function sendDailyFortuneNotifications(): Promise<{
  success: boolean;
  count: number;
}> {
  const db = await getDb();
  if (!db) return { success: false, count: 0 };

  // emailPreferencesでdailyFortuneがtrueのユーザーを取得
  const { emailPreferences } = await import("../drizzle/schema");
  
  const optedInUsers = await db
    .select({ userId: emailPreferences.userId })
    .from(emailPreferences)
    .where(eq(emailPreferences.dailyFortune, true));

  if (optedInUsers.length === 0) {
    return { success: true, count: 0 };
  }

  const fortune = getTodayFortune();
  const { mainLiuShen } = getDailyLiuShen(new Date());
  const liuShenMeaning = LIU_SHEN_MEANINGS[mainLiuShen];

  const title = `🌅 今日の運勢（${fortune.date}）`;
  const message = `今日の六神は「${mainLiuShen}」です。\n${liuShenMeaning.fortune}\n\nラッキーカラー: ${fortune.luckyColor}\nラッキーナンバー: ${fortune.luckyNumber}`;

  let sentCount = 0;

  for (const { userId } of optedInUsers) {
    try {
      await db.insert(notifications).values({
        userId,
        type: "daily_fortune",
        title,
        message,
        link: "/dashboard",
        isRead: false,
        metadata: JSON.stringify({
          liuShen: mainLiuShen,
          date: fortune.date,
          luckyColor: fortune.luckyColor,
          luckyNumber: fortune.luckyNumber,
        }),
      });

      sentCount++;
    } catch (error) {
      console.error(`[Followup] Error sending daily fortune for user ${userId}:`, error);
    }
  }

  console.log(`[Followup] Sent ${sentCount} daily fortune notifications`);

  return { success: true, count: sentCount };
}

export { FollowupType };
