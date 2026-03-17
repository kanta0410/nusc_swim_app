import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const activities = db.getActivities();
  return NextResponse.json(activities);
}

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { date, time_slot, location } = await req.json();
  if (!date || !time_slot || !location) {
    return NextResponse.json({ error: "全ての項目を入力してください" }, { status: 400 });
  }
  const existing = db.getActivityByDate(date);
  if (existing) {
    return NextResponse.json({ error: "その日には既に活動が登録されています" }, { status: 400 });
  }
  const activity = db.addActivity(date, time_slot, location);
  return NextResponse.json(activity);
}

export async function DELETE(req: NextRequest) {
  const session = getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  db.deleteActivity(id);
  return NextResponse.json({ ok: true });
}
