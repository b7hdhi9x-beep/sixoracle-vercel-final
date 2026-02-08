/**
 * Email Service Module
 * 
 * Gmail/iCloud経由でメール送信を行うモジュール
 * 
 * 設定方法:
 * 
 * 【Gmail の場合】
 * 1. Googleアカウントで「アプリパスワード」を生成
 *    - https://myaccount.google.com/apppasswords にアクセス
 *    - 2段階認証が有効になっている必要があります
 *    - アプリ名を入力して「生成」をクリック
 *    - 16文字のパスワードをコピー
 * 
 * 2. 環境変数を設定:
 *    - EMAIL_SERVICE=gmail
 *    - EMAIL_USER=your-email@gmail.com
 *    - EMAIL_PASSWORD=生成したアプリパスワード（16文字、スペースなし）
 *    - EMAIL_FROM_NAME=六神ノ間
 * 
 * 【iCloud の場合】
 * 1. Apple IDで「アプリ固有のパスワード」を生成
 *    - https://appleid.apple.com にアクセス
 *    - 「セキュリティ」→「アプリ固有のパスワード」
 *    - 「パスワードを生成」をクリック
 * 
 * 2. 環境変数を設定:
 *    - EMAIL_SERVICE=icloud
 *    - EMAIL_USER=your-email@icloud.com
 *    - EMAIL_PASSWORD=生成したアプリ固有のパスワード
 *    - EMAIL_FROM_NAME=六神ノ間
 */

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

// Email service configuration
interface EmailConfig {
  service: "gmail" | "icloud" | "custom";
  host?: string;
  port?: number;
  secure?: boolean;
  user: string;
  password: string;
  fromName: string;
}

// Get email configuration from environment variables
function getEmailConfig(): EmailConfig | null {
  const service = process.env.EMAIL_SERVICE as "gmail" | "icloud" | "custom" | undefined;
  const user = process.env.EMAIL_USER;
  const password = process.env.EMAIL_PASSWORD;
  const fromName = process.env.EMAIL_FROM_NAME || "六神ノ間";

  if (!service || !user || !password) {
    console.log("[EmailService] Email configuration not found. Set EMAIL_SERVICE, EMAIL_USER, and EMAIL_PASSWORD environment variables.");
    return null;
  }

  return {
    service,
    user,
    password,
    fromName,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : undefined,
    secure: process.env.EMAIL_SECURE === "true",
  };
}

// Create transporter based on service type
function createTransporter(config: EmailConfig): Transporter {
  const baseOptions = {
    auth: {
      user: config.user,
      pass: config.password,
    },
  };

  switch (config.service) {
    case "gmail":
      return nodemailer.createTransport({
        service: "gmail",
        ...baseOptions,
      });

    case "icloud":
      return nodemailer.createTransport({
        host: "smtp.mail.me.com",
        port: 587,
        secure: false,
        ...baseOptions,
      });

    case "custom":
      return nodemailer.createTransport({
        host: config.host || "smtp.example.com",
        port: config.port || 587,
        secure: config.secure || false,
        ...baseOptions,
      });

    default:
      throw new Error(`Unsupported email service: ${config.service}`);
  }
}

// Cached transporter instance
let cachedTransporter: Transporter | null = null;
let cachedConfig: EmailConfig | null = null;

// Get or create transporter
function getTransporter(): Transporter | null {
  const config = getEmailConfig();
  if (!config) return null;

  // Return cached transporter if config hasn't changed
  if (cachedTransporter && cachedConfig && 
      cachedConfig.user === config.user && 
      cachedConfig.service === config.service) {
    return cachedTransporter;
  }

  cachedTransporter = createTransporter(config);
  cachedConfig = config;
  return cachedTransporter;
}

// Email template types
export type EmailTemplate = 
  | "activation_code"      // 合言葉発行通知
  | "renewal_reminder"     // 更新リマインド
  | "plan_activated"       // プラン有効化完了
  | "plan_expired"         // プラン期限切れ
  | "welcome"              // ウェルカムメール
  | "custom";              // カスタムメール

// Email sending options
export interface SendEmailOptions {
  to: string;
  subject: string;
  template?: EmailTemplate;
  templateData?: Record<string, any>;
  html?: string;
  text?: string;
}

