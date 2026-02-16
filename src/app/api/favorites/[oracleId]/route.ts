import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ oracleId: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { oracleId } = await params;

    await prisma.favoriteOracle.deleteMany({
      where: { userId: user.id, oracleId },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Favorites DELETE error:", error);
    return Response.json(
      { error: "お気に入りの解除に失敗しました" },
      { status: 500 }
    );
  }
}
