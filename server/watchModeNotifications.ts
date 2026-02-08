/**
 * 見守りモード自動メッセージ送信機能
 * 暦のイベント（新月・満月・節分など）に合わせて占い師から自動メッセージを送信
 */

import { getDb } from "./db";
import { userCompanionSettings, userAnniversaries, calendarEvents, scheduledMessages, userOracleIntimacy, users } from "../drizzle/schema";
import { eq, and, sql, lte, gte } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";
import { oracles } from "../client/src/lib/oracles";

// 暦イベントの定義
export const CALENDAR_EVENTS = [
  // 月の満ち欠け（毎月変動するため、実際の日付は動的に計算）
  { name: "新月", eventType: "lunar", description: "新しい始まりの時" },
  { name: "満月", eventType: "lunar", description: "願いが満ちる時" },
  
  // 二十四節気（固定日付）
  { name: "立春", month: 2, day: 4, eventType: "seasonal", description: "春の始まり" },
  { name: "雨水", month: 2, day: 19, eventType: "seasonal", description: "雪が雨に変わる頃" },
  { name: "啓蟄", month: 3, day: 6, eventType: "seasonal", description: "虫が目覚める頃" },
  { name: "春分", month: 3, day: 21, eventType: "seasonal", description: "昼と夜が等しくなる日" },
  { name: "清明", month: 4, day: 5, eventType: "seasonal", description: "万物が清らかになる頃" },
  { name: "穀雨", month: 4, day: 20, eventType: "seasonal", description: "穀物を潤す雨が降る頃" },
  { name: "立夏", month: 5, day: 6, eventType: "seasonal", description: "夏の始まり" },
  { name: "小満", month: 5, day: 21, eventType: "seasonal", description: "万物が成長する頃" },
  { name: "芒種", month: 6, day: 6, eventType: "seasonal", description: "穀物の種を蒔く頃" },
  { name: "夏至", month: 6, day: 21, eventType: "seasonal", description: "一年で最も昼が長い日" },
  { name: "小暑", month: 7, day: 7, eventType: "seasonal", description: "暑さが本格化する頃" },
  { name: "大暑", month: 7, day: 23, eventType: "seasonal", description: "一年で最も暑い頃" },
  { name: "立秋", month: 8, day: 8, eventType: "seasonal", description: "秋の始まり" },
  { name: "処暑", month: 8, day: 23, eventType: "seasonal", description: "暑さが和らぐ頃" },
  { name: "白露", month: 9, day: 8, eventType: "seasonal", description: "朝露が白く光る頃" },
  { name: "秋分", month: 9, day: 23, eventType: "seasonal", description: "昼と夜が等しくなる日" },
  { name: "寒露", month: 10, day: 8, eventType: "seasonal", description: "露が冷たくなる頃" },
  { name: "霜降", month: 10, day: 24, eventType: "seasonal", description: "霜が降り始める頃" },
  { name: "立冬", month: 11, day: 8, eventType: "seasonal", description: "冬の始まり" },
  { name: "小雪", month: 11, day: 22, eventType: "seasonal", description: "雪が降り始める頃" },
  { name: "大雪", month: 12, day: 7, eventType: "seasonal", description: "雪が本格的に降る頃" },
  { name: "冬至", month: 12, day: 22, eventType: "seasonal", description: "一年で最も夜が長い日" },
  { name: "小寒", month: 1, day: 6, eventType: "seasonal", description: "寒さが厳しくなる頃" },
  { name: "大寒", month: 1, day: 20, eventType: "seasonal", description: "一年で最も寒い頃" },
  
  // 日本の伝統行事
  { name: "節分", month: 2, day: 3, eventType: "traditional", description: "邪気を払い福を招く日" },
  { name: "ひな祭り", month: 3, day: 3, eventType: "traditional", description: "女の子の健やかな成長を願う日" },
  { name: "端午の節句", month: 5, day: 5, eventType: "traditional", description: "男の子の健やかな成長を願う日" },
  { name: "七夕", month: 7, day: 7, eventType: "traditional", description: "願い事をする日" },
  { name: "お盆", month: 8, day: 15, eventType: "traditional", description: "ご先祖様を供養する日" },
  { name: "十五夜", month: 9, day: 15, eventType: "traditional", description: "中秋の名月を愛でる日" },
  { name: "七五三", month: 11, day: 15, eventType: "traditional", description: "子供の成長を祝う日" },
  { name: "大晦日", month: 12, day: 31, eventType: "traditional", description: "一年の終わりを迎える日" },
  { name: "元旦", month: 1, day: 1, eventType: "traditional", description: "新しい年の始まり" },
];

// 占い師ごとのメッセージスタイル
const ORACLE_MESSAGE_STYLES: Record<string, { tone: string; focus: string }> = {
  soma: {
    tone: "穏やかで包容力のある",
    focus: "時間の流れと運命の導き",
  },
  kuran: {
    tone: "情熱的で温かい",
    focus: "愛と人間関係の絆",
  },
  sakuya: {
    tone: "知的で分析的な",
    focus: "数字と論理的な視点",
  },
  akari: {
    tone: "明るく前向きな",
    focus: "直感とインスピレーション",
  },
  yui: {
    tone: "神秘的で深遠な",
    focus: "月と潜在意識の力",
  },
  gen: {
    tone: "力強く頼もしい",
    focus: "守護と困難の克服",
  },
};

