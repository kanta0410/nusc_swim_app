"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { getDaysInMonth, getFirstDayOfMonth, toDateString } from "@/lib/utils";
import { Activity, Absence } from "@/types";
import { cn } from "@/lib/utils";

interface CalendarProps {
  year: number;
  month: number;
  activities: Activity[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (dateStr: string, activity?: Activity) => void;
  role: "admin" | "student";
  absences?: Absence[];
  absenceCounts?: Record<string, number>; // activity_id -> count (admin)
  onAbsenceBadgeClick?: (activity: Activity) => void;
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function Calendar({
  year,
  month,
  activities,
  onPrevMonth,
  onNextMonth,
  onDayClick,
  role,
  absences = [],
  absenceCounts = {},
  onAbsenceBadgeClick,
}: CalendarProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  const todayStr = toDateString(today.getFullYear(), today.getMonth() + 1, today.getDate());

  const activityMap = new Map<string, Activity>();
  for (const a of activities) activityMap.set(a.date, a);

  const absenceActivityIds = new Set(absences.map((a) => a.activity_id));

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const themeColor = role === "admin" ? "blue" : "green";

  return (
    <div className="card">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h2 className="text-lg font-bold text-gray-900">
          {year}年 {month}月
        </h2>
        <button
          onClick={onNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            className={cn(
              "text-center text-xs font-semibold py-1",
              i === 0 && "text-red-500",
              i === 6 && "text-blue-500",
              i > 0 && i < 6 && "text-gray-500"
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day Grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;

          const dateStr = toDateString(year, month, day);
          const activity = activityMap.get(dateStr);
          const isToday = dateStr === todayStr;
          const absenceCount = activity ? (absenceCounts[activity.id] ?? 0) : 0;
          const hasAbsence = activity ? absenceActivityIds.has(activity.id) : false;
          const weekday = (idx % 7);

          return (
            <div
              key={dateStr}
              onClick={() => onDayClick(dateStr, activity)}
              className={cn(
                "relative min-h-[64px] sm:min-h-[80px] p-1 rounded-lg cursor-pointer transition-all duration-150 border",
                activity
                  ? themeColor === "blue"
                    ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                    : "bg-green-50 border-green-200 hover:bg-green-100"
                  : "bg-white border-gray-100 hover:bg-gray-50",
                isToday && "ring-2 ring-offset-1 ring-yellow-400"
              )}
            >
              {/* Day number */}
              <span
                className={cn(
                  "text-xs sm:text-sm font-semibold",
                  weekday === 0 && "text-red-500",
                  weekday === 6 && "text-blue-500",
                  weekday > 0 && weekday < 6 && "text-gray-700",
                  isToday &&
                    "bg-yellow-400 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs"
                )}
              >
                {day}
              </span>

              {/* Activity badge */}
              {activity && (
                <div className="mt-0.5 space-y-0.5">
                  <div
                    className={cn(
                      "text-[9px] sm:text-[10px] font-medium px-1 rounded truncate",
                      themeColor === "blue"
                        ? "bg-blue-500 text-white"
                        : "bg-green-500 text-white"
                    )}
                  >
                    {activity.location}
                  </div>
                  <div
                    className={cn(
                      "text-[9px] sm:text-[10px] px-1 rounded truncate",
                      themeColor === "blue"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    )}
                  >
                    {activity.time_slot}
                  </div>
                </div>
              )}

              {/* Absence badge (admin) */}
              {role === "admin" && activity && absenceCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAbsenceBadgeClick?.(activity);
                  }}
                  className="absolute bottom-1 right-1 bg-red-500 text-white text-[9px] rounded-full px-1.5 py-0.5 font-bold hover:bg-red-600 transition-colors"
                >
                  欠{absenceCount}
                </button>
              )}

              {/* Absence reported badge (student) */}
              {role === "student" && activity && hasAbsence && (
                <div className="absolute bottom-1 right-1 bg-orange-400 text-white text-[9px] rounded-full px-1 py-0.5 font-bold">
                  済
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
        {role === "admin" ? (
          <>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
              活動あり
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-500 inline-block" />
              欠席あり
            </span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-500 inline-block" />
              活動あり（タップで欠席連絡）
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-orange-400 inline-block" />
              欠席連絡済
            </span>
          </>
        )}
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded ring-2 ring-yellow-400 inline-block" />
          今日
        </span>
      </div>
    </div>
  );
}