// Generate HTML email from template
function generateEmailHtml(template: EmailTemplate, data: Record<string, any>): string {
  const baseStyle = `
    <style>
      body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #6366f1; }
      .header h1 { color: #6366f1; margin: 0; font-size: 24px; }
      .content { padding: 30px 0; }
      .highlight-box { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); color: white; padding: 20px; border-radius: 12px; margin: 20px 0; }
      .code-box { background: #f3f4f6; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 24px; text-align: center; letter-spacing: 2px; margin: 15px 0; }
      .info-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
      .info-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
      .info-table td:first-child { font-weight: bold; width: 40%; }
      .footer { text-align: center; padding: 20px 0; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
      .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 10px 0; }
    </style>
  `;

  const header = `
    <div class="header">
      <h1>✨ 六神ノ間</h1>
      <p style="color: #6b7280; margin: 5px 0 0 0;">Six Oracle - AI占いサービス</p>
    </div>
  `;

  const footer = `
    <div class="footer">
      <p>このメールは六神ノ間から自動送信されています。</p>
      <p>© 2026 六神ノ間 All rights reserved.</p>
    </div>
  `;

  let content = "";

  switch (template) {
    case "activation_code":
      content = `
        <div class="content">
          <p>${data.userName || "お客"}様</p>
          <p>お振込みの確認が取れました。ありがとうございます！</p>
          
          <div class="highlight-box">
            <h3 style="margin: 0 0 15px 0;">🎉 合言葉が届きました！</h3>
            <p style="margin: 0;">以下の合言葉を「プレミアムプラン」ページで入力してください。</p>
          </div>
          
          <div class="code-box">
            ${data.activationCode}
          </div>
          
          <table class="info-table">
            <tr>
              <td>プラン</td>
              <td>${data.planName || "月額プラン"}</td>
            </tr>
            <tr>
              <td>有効期間</td>
              <td>${data.durationDays || 30}日間</td>
            </tr>
            <tr>
              <td>合言葉有効期限</td>
              <td>発行から7日間</td>
            </tr>
          </table>
          
          <h4>有効化の手順</h4>
          <ol>
            <li>「プレミアムプラン」ページにアクセス</li>
            <li>「合言葉を入力」ボタンをクリック</li>
            <li>上記の合言葉を入力</li>
            <li>「有効化」ボタンをクリック</li>
          </ol>
          
          <p>ご不明な点がございましたら、お問い合わせください。</p>
        </div>
      `;
      break;

    case "renewal_reminder":
      content = `
        <div class="content">
          <p>${data.userName || "お客"}様</p>
          <p>いつも六神ノ間をご利用いただきありがとうございます。</p>
          
          <div class="highlight-box">
            <h3 style="margin: 0 0 15px 0;">⏰ プレミアムプランの継続確認</h3>
            <p style="margin: 0;">ご利用中のプランの有効期限が近づいております。</p>
          </div>
          
          <table class="info-table">
            <tr>
              <td>現在のプラン</td>
              <td>${data.planName || "月額プラン"}</td>
            </tr>
            <tr>
              <td>有効期限</td>
              <td>${data.expiresAt}</td>
            </tr>
          </table>
          
          <h4>継続をご希望の場合</h4>
          <p>以下の口座にお振込みください。</p>
          
          <table class="info-table">
            <tr>
              <td>銀行名</td>
              <td>${data.bankName || "楽天銀行"}</td>
            </tr>
            <tr>
              <td>支店名</td>
              <td>${data.branchName || "エンカ支店"}</td>
            </tr>
            <tr>
              <td>口座種別</td>
              <td>${data.accountType || "普通"}</td>
            </tr>
            <tr>
              <td>口座番号</td>
              <td>${data.accountNumber || "1479015"}</td>
            </tr>
            <tr>
              <td>口座名義</td>
              <td>${data.accountHolder || "タケベケイサク"}</td>
            </tr>
            <tr>
              <td>継続料金</td>
              <td>${data.renewalAmount || "¥1,980"}</td>
            </tr>
          </table>
          
          <p>振込確認後、新しい合言葉をお送りいたします。</p>
          <p>※有効期限を過ぎると、プレミアム機能がご利用いただけなくなります。</p>
        </div>
      `;
      break;

    case "plan_activated":
      content = `
        <div class="content">
          <p>${data.userName || "お客"}様</p>
          
          <div class="highlight-box">
            <h3 style="margin: 0 0 15px 0;">🎉 プレミアムプランが有効になりました！</h3>
            <p style="margin: 0;">6人の占い師による鑑定をお楽しみください。</p>
          </div>
          
          <table class="info-table">
            <tr>
              <td>プラン</td>
              <td>${data.planName || "月額プラン"}</td>
            </tr>
            <tr>
              <td>有効期限</td>
              <td>${data.expiresAt}</td>
            </tr>
            <tr>
              <td>1日の鑑定回数</td>
              <td>無制限</td>
            </tr>
          </table>
          
          <p style="text-align: center;">
            <a href="${data.dashboardUrl || "https://six-oracle.manus.space/dashboard"}" class="button">
              占いを始める
            </a>
          </p>
          
          <p>六神ノ間をご利用いただきありがとうございます。</p>
        </div>
      `;
      break;

    case "plan_expired":
      content = `
        <div class="content">
          <p>${data.userName || "お客"}様</p>
          
          <div class="highlight-box" style="background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%);">
            <h3 style="margin: 0 0 15px 0;">⚠️ プレミアムプランの有効期限が切れました</h3>
            <p style="margin: 0;">プレミアム機能がご利用いただけなくなりました。</p>
          </div>
          
          <p>継続をご希望の場合は、「プレミアムプラン」ページから再度お申し込みください。</p>
          <p>鑑定履歴は保持されておりますので、再開時にそのままご利用いただけます。</p>
          
          <p style="text-align: center;">
            <a href="${data.subscriptionUrl || "https://six-oracle.manus.space/subscription"}" class="button">
              プランを確認する
            </a>
          </p>
        </div>
      `;
      break;

    case "welcome":
      content = `
        <div class="content">
          <p>${data.userName || "お客"}様</p>
          
          <div class="highlight-box">
            <h3 style="margin: 0 0 15px 0;">✨ 六神ノ間へようこそ！</h3>
            <p style="margin: 0;">6人のAI占い師があなたの運命を照らします。</p>
          </div>
          
          <p>六神ノ間は、6人の個性豊かなAI占い師が、あなたの悩みに寄り添う占いサービスです。</p>
          
          <h4>占い師紹介</h4>
          <ul>
            <li><strong>蒼真（そうま）</strong> - タロットの達人</li>
            <li><strong>玖蘭（くらん）</strong> - 四柱推命の使い手</li>
            <li><strong>朔夜（さくや）</strong> - 西洋占星術のスペシャリスト</li>
            <li><strong>灯（あかり）</strong> - 数秘術の専門家</li>
            <li><strong>結衣（ゆい）</strong> - 風水の達人</li>
            <li><strong>玄（げん）</strong> - 易占の大家</li>
          </ul>
          
          <p style="text-align: center;">
            <a href="${data.dashboardUrl || "https://six-oracle.manus.space/dashboard"}" class="button">
              占いを始める
            </a>
          </p>
        </div>
      `;
      break;

    default:
      content = `
        <div class="content">
          ${data.content || ""}
        </div>
      `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseStyle}
    </head>
    <body>
      <div class="container">
        ${header}
        ${content}
        ${footer}
      </div>
    </body>
    </html>
  `;
}

// Generate plain text from template
function generateEmailText(template: EmailTemplate, data: Record<string, any>): string {
  switch (template) {
    case "activation_code":
      return `
${data.userName || "お客"}様

お振込みの確認が取れました。ありがとうございます！

【合言葉（アクティベーションコード）】
${data.activationCode}

【お申込みプラン】
${data.planName || "月額プラン"}（${data.durationDays || 30}日間）

【有効化の手順】
1. 「プレミアムプラン」ページにアクセス
2. 「合言葉を入力」ボタンをクリック
3. 上記の合言葉を入力
4. 「有効化」ボタンをクリック

※合言葉の有効期限は発行から7日間です。
※ご不明な点がございましたら、お問い合わせください。

六神ノ間
      `.trim();

    case "renewal_reminder":
      return `
${data.userName || "お客"}様

いつも六神ノ間をご利用いただきありがとうございます。

ご利用中の${data.planName || "月額プラン"}の有効期限が近づいております。

【有効期限】
${data.expiresAt}

継続をご希望の場合は、以下の口座にお振込みください。

【振込先口座】
銀行名: ${data.bankName || "楽天銀行"}
支店名: ${data.branchName || "エンカ支店"}
口座種別: ${data.accountType || "普通"}
口座番号: ${data.accountNumber || "1479015"}
口座名義: ${data.accountHolder || "タケベケイサク"}

【継続料金】
${data.renewalAmount || "¥1,980"}

振込確認後、新しい合言葉をお送りいたします。

※有効期限を過ぎると、プレミアム機能がご利用いただけなくなります。
※鑑定履歴は保持されますので、再開時にそのままご利用いただけます。

六神ノ間
      `.trim();

    case "plan_activated":
      return `
${data.userName || "お客"}様

プレミアムプランが有効になりました！

【プラン】
${data.planName || "月額プラン"}

【有効期限】
${data.expiresAt}

【1日の鑑定回数】
無制限

6人の占い師による鑑定をお楽しみください。

六神ノ間
      `.trim();

    case "plan_expired":
      return `
${data.userName || "お客"}様

プレミアムプランの有効期限が切れました。

プレミアム機能がご利用いただけなくなりました。
継続をご希望の場合は、「プレミアムプラン」ページから再度お申し込みください。

鑑定履歴は保持されておりますので、再開時にそのままご利用いただけます。

六神ノ間
      `.trim();

    default:
      return data.content || "";
  }
}

/**
 * Send email using configured email service
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const transporter = getTransporter();
  const config = getEmailConfig();

  if (!transporter || !config) {
    console.log("[EmailService] Email not configured. Skipping email send.");
    return { success: false, error: "Email service not configured" };
  }

  try {
    let html = options.html;
    let text = options.text;

    // Generate from template if provided
    if (options.template && options.templateData) {
      html = generateEmailHtml(options.template, options.templateData);
      text = generateEmailText(options.template, options.templateData);
    }

    const mailOptions = {
      from: `"${config.fromName}" <${config.user}>`,
      to: options.to,
      subject: options.subject,
      html,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Email sent successfully: ${info.messageId}`);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[EmailService] Failed to send email: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
}

