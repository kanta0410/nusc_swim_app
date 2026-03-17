import { Student, Activity, Absence } from "@/types";

// Simple in-memory store (in production, replace with a real DB)
let students: Student[] = [
  { id: "1", name: "管理者太郎", password: "nusc", role: "admin" },
  { id: "2", name: "山田花子", password: "nusc", role: "student" },
  { id: "3", name: "佐藤次郎", password: "nusc", role: "student" },
  { id: "4", name: "鈴木三郎", password: "nusc", role: "student" },
  { id: "5", name: "田中四郎", password: "nusc", role: "student" },
];

let activities: Activity[] = [
  {
    id: "1",
    date: "2026-03-15",
    time_slot: "2時間",
    location: "テニスコート",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    date: "2026-03-18",
    time_slot: "3時間",
    location: "音楽室",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    date: "2026-03-22",
    time_slot: "2時間",
    location: "体育館",
    created_at: new Date().toISOString(),
  },
];

let absences: Absence[] = [
  {
    id: "1",
    student_id: "2",
    activity_id: "1",
    reason: "授業",
    reason_detail: "",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    student_id: "3",
    activity_id: "1",
    reason: "体調不良",
    reason_detail: "風邪を引いてしまいました",
    created_at: new Date().toISOString(),
  },
];

let nextStudentId = 6;
let nextActivityId = 4;
let nextAbsenceId = 3;

export const db = {
  // Students
  getStudents: () => students,
  getStudentByName: (name: string) =>
    students.find((s) => s.name === name),
  getStudentById: (id: string) =>
    students.find((s) => s.id === id),
  addStudent: (name: string): Student => {
    const student: Student = {
      id: String(nextStudentId++),
      name,
      password: "nusc",
      role: "student",
    };
    students.push(student);
    return student;
  },

  // Activities
  getActivities: () => activities,
  getActivityById: (id: string) =>
    activities.find((a) => a.id === id),
  getActivityByDate: (date: string) =>
    activities.find((a) => a.date === date),
  addActivity: (
    date: string,
    time_slot: string,
    location: string
  ): Activity => {
    const activity: Activity = {
      id: String(nextActivityId++),
      date,
      time_slot,
      location,
      created_at: new Date().toISOString(),
    };
    activities.push(activity);
    return activity;
  },
  deleteActivity: (id: string) => {
    activities = activities.filter((a) => a.id !== id);
    absences = absences.filter((ab) => ab.activity_id !== id);
  },

  // Absences
  getAbsences: () => absences,
  getAbsencesByActivity: (activity_id: string) =>
    absences.filter((a) => a.activity_id === activity_id),
  getAbsenceByStudentAndActivity: (
    student_id: string,
    activity_id: string
  ) =>
    absences.find(
      (a) => a.student_id === student_id && a.activity_id === activity_id
    ),
  addAbsence: (
    student_id: string,
    activity_id: string,
    reason: Absence["reason"],
    reason_detail: string
  ): Absence => {
    const absence: Absence = {
      id: String(nextAbsenceId++),
      student_id,
      activity_id,
      reason,
      reason_detail,
      created_at: new Date().toISOString(),
    };
    absences.push(absence);
    return absence;
  },
  deleteAbsence: (id: string) => {
    absences = absences.filter((a) => a.id !== id);
  },
};
