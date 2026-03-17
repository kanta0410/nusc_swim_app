import { cookies } from "next/headers";
import { Student } from "@/types";

const SESSION_COOKIE = "nusc_session";

export function setSession(student: Student) {
  const session = JSON.stringify({
    id: student.id,
    name: student.name,
    role: student.role,
  });
  cookies().set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });
}

export function getSession(): { id: string; name: string; role: string } | null {
  try {
    const cookie = cookies().get(SESSION_COOKIE);
    if (!cookie) return null;
    return JSON.parse(cookie.value);
  } catch {
    return null;
  }
}

export function clearSession() {
  cookies().delete(SESSION_COOKIE);
}