/**
 * Send activation code email
 */
export async function sendActivationCodeEmail(params: {
  to: string;
  userName: string;
  activationCode: string;
  planName?: string;
  durationDays?: number;
}): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: params.to,
    subject: "【六神ノ間】合言葉が届きました",
    template: "activation_code",
    templateData: {
      userName: params.userName,
      activationCode: params.activationCode,
      planName: params.planName || "月額プラン",
      durationDays: params.durationDays || 30,
    },
  });
}

/**
 * Send renewal reminder email
 */
export async function sendRenewalReminderEmail(params: {
  to: string;
  userName: string;
  planName?: string;
  expiresAt: string;
  renewalAmount?: string;
}): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: params.to,
    subject: "【六神ノ間】プレミアムプランの継続確認",
    template: "renewal_reminder",
    templateData: {
      userName: params.userName,
      planName: params.planName || "月額プラン",
      expiresAt: params.expiresAt,
      renewalAmount: params.renewalAmount || "¥1,980",
      bankName: "楽天銀行",
      branchName: "エンカ支店",
      accountType: "普通",
      accountNumber: "1479015",
      accountHolder: "タケベケイサク",
    },
  });
}

/**
 * Send plan activated email
 */
export async function sendPlanActivatedEmail(params: {
  to: string;
  userName: string;
  planName?: string;
  expiresAt: string;
}): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: params.to,
    subject: "【六神ノ間】プレミアムプランが有効になりました",
    template: "plan_activated",
    templateData: {
      userName: params.userName,
      planName: params.planName || "月額プラン",
      expiresAt: params.expiresAt,
    },
  });
}

