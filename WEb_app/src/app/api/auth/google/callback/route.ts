import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(new URL("/login?error=Google authentication failed", request.url));
    }

    const client_id = process.env.GOOGLE_CLIENT_ID;
    const client_secret = process.env.GOOGLE_CLIENT_SECRET;
    const redirect_uri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;

    if (!client_id || !client_secret || !redirect_uri) {
      console.error("Missing Google OAuth credentials in callback configuration");
      return NextResponse.redirect(new URL("/login?error=OAuth configuration missing", request.url));
    }

    // 1. Exchange authorization code for tokens
    const tokenUrl = "https://oauth2.googleapis.com/token";
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id,
        client_secret,
        redirect_uri,
        grant_type: "authorization_code"
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Failed to exchange code for token:", errorData);
      return NextResponse.redirect(new URL("/login?error=Failed to retrieve tokens", request.url));
    }

    const { access_token } = await tokenResponse.json();

    // 2. Fetch user information from Google API
    const userinfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
    const userinfoResponse = await fetch(userinfoUrl, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    if (!userinfoResponse.ok) {
      console.error("Failed to fetch Google userinfo");
      return NextResponse.redirect(new URL("/login?error=Failed to retrieve user profile", request.url));
    }

    const googleUser = await userinfoResponse.json();
    const { email, name } = googleUser;

    if (!email) {
      return NextResponse.redirect(new URL("/login?error=No email provided by Google", request.url));
    }

    // 3. Find or create the user in the database
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Create a new user with Google login
      // Since it's a new user, passwordHash will be set to a random, unguessable string
      const randomPasswordHash = crypto.randomBytes(32).toString("hex");
      user = await prisma.user.create({
        data: {
          email,
          fullName: name || "Google User",
          passwordHash: randomPasswordHash, // secure placeholder
          role: "USER",
          isOnboarded: false
        }
      });
    }

    // 4. Generate custom JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // 5. Determine target redirect URL depending on onboarding state
    let targetUrl = "/onboarding";
    if (user.role === "ADMIN") {
      targetUrl = "/admin/dashboard";
    } else if (user.isOnboarded) {
      targetUrl = "/dashboard";
    }

    const response = NextResponse.redirect(new URL(targetUrl, request.url));

    // 6. Save authentication token directly on the redirect response object
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/"
    });

    return response;
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(new URL("/login?error=Internal server error during authentication", request.url));
  }
}
