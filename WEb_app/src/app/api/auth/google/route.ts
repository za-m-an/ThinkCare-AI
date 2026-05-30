import { NextResponse } from "next/server";

export async function GET() {
  const client_id = process.env.GOOGLE_CLIENT_ID;
  const redirect_uri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
  
  if (!client_id || !redirect_uri) {
    console.error("Missing Google OAuth credentials in system environment/config");
    return NextResponse.json(
      { error: "Google OAuth is not configured. Please add GOOGLE_CLIENT_ID and NEXT_PUBLIC_GOOGLE_REDIRECT_URI to .env" },
      { status: 500 }
    );
  }

  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri,
    client_id,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email"
    ].join(" ")
  };

  const qs = new URLSearchParams(options);
  return NextResponse.redirect(`${rootUrl}?${qs.toString()}`);
}
