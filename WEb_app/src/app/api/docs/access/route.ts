import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Get the single docs config row (or create default if missing)
    let config = await prisma.docsConfig.findFirst({ orderBy: { id: "asc" } });

    if (!config) {
      // Default: disabled, window June 10–14 2026
      config = await prisma.docsConfig.create({
        data: {
          isEnabled: false,
          startDate: new Date("2026-06-10T00:00:00.000Z"),
          endDate: new Date("2026-06-14T23:59:59.000Z"),
          updatedBy: "system",
        },
      });
    }

    const now = new Date();

    if (!config.isEnabled) {
      // Check if we're within the scheduled window even if toggle is "auto"
      const withinWindow = now >= config.startDate && now <= config.endDate;
      if (!withinWindow) {
        const futureStart = config.startDate > now ? config.startDate.toISOString() : null;
        return NextResponse.json({
          accessible: false,
          message: "Documentation is not currently available.",
          futureStart,
          endDate: config.endDate.toISOString(),
        });
      }
    }

    // isEnabled = true means always accessible regardless of dates
    return NextResponse.json({
      accessible: true,
      startDate: config.startDate.toISOString(),
      endDate: config.endDate.toISOString(),
    });
  } catch (error) {
    console.error("[/api/docs/access] Error:", error);
    return NextResponse.json({ accessible: false, message: "Service error." }, { status: 500 });
  }
}
