import { cookies } from "next/headers";

// Require environment variables - no defaults for security
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  // Validate that credentials are configured
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    console.error("Admin credentials not configured. Please set ADMIN_USERNAME and ADMIN_PASSWORD environment variables.");
    return false;
  }
  
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export async function createSession() {
  const cookieStore = await cookies();
  cookieStore.set("admin-auth", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("admin-auth");
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin-auth");
  return authCookie?.value === "authenticated";
}

