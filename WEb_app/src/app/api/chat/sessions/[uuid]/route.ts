import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const session = await prisma.chatSession.findUnique({
      where: { uuid },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session || session.userId !== decoded.userId) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error("GET Chat Session by UUID API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const session = await prisma.chatSession.findUnique({
      where: { uuid },
    });

    if (!session || session.userId !== decoded.userId) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    await prisma.chatSession.delete({
      where: { uuid },
    });

    return NextResponse.json({ success: true, message: "Session deleted successfully" });
  } catch (error: any) {
    console.error("DELETE Chat Session API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
