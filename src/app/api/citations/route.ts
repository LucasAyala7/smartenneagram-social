import { NextResponse } from "next/server";
import { pickCitations, listCategories, getTypeMeta } from "@/lib/acervo";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "pick";
  const type = Number(url.searchParams.get("type") || 0);

  if (!type || type < 1 || type > 9) {
    return NextResponse.json({ error: "type 1-9 required" }, { status: 400 });
  }

  if (action === "categories") {
    const cats = await listCategories(type);
    return NextResponse.json({ categories: cats });
  }

  if (action === "meta") {
    const meta = await getTypeMeta(type);
    return NextResponse.json({ meta });
  }

  // default: pick
  const category = url.searchParams.get("category") || undefined;
  const author = url.searchParams.get("author") || undefined;
  const limit = Number(url.searchParams.get("limit") || 6);
  const requirePage = url.searchParams.get("requirePage") !== "false";

  const citations = await pickCitations({ type, category, author, limit, requirePage });
  return NextResponse.json({ citations });
}
