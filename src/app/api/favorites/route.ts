import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "認証が必要です" }, { status: 401 });
    }

    const favorites = await prisma.favoriteOracle.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(favorites.map((f) => f.oracleId));
  } catch (error) {
    console.error("Favorites GET error:", error);
    return Response.json(
      { error: "お気に入りの取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { oracleId } = await request.json();

    if (!oracleId) {
      return Response.json(
        { error: "oracleId は必須です" },
        { status: 400 }
      );
    }

    await prisma.favoriteOracle.create({
      data: { userId: user.id, oracleId },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Favorites POST error:", error);
    return Response.json(
      { error: "お気に入りの追加に失敗しました" },
      { status: 500 }
    );
  }
}
