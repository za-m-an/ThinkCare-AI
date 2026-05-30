import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// GET — admin: read all content sections
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const rows = await prisma.docsContent.findMany({ orderBy: { section: "asc" } });
    const contentMap: Record<string, unknown> = {};
    for (const row of rows) {
      try {
        contentMap[row.section] = JSON.parse(row.content);
      } catch {
        contentMap[row.section] = row.content;
      }
    }
    return NextResponse.json({ content: contentMap });
  } catch (error) {
    console.error("[admin/docs/content GET]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST — admin: upsert a section
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await request.json();
    const { section, content } = body;
    if (!section || content === undefined)
      return NextResponse.json({ error: "Missing section or content" }, { status: 400 });

    const contentStr = typeof content === "string" ? content : JSON.stringify(content);

    const row = await prisma.docsContent.upsert({
      where: { section },
      update: { content: contentStr },
      create: { section, content: contentStr },
    });
    return NextResponse.json({ row, message: "Section saved." });
  } catch (error) {
    console.error("[admin/docs/content POST]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
