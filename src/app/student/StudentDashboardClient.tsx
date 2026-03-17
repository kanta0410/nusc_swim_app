"use client";

import { useState } from "react";
import Navbar from "@/components/ui/Navbar";
import Calendar from "@/components/ui/Calendar";
import AbsenceFormModal from "@/components/student/AbsenceFormModal";
import { Activity, Absence } from "@/types";
import { CalendarDays, CheckCircle2, Info } from "lucide-react";

interface Props {
  studentId: string;
  studentName: string;
  initialActivities: Activity[];
  initialAbsences: Absence[];
}

export default function StudentDashboardClient({
  studentId,
  studentName,
  initialActivities,
  initialAbsences,
}: Props) {
  const [activities] = useState<Activity[]>(initialActivities);
  const [absences, setAbsences] = useState<Absence[]>(initialAbsences);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const absenceMap = new Map(absences.map((a) => [a.activity_id, a]));

  const handleDayClick = (_date: string, activity: Activity | null) => {
    if (!activity) return;
    setSelectedActivity(activity);
  };

  const handleAbsenceSubmitted = (absence: Absence) => {
    setAbsences((prev) => [...prev, absence]);
  };

  const renderCell = (_date: string, activity: Activity | null) => {
    if (!activity) return null;
    const hasAbsence = absenceMap.has(activity.id);
    return (
      <div className="text-xs leading-tight space-y-0.5">
        <div className="font-medium truncate text-green-800">{activity.location}</div>
        <div className="text-green-500 truncate hidden sm:block">{activity.time_slot}</div>
        {hasAbsence && (
          <div className="mt-0.5 inline-flex items-center gap-0.5 bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5 rounded-full font-medium">
            <CheckCircle2 size={10} />連絡済
          </div>
        )}
      </div>
    );
  };

  const upcomingActivities = activities
    .filter((a) => a.date >= new Date().toISOString().split("T")[0])
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar name={studentName} role="student" />

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
          <div className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">
            <CalendarDays size={15} />マイページ
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-start gap-3">
          <Info size={16} className="text-green-600 mt-0.5 shrink-0" />
          <p className="text-sm text-green-800">
            活動日をタップすると欠席連絡フォームが開きます。欠席連絡済みの日は「連絡済」と表示されます。
          </p>
        </div>

        {/* Upcoming activities */}
        {upcomingActivities.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">直近の活動</h2>
            <div className="grid gap-2 sm:grid-cols-3">
              {upcomingActivities.map((a) => {
                const hasAbsence = absenceMap.has(a.id);
                return (
                  <div
                    key={a.id}
                    onClick={() => setSelectedActivity(a)}
                    className="bg-white rounded-xl border border-gray-100 p-3 cursor-pointer hover:border-green-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-800">{a.date.replace(/-/g, "/")}</p>
                      {hasAbsence && (
                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={10} />連絡済
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{a.location} · {a.time_slot}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Calendar */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays size={16} className="text-green-600" />
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">活動カレンダー</h2>
          </div>
          <Calendar
            activities={activities}
            onDayClick={handleDayClick}
            renderCell={renderCell}
            theme="student"
          />
        </div>
      </div>

      <AbsenceFormModal
        activity={selectedActivity}
        studentName={studentName}
        existingAbsence={selectedActivity ? (absenceMap.get(selectedActivity.id) ?? null) : null}
        onClose={() => setSelectedActivity(null)}
        onSubmitted={handleAbsenceSubmitted}
      />
    </div>
  );
}
