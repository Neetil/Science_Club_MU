import { cookies } from "next/headers";
import { prisma } from "@/lib/data";
import * as bcrypt from "bcrypt";

// For backward compatibility, check env vars first
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  // First, try environment variables (backward compatibility)
  if (ADMIN_USERNAME && ADMIN_PASSWORD) {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      return true;
    }
  }

  // Then check database
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !user.active) {
      return false;
    }

    // Compare hashed password
    return await bcrypt.compare(password, user.password);
  } catch (error) {
    console.error("Error verifying credentials:", error);
    return false;
  }
}

export async function createSession(username: string) {
  const cookieStore = await cookies();
  // Session cookie - expires when browser closes (no maxAge)
  // This ensures users must login again every time they open the browser
  cookieStore.set("admin-auth", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    // No maxAge = session cookie (expires when browser closes)
  });
  // Store username in a separate cookie (not httpOnly so client can read it)
  cookieStore.set("admin-username", username, {
    httpOnly: false, // Allow client-side access to display username
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    // No maxAge = session cookie (expires when browser closes)
  });
}

export async function getUsername(): Promise<string | null> {
  const cookieStore = await cookies();
  const usernameCookie = cookieStore.get("admin-username");
  return usernameCookie?.value || null;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("admin-auth");
  cookieStore.delete("admin-username");
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("admin-auth");
  return authCookie?.value === "authenticated";
}

