export type Role = "admin" | "student";

export interface Student {
  id: string;
  name: string;
  password: string;
  role: Role;
}

export interface Activity {
  id: string;
  date: string; // YYYY-MM-DD
  time_slot: string;
  location: string;
  created_at: string;
}

export type AbsenceReason = "授業" | "体調不良" | "その他";

export interface Absence {
  id: string;
  student_id: string;
  activity_id: string;
  reason: AbsenceReason;
  reason_detail: string;
  created_at: string;
}

export interface AbsenceWithStudent extends Absence {
  student_name: string;
}

export interface ActivityWithAbsences extends Activity {
  absences: AbsenceWithStudent[];
}
