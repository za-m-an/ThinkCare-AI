import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Query all users who are not admin or retrieve all users with their onboarding details
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        onboarding: true,
      },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Admin fetch users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
