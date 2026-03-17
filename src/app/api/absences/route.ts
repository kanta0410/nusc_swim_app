import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const activity_id = searchParams.get("activity_id");

  if (activity_id) {
    const absences = db.getAbsencesByActivity(activity_id);
    const enriched = absences.map((a) => {
      const student = db.getStudentById(a.student_id);
      return { ...a, student_name: student?.name ?? "不明" };
    });
    return NextResponse.json(enriched);
  }

  // Return all absences for the current student
  if (session.role === "student") {
    const absences = db.getAbsences().filter(
      (a) => a.student_id === session.id
    );
    return NextResponse.json(absences);
  }

  // Admin: return all
  const absences = db.getAbsences();
  return NextResponse.json(absences);
}

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { activity_id, reason, reason_detail } = await req.json();
  if (!activity_id || !reason) {
    return NextResponse.json({ error: "全ての項目を入力してください" }, { status: 400 });
  }

  const existing = db.getAbsenceByStudentAndActivity(session.id, activity_id);
  if (existing) {
    return NextResponse.json({ error: "既に欠席連絡済みです" }, { status: 400 });
  }

  const absence = db.addAbsence(
    session.id,
    activity_id,
    reason,
    reason_detail ?? ""
  );
  return NextResponse.json(absence);
}

export async function DELETE(req: NextRequest) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  db.deleteAbsence(id);
  return NextResponse.json({ ok: true });
}