/**
 * 見守りモードが有効なユーザーに暦イベントメッセージを送信
 */
export async function sendCalendarEventMessages(): Promise<{ sent: number; errors: number }> {
  const db = await getDb();
  if (!db) return { sent: 0, errors: 0 };
  
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  
  // 今日のイベントを取得
  const todayEvents = CALENDAR_EVENTS.filter(
    event => event.month === currentMonth && event.day === currentDay
  );
  
  if (todayEvents.length === 0) {
    return { sent: 0, errors: 0 };
  }
  
  // 見守りモードが有効なユーザーを取得
  const watchModeUsers = await db.select({
    userId: userCompanionSettings.userId,
    preferredOracle: userCompanionSettings.preferredOracleForNotifications,
  })
    .from(userCompanionSettings)
    .where(and(
      eq(userCompanionSettings.watchModeEnabled, true),
      eq(userCompanionSettings.calendarNotificationsEnabled, true)
    ));
  
  let sent = 0;
  let errors = 0;
  
  for (const user of watchModeUsers) {
    try {
      // 優先占い師を決定（設定がなければランダム）
      let oracleId = user.preferredOracle;
      if (!oracleId) {
        // 最も親密度が高い占い師を選択
        const topIntimacy = await db.select()
          .from(userOracleIntimacy)
          .where(eq(userOracleIntimacy.userId, user.userId))
          .orderBy(sql`${userOracleIntimacy.level} DESC`)
          .limit(1);
        
        oracleId = topIntimacy.length > 0 ? topIntimacy[0].oracleId : "soma";
      }
      
      const oracle = oracles.find(o => o.id === oracleId) || oracles[0];
      const style = ORACLE_MESSAGE_STYLES[oracleId] || ORACLE_MESSAGE_STYLES.soma;
      
      for (const event of todayEvents) {
        // LLMでメッセージを生成
        const prompt = `あなたは「${oracle.name}」という占い師です。
${style.tone}口調で、${style.focus}を大切にしています。

今日は「${event.name}」です。${event.description}

見守りモードのユーザーに、この暦のイベントに合わせた短い励ましのメッセージを送ってください。
- 100文字以内で簡潔に
- 占い師としての視点から
- ユーザーの一日が良いものになるような言葉を

メッセージのみを出力してください。`;

        const response = await invokeLLM({
          messages: [{ role: "user", content: prompt }],
        });
        
        const rawContent = response.choices[0]?.message?.content;
        const message = (typeof rawContent === 'string' ? rawContent : null) || 
          `今日は${event.name}。${event.description}。素敵な一日をお過ごしください。`;
        
        // スケジュールメッセージとして保存
        await db.insert(scheduledMessages).values({
          userId: user.userId,
          oracleId,
          messageType: "calendar_event",
          title: event.name,
          content: message,
          scheduledAt: new Date(),
          status: "sent",
          sentAt: new Date(),
        });
        
        sent++;
      }
    } catch (error) {
      console.error(`Failed to send calendar message to user ${user.userId}:`, error);
      errors++;
    }
  }
  
  return { sent, errors };
}

/**
 * 大切な日のリマインダーメッセージを送信
 */
