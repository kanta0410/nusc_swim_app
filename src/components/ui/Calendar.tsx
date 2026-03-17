"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, getDaysInMonth, getFirstDayOfMonth, toDateString } from "@/lib/utils";
import { Activity } from "@/types";

interface CalendarProps {
  activities: Activity[];
  onDayClick: (date: string, activity: Activity | null) => void;
  renderCell?: (date: string, activity: Activity | null) => React.ReactNode;
  theme?: "admin" | "student";
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function Calendar({ activities, onDayClick, renderCell, theme = "admin" }: CalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const activityMap = new Map(activities.map((a) => [a.date, a]));

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const themeColors = theme === "admin"
    ? { header: "bg-blue-600", activity: "bg-blue-50 border-blue-200 text-blue-800", today: "ring-2 ring-blue-400", nav: "hover:bg-blue-700" }
    : { header: "bg-green-600", activity: "bg-green-50 border-green-200 text-green-800", today: "ring-2 ring-green-400", nav: "hover:bg-green-700" };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const todayStr = toDateString(today.getFullYear(), today.getMonth() + 1, today.getDate());

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className={cn("flex items-center justify-between px-5 py-4 text-white", themeColors.header)}>
        <button onClick={prevMonth} className={cn("p-1.5 rounded-lg transition-colors", themeColors.nav)}>
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-semibold text-lg">{year}年{month}月</h3>
        <button onClick={nextMonth} className={cn("p-1.5 rounded-lg transition-colors", themeColors.nav)}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            className={cn(
              "text-center text-xs font-medium py-2",
              i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-500"
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="h-16 sm:h-20 border-b border-r border-gray-50" />;

          const dateStr = toDateString(year, month, day);
          const activity = activityMap.get(dateStr) ?? null;
          const isToday = dateStr === todayStr;
          const isSun = idx % 7 === 0;
          const isSat = idx % 7 === 6;

          return (
            <div
              key={dateStr}
              onClick={() => onDayClick(dateStr, activity)}
              className={cn(
                "h-16 sm:h-20 border-b border-r border-gray-50 p-1.5 cursor-pointer transition-all duration-150 calendar-cell",
                activity ? `${themeColors.activity} border hover:brightness-95` : "hover:bg-gray-50",
                isToday && !activity && themeColors.today
              )}
            >
              <div className={cn(
                "text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                isToday ? (theme === "admin" ? "bg-blue-600 text-white" : "bg-green-600 text-white") : "",
                !isToday && isSun ? "text-red-400" : "",
                !isToday && isSat ? "text-blue-400" : "",
                !isToday && !isSun && !isSat ? "text-gray-700" : ""
              )}>
                {day}
              </div>
              {renderCell ? renderCell(dateStr, activity) : (
                activity && (
                  <div className="text-xs leading-tight">
                    <div className="font-medium truncate">{activity.location}</div>
                    <div className="text-gray-500 truncate">{activity.time_slot}</div>
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
