import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// GET /api/admin/docs/config — returns current docs config
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    let config = await prisma.docsConfig.findFirst({ orderBy: { id: "asc" } });
    if (!config) {
      config = await prisma.docsConfig.create({
        data: {
          isEnabled: false,
          startDate: new Date("2026-06-10T00:00:00.000Z"),
          endDate: new Date("2026-06-14T23:59:59.000Z"),
          updatedBy: "system",
        },
      });
    }
    return NextResponse.json({ config });
  } catch (error) {
    console.error("[admin/docs/config GET]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/admin/docs/config — update docs config
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await request.json();
    const { isEnabled, startDate, endDate } = body;

    let config = await prisma.docsConfig.findFirst({ orderBy: { id: "asc" } });
    if (!config) {
      config = await prisma.docsConfig.create({
        data: {
          isEnabled: isEnabled ?? false,
          startDate: startDate ? new Date(startDate) : new Date("2026-06-10T00:00:00.000Z"),
          endDate: endDate ? new Date(endDate) : new Date("2026-06-14T23:59:59.000Z"),
          updatedBy: decoded.email || "admin",
        },
      });
    } else {
      config = await prisma.docsConfig.update({
        where: { id: config.id },
        data: {
          ...(isEnabled !== undefined && { isEnabled }),
          ...(startDate && { startDate: new Date(startDate) }),
          ...(endDate && { endDate: new Date(endDate) }),
          updatedBy: decoded.email || "admin",
        },
      });
    }
    return NextResponse.json({ config, message: "Docs config updated." });
  } catch (error) {
    console.error("[admin/docs/config POST]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
