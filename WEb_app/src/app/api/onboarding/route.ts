import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const payload = await request.json();

    const {
      firstName,
      lastName,
      dob,
      sexAtBirth,
      bloodType,
      height,
      weight,
      heartRate,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      spO2,
      avgSleepHours,
      fastFoodMealsPerWeek,
      waterCupsPerDay,
      dailySteps,
      stressLevel,
      smokingPacksPerWeek,
      alcoholDrinksPerWeek,
      conditions,
      medications,
      allergies,
    } = payload;

    // Validate minimum required fields
    if (
      !firstName ||
      !lastName ||
      !dob ||
      !sexAtBirth ||
      height === undefined ||
      weight === undefined
    ) {
      return NextResponse.json(
        { error: "Missing basic required onboarding fields" },
        { status: 400 }
      );
    }

    // Save/Update onboarding details sequentially (to prevent Neon pooler P2028 transaction timeout)
    const onboarding = await prisma.onboarding.upsert({
      where: { userId: decoded.userId },
      update: {
        firstName,
        lastName,
        dob: new Date(dob),
        sexAtBirth,
        bloodType: bloodType || null,
        height: parseFloat(height),
        weight: parseFloat(weight),
        heartRate: heartRate ? parseFloat(heartRate) : null,
        bloodPressureSystolic: bloodPressureSystolic ? parseFloat(bloodPressureSystolic) : null,
        bloodPressureDiastolic: bloodPressureDiastolic ? parseFloat(bloodPressureDiastolic) : null,
        spO2: spO2 ? parseFloat(spO2) : null,
        avgSleepHours: avgSleepHours ? parseFloat(avgSleepHours) : 7.0,
        fastFoodMealsPerWeek: fastFoodMealsPerWeek ? parseFloat(fastFoodMealsPerWeek) : 2.0,
        waterCupsPerDay: waterCupsPerDay ? parseFloat(waterCupsPerDay) : 8.0,
        dailySteps: dailySteps ? parseFloat(dailySteps) : 5000.0,
        stressLevel: stressLevel ? parseFloat(stressLevel) : 3.0,
        smokingPacksPerWeek: smokingPacksPerWeek ? parseFloat(smokingPacksPerWeek) : 0.0,
        alcoholDrinksPerWeek: alcoholDrinksPerWeek ? parseFloat(alcoholDrinksPerWeek) : 0.0,
        conditions: Array.isArray(conditions) ? conditions : [],
        medications: medications || null,
        allergies: allergies || null,
      },
      create: {
        userId: decoded.userId,
        firstName,
        lastName,
        dob: new Date(dob),
        sexAtBirth,
        bloodType: bloodType || null,
        height: parseFloat(height),
        weight: parseFloat(weight),
        heartRate: heartRate ? parseFloat(heartRate) : null,
        bloodPressureSystolic: bloodPressureSystolic ? parseFloat(bloodPressureSystolic) : null,
        bloodPressureDiastolic: bloodPressureDiastolic ? parseFloat(bloodPressureDiastolic) : null,
        spO2: spO2 ? parseFloat(spO2) : null,
        avgSleepHours: avgSleepHours ? parseFloat(avgSleepHours) : 7.0,
        fastFoodMealsPerWeek: fastFoodMealsPerWeek ? parseFloat(fastFoodMealsPerWeek) : 2.0,
        waterCupsPerDay: waterCupsPerDay ? parseFloat(waterCupsPerDay) : 8.0,
        dailySteps: dailySteps ? parseFloat(dailySteps) : 5000.0,
        stressLevel: stressLevel ? parseFloat(stressLevel) : 3.0,
        smokingPacksPerWeek: smokingPacksPerWeek ? parseFloat(smokingPacksPerWeek) : 0.0,
        alcoholDrinksPerWeek: alcoholDrinksPerWeek ? parseFloat(alcoholDrinksPerWeek) : 0.0,
        conditions: Array.isArray(conditions) ? conditions : [],
        medications: medications || null,
        allergies: allergies || null,
      },
    });

    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { isOnboarded: true },
    });

    return NextResponse.json({
      message: "Onboarding completed successfully",
      onboarding,
      user: {
        id: user.id,
        email: user.email,
        isOnboarded: user.isOnboarded,
      },
    });
  } catch (error: any) {
    console.error("Onboarding submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const onboarding = await prisma.onboarding.findUnique({
      where: { userId: decoded.userId },
    });

    if (!onboarding) {
      return NextResponse.json(
        { error: "Onboarding data not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ onboarding });
  } catch (error: any) {
    console.error("Onboarding fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
