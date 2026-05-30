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

    // 1. Get total registered users
    const totalUsers = await prisma.user.count({
      where: { role: "USER" },
    });

    // 2. Fetch recent assessment logs
    const logs = await prisma.assessmentLog.findMany({
      take: 20, // get more logs to have a good view
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });

    // 3. Compute stats
    // Active sessions: unique users who generated logs in last 24h + 1 (the current admin)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsersGroup = await prisma.assessmentLog.groupBy({
      by: ["userId"],
      where: {
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
    });
    const activeSessions = activeUsersGroup.length + 1; // +1 for the active admin session

    // Global Inference Accuracy: average confidence of successful prediction logs
    const averageConfidence = await prisma.assessmentLog.aggregate({
      _avg: {
        confidence: true,
      },
      where: {
        status: "SUCCESS",
      },
    });
    const globalAccuracy = averageConfidence._avg.confidence
      ? parseFloat(averageConfidence._avg.confidence.toFixed(1))
      : 98.5; // Baseline default if no assessments yet

    // 4. Compute 7-day histories for sparklines
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentUsers = await prisma.user.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        role: "USER",
      },
      select: { createdAt: true },
    });

    const recentLogs = await prisma.assessmentLog.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
      select: { createdAt: true, confidence: true, status: true },
    });

    // Create array of dates for the last 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    // Daily user signups
    const userGrowthHistory = days.map((day) => {
      const start = new Date(day);
      const end = new Date(day);
      end.setHours(23, 59, 59, 999);
      return recentUsers.filter(u => u.createdAt >= start && u.createdAt <= end).length;
    });

    // Daily assessment activity
    const activityHistory = days.map((day) => {
      const start = new Date(day);
      const end = new Date(day);
      end.setHours(23, 59, 59, 999);
      return recentLogs.filter(l => l.createdAt >= start && l.createdAt <= end).length;
    });

    // Daily average accuracy
    const accuracyHistory = days.map((day) => {
      const start = new Date(day);
      const end = new Date(day);
      end.setHours(23, 59, 59, 999);
      const dayLogs = recentLogs.filter(
        l => l.createdAt >= start && l.createdAt <= end && l.status === "SUCCESS"
      );
      if (dayLogs.length === 0) return 98.5; // baseline accuracy
      const avg = dayLogs.reduce((sum, l) => sum + l.confidence, 0) / dayLogs.length;
      return parseFloat(avg.toFixed(1));
    });

    // 5. Compute dynamic percentage changes
    // User growth change percentage: users registered in last 7 days compared to users before that
    const totalUsersBefore7Days = totalUsers - recentUsers.length;
    let userGrowthChange = "+0.0% this week";
    if (totalUsersBefore7Days > 0) {
      const pct = (recentUsers.length / totalUsersBefore7Days) * 100;
      userGrowthChange = `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% this week`;
    } else if (recentUsers.length > 0) {
      userGrowthChange = `+100.0% this week`;
    }

    // Active sessions change percentage (last 24h vs previous 24h)
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const prevActiveUsersGroup = await prisma.assessmentLog.groupBy({
      by: ["userId"],
      where: {
        createdAt: {
          gte: fortyEightHoursAgo,
          lt: twentyFourHoursAgo,
        },
      },
    });
    const currentActiveCount = activeUsersGroup.length;
    const prevActiveCount = prevActiveUsersGroup.length;
    let sessionChange = "+0.0% today";
    if (prevActiveCount > 0) {
      const pct = ((currentActiveCount - prevActiveCount) / prevActiveCount) * 100;
      sessionChange = `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% today`;
    } else if (currentActiveCount > 0) {
      sessionChange = `+100.0% today`;
    }

    // Accuracy change vs previous week's average confidence
    const prevWeekLogs = await prisma.assessmentLog.aggregate({
      _avg: {
        confidence: true,
      },
      where: {
        status: "SUCCESS",
        createdAt: {
          lt: sevenDaysAgo,
        },
      },
    });
    const prevAccuracy = prevWeekLogs._avg.confidence || 98.5;
    const diff = globalAccuracy - prevAccuracy;
    const accuracyChange = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}% vs last week`;

    return NextResponse.json({
      stats: {
        totalUsers,
        activeSessions,
        globalAccuracy,
        userGrowthHistory,
        activityHistory,
        accuracyHistory,
        userGrowthChange,
        sessionChange,
        accuracyChange,
      },
      logs: logs.map((log) => ({
        id: log.requestId,
        modelType: log.modelType,
        confidence: log.confidence,
        latency: Math.round(log.latency * 1000), // in ms
        status: log.status,
        patientName: log.user.fullName,
        condition: log.predictedCondition,
        createdAt: log.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("Admin stats fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
