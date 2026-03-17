import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const students = db.getStudents().filter((s) => s.role === "student");
  return NextResponse.json(students);
}

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "名前を入力してください" }, { status: 400 });
  }
  const existing = db.getStudentByName(name.trim());
  if (existing) {
    return NextResponse.json({ error: "同じ名前の生徒が既に存在します" }, { status: 400 });
  }
  const student = db.addStudent(name.trim());
  return NextResponse.json(student);
}