export async function sendAnniversaryReminders(): Promise<{ sent: number; errors: number }> {
  const db = await getDb();
  if (!db) return { sent: 0, errors: 0 };
  
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  
  // 今日が大切な日、または通知日のユーザーを取得
  const upcomingAnniversaries = await db.select({
    anniversary: userAnniversaries,
    settings: userCompanionSettings,
  })
    .from(userAnniversaries)
    .leftJoin(userCompanionSettings, eq(userAnniversaries.userId, userCompanionSettings.userId))
    .where(and(
      eq(userAnniversaries.notificationEnabled, true),
      sql`${userCompanionSettings.anniversaryNotificationsEnabled} = true`
    ));
  
  let sent = 0;
  let errors = 0;
  
  for (const { anniversary, settings } of upcomingAnniversaries) {
    if (!settings) continue;
    
    // 日付チェック
    const annMonth = anniversary.month;
    const annDay = anniversary.day;
    const reminderDays = anniversary.reminderDaysBefore || 0;
    
    // 今日が大切な日当日かどうか
    const isToday = annMonth === currentMonth && annDay === currentDay;
    
    // 今日がリマインダー日かどうか
    let isReminderDay = false;
    if (reminderDays > 0) {
      const annDate = new Date(today.getFullYear(), annMonth - 1, annDay);
      if (annDate < today) {
        annDate.setFullYear(today.getFullYear() + 1);
      }
      const daysUntil = Math.ceil((annDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      isReminderDay = daysUntil === reminderDays;
    }
    
    if (!isToday && !isReminderDay) continue;
    
    try {
      // 優先占い師を決定
      let oracleId = settings.preferredOracleForNotifications;
      if (!oracleId) {
        const topIntimacy = await db.select()
          .from(userOracleIntimacy)
          .where(eq(userOracleIntimacy.userId, anniversary.userId))
          .orderBy(sql`${userOracleIntimacy.level} DESC`)
          .limit(1);
        
        oracleId = topIntimacy.length > 0 ? topIntimacy[0].oracleId : "soma";
      }
      
      const oracle = oracles.find(o => o.id === oracleId) || oracles[0];
      const style = ORACLE_MESSAGE_STYLES[oracleId] || ORACLE_MESSAGE_STYLES.soma;
      
      // メッセージ生成
      const messageType = isToday ? "当日" : `${reminderDays}日前`;
      const prompt = `あなたは「${oracle.name}」という占い師です。
${style.tone}口調で、${style.focus}を大切にしています。

ユーザーの大切な日「${anniversary.name}」が${messageType}です。
カテゴリ: ${anniversary.category}

${isToday ? "今日という特別な日を祝う" : "もうすぐ訪れる大切な日を楽しみにする"}メッセージを送ってください。
- 100文字以内で簡潔に
- 占い師としての視点から
- 心温まる言葉を

メッセージのみを出力してください。`;

      const response = await invokeLLM({
        messages: [{ role: "user", content: prompt }],
      });
      
      const rawContent2 = response.choices[0]?.message?.content;
      const message = (typeof rawContent2 === 'string' ? rawContent2 : null) || 
        (isToday 
          ? `今日は「${anniversary.name}」ですね。素敵な一日をお過ごしください。`
          : `「${anniversary.name}」まであと${reminderDays}日です。楽しみですね。`);
      
      // スケジュールメッセージとして保存
      await db.insert(scheduledMessages).values({
        userId: anniversary.userId,
        oracleId,
        messageType: isToday ? "anniversary_today" : "anniversary_reminder",
        title: anniversary.name,
        content: message,
        scheduledAt: new Date(),
        status: "sent",
        sentAt: new Date(),
      });
      
      sent++;
    } catch (error) {
      console.error(`Failed to send anniversary reminder to user ${anniversary.userId}:`, error);
      errors++;
    }
  }
  
  return { sent, errors };
}

/**
 * 見守りモードの日次メッセージを送信（朝の挨拶など）
 */
export async function sendDailyWatchModeMessages(): Promise<{ sent: number; errors: number }> {
  const db = await getDb();
  if (!db) return { sent: 0, errors: 0 };
  
  // 見守りモードが有効なユーザーを取得
  const watchModeUsers = await db.select({
    userId: userCompanionSettings.userId,
    preferredOracle: userCompanionSettings.preferredOracleForNotifications,
  })
    .from(userCompanionSettings)
    .where(eq(userCompanionSettings.watchModeEnabled, true));
  
  let sent = 0;
  let errors = 0;
  
  const today = new Date();
  const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][today.getDay()];
  
  for (const user of watchModeUsers) {
    try {
      // 優先占い師を決定
      let oracleId = user.preferredOracle;
      if (!oracleId) {
        const topIntimacy = await db.select()
          .from(userOracleIntimacy)
          .where(eq(userOracleIntimacy.userId, user.userId))
          .orderBy(sql`${userOracleIntimacy.level} DESC`)
          .limit(1);
        
        oracleId = topIntimacy.length > 0 ? topIntimacy[0].oracleId : "soma";
      }
      
      const oracle = oracles.find(o => o.id === oracleId) || oracles[0];
      const style = ORACLE_MESSAGE_STYLES[oracleId] || ORACLE_MESSAGE_STYLES.soma;
      
      // 朝のメッセージ生成
      const prompt = `あなたは「${oracle.name}」という占い師です。
${style.tone}口調で、${style.focus}を大切にしています。

今日は${today.getMonth() + 1}月${today.getDate()}日（${dayOfWeek}曜日）です。

見守りモードのユーザーに、朝の短い挨拶メッセージを送ってください。
- 50文字以内で簡潔に
- 占い師としての視点から
- 一日の始まりを応援する言葉を

メッセージのみを出力してください。`;

      const response = await invokeLLM({
        messages: [{ role: "user", content: prompt }],
      });
      
      const rawContent3 = response.choices[0]?.message?.content;
      const message = (typeof rawContent3 === 'string' ? rawContent3 : null) || 
        `おはようございます。今日も素敵な一日になりますように。`;
      
      // スケジュールメッセージとして保存
      await db.insert(scheduledMessages).values({
        userId: user.userId,
        oracleId,
        messageType: "daily_greeting",
        title: "朝のご挨拶",
        content: message,
        scheduledAt: new Date(),
        status: "sent",
        sentAt: new Date(),
      });
      
      sent++;
    } catch (error) {
      console.error(`Failed to send daily message to user ${user.userId}:`, error);
      errors++;
    }
  }
  
  return { sent, errors };
}
