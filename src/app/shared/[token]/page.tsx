import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOracleById } from "@/lib/oracles";

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { token } = await params;
  const shared = await prisma.sharedSession.findUnique({
    where: { shareToken: token },
    include: { session: true },
  });

  if (!shared || shared.expiresAt < new Date()) {
    return { title: "共有リンクが無効です — 六神ノ間" };
  }

  const oracle = getOracleById(shared.session.oracleId);
  const title = shared.session.title || `${oracle?.name ?? "占い師"}との鑑定`;

  return {
    title: `${title} — 六神ノ間`,
    description: `${oracle?.name ?? "占い師"}による鑑定結果をご覧ください`,
    openGraph: {
      title: `${title} — 六神ノ間`,
      description: `${oracle?.name ?? "占い師"}による鑑定結果`,
      type: "article",
    },
  };
}

export default async function SharedPage({ params }: Props) {
  const { token } = await params;

  const shared = await prisma.sharedSession.findUnique({
    where: { shareToken: token },
    include: {
      session: {
        include: {
          messages: {
            where: { role: { not: "SYSTEM" } },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!shared) notFound();

  if (shared.expiresAt < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[#9ca3af]">
            この共有リンクの有効期限が切れています
          </p>
          <Link
            href="/"
            className="text-[#d4af37] hover:text-[#f4d03f] underline text-sm"
          >
            六神ノ間トップへ
          </Link>
        </div>
      </div>
    );
  }

  const oracle = getOracleById(shared.session.oracleId);

  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 border-b border-[rgba(212,175,55,0.15)] bg-[#0a0a1a]/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          {oracle && (
            <div
              className="text-2xl w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: `linear-gradient(135deg, ${oracle.gradientFrom}, ${oracle.gradientTo})`,
              }}
            >
              {oracle.icon}
            </div>
          )}
          <div>
            <h1
              className="font-[var(--font-noto-serif-jp)] font-bold text-base"
              style={{ color: oracle?.color ?? "#d4af37" }}
            >
              {oracle?.name ?? "占い師"}
            </h1>
            <p className="text-[10px] text-[#9ca3af]">
              {shared.session.title ?? "鑑定記録"}
            </p>
          </div>
        </div>
      </header>

      {/* メッセージ */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {shared.session.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "USER" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex gap-3 max-w-[85%] ${
                message.role === "USER" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {message.role === "ASSISTANT" && oracle && (
                <div
                  className="text-lg w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1"
                  style={{
                    background: `linear-gradient(135deg, ${oracle.gradientFrom}, ${oracle.gradientTo})`,
                  }}
                >
                  {oracle.icon}
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  message.role === "USER"
                    ? "bg-[#7c3aed]/30 text-white rounded-br-sm"
                    : "glass-card rounded-bl-sm"
                }`}
              >
                {message.content}
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* CTAバナー */}
      <div className="sticky bottom-0 border-t border-[rgba(212,175,55,0.15)] bg-[#0a0a1a]/95 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[#d4af37]">六神ノ間</p>
            <p className="text-[11px] text-[#9ca3af]">
              あなたも11人のAI占い師に鑑定してもらいませんか？
            </p>
          </div>
          <Link
            href="/"
            className="shrink-0 bg-[#d4af37] hover:bg-[#f4d03f] text-[#0a0a1a] font-bold text-xs px-4 py-2 rounded-lg transition-colors"
          >
            始める
          </Link>
        </div>
      </div>
    </div>
  );
}
