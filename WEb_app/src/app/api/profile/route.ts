import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const payload = await request.json();
    const { type } = payload;

    if (type === "profile") {
      const { fullName, email } = payload;
      if (!fullName || !email) {
        return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
      }

      // Check if email is already taken by another user
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser && existingUser.id !== decoded.userId) {
        return NextResponse.json({ error: "Email is already in use by another account" }, { status: 400 });
      }

      const updatedUser = await prisma.user.update({
        where: { id: decoded.userId },
        data: { fullName, email },
      });

      return NextResponse.json({
        message: "Profile updated successfully",
        user: { id: updatedUser.id, fullName: updatedUser.fullName, email: updatedUser.email },
      });
    }

    if (type === "security") {
      const { currentPassword, newPassword } = payload;
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: "Current and new passwords are required" }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Invalid current password" }, { status: 400 });
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: decoded.userId },
        data: { passwordHash: newPasswordHash },
      });

      return NextResponse.json({ message: "Password updated successfully" });
    }

    if (type === "notifications") {
      const { twoFactorEnabled, emailAlerts, criticalTriggers, systemLogs } = payload;

      const updatedUser = await prisma.user.update({
        where: { id: decoded.userId },
        data: {
          twoFactorEnabled: twoFactorEnabled !== undefined ? !!twoFactorEnabled : undefined,
          emailAlerts: emailAlerts !== undefined ? !!emailAlerts : undefined,
          criticalTriggers: criticalTriggers !== undefined ? !!criticalTriggers : undefined,
          systemLogs: systemLogs !== undefined ? !!systemLogs : undefined,
        },
      });

      return NextResponse.json({
        message: "Notification preferences updated successfully",
        preferences: {
          twoFactorEnabled: updatedUser.twoFactorEnabled,
          emailAlerts: updatedUser.emailAlerts,
          criticalTriggers: updatedUser.criticalTriggers,
          systemLogs: updatedUser.systemLogs,
        },
      });
    }

    return NextResponse.json({ error: "Invalid update type" }, { status: 400 });
  } catch (error: any) {
    console.error("Profile settings update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
