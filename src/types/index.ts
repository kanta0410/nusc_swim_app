export type Role = "admin" | "student";

export interface Student {
  id: string;
  name: string;
  password: string;
  role: Role;
  isNewStudent?: boolean;
  grade?: string | null;
}


export interface Activity {
  id: string;
  date: string; // YYYY-MM-DD
  time_slot: string;
  location: string;
  created_at: string;
}

export type AbsenceType = "absence" | "attendance";
export type AbsenceReason = "授業" | "体調不良" | "出席" | "その他";

export interface Absence {
  id: string;
  student_id: string;
  activity_id: string;
  type: AbsenceType;
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