/**
 * Send plan expired email
 */
export async function sendPlanExpiredEmail(params: {
  to: string;
  userName: string;
}): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: params.to,
    subject: "【六神ノ間】プレミアムプランの有効期限が切れました",
    template: "plan_expired",
    templateData: {
      userName: params.userName,
    },
  });
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration(): Promise<{ success: boolean; error?: string }> {
  const transporter = getTransporter();
  const config = getEmailConfig();

  if (!transporter || !config) {
    return { success: false, error: "Email service not configured" };
  }

  try {
    await transporter.verify();
    console.log("[EmailService] Email configuration verified successfully");
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[EmailService] Email configuration verification failed: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
}

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return getEmailConfig() !== null;
}

/**
 * Get email configuration status for admin dashboard
 */
export function getEmailConfigStatus(): { configured: boolean; service: string | null; user: string | null } {
  const config = getEmailConfig();
  if (!config) {
    return { configured: false, service: null, user: null };
  }
  return {
    configured: true,
    service: config.service,
    user: config.user,
  };
}


/**
 * Send verification code email for adding new authentication method
 */
export async function sendVerificationCodeEmail(params: {
  to: string;
  userName: string;
  verificationCode: string;
}): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: params.to,
    subject: "【六神ノ間】認証コードのお知らせ",
    html: `
      <div style="font-family: 'Hiragino Sans', 'Meiryo', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">認証コードのお知らせ</h2>
        <p style="color: #555; line-height: 1.8;">
          ${params.userName}様<br><br>
          六神ノ間をご利用いただきありがとうございます。<br>
          新しい認証方法を追加するための認証コードをお送りします。
        </p>
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; border-radius: 10px; text-align: center; margin: 20px 0;">
          <p style="color: #d4af37; font-size: 14px; margin-bottom: 10px;">認証コード</p>
          <p style="color: #fff; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0;">${params.verificationCode}</p>
        </div>
        <p style="color: #888; font-size: 12px; line-height: 1.6;">
          ※ このコードは10分間有効です。<br>
          ※ このメールに心当たりがない場合は、無視してください。
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 11px; text-align: center;">
          六神ノ間 - AI占いサービス<br>
          このメールは自動送信されています。
        </p>
      </div>
    `,
    text: `
【六神ノ間】認証コードのお知らせ

${params.userName}様

六神ノ間をご利用いただきありがとうございます。
新しい認証方法を追加するための認証コードをお送りします。

認証コード: ${params.verificationCode}

※ このコードは10分間有効です。
※ このメールに心当たりがない場合は、無視してください。

---
六神ノ間 - AI占いサービス
    `,
  });
}
