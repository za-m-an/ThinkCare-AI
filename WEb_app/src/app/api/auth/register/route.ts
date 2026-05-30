import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { fullName, email, password } = await request.json();

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Password requirements: 8+ chars, 1 number, 1 special char
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasMinLength || !hasNumber || !hasSpecialChar) {
      return NextResponse.json(
        { error: "Password does not meet requirements" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 400 }
      );
    }

    // Generate unique Patient ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const patientId = `TC-${randomSuffix}-AX`;

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash,
        role: "USER",
        patientId,
        isOnboarded: false,
      },
    });

    return NextResponse.json({
      message: "User registered successfully",
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        patientId: user.patientId,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
