import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import LandingPageClient from "./LandingPageClient";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      redirect("/dashboard");
    }
  }

  return <LandingPageClient />;
}
