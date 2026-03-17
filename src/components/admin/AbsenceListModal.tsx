"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import { Activity, AbsenceWithStudent } from "@/types";
import { formatDate, getWeekday } from "@/lib/utils";
import { UserX, Clock, MapPin } from "lucide-react";

interface AbsenceListModalProps {
  activity: Activity | null;
  onClose: () => void;
}

const REASON_COLOR: Record<string, string> = {
  授業: "bg-purple-100 text-purple-700",
  体調不良: "bg-orange-100 text-orange-700",
  その他: "bg-gray-100 text-gray-600",
};

export default function AbsenceListModal({ activity, onClose }: AbsenceListModalProps) {
  const [absences, setAbsences] = useState<AbsenceWithStudent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activity) return;
    setLoading(true);
    fetch(`/api/absences?activity_id=${activity.id}`)
      .then((r) => r.json())
      .then((data) => { setAbsences(data); setLoading(false); });
  }, [activity]);

  if (!activity) return null;

  return (
    <Modal isOpen={!!activity} onClose={onClose} title="欠席者一覧" size="md">
      <div className="space-y-4">
        {/* Activity info */}
        <div className="bg-blue-50 rounded-xl p-3">
          <p className="text-blue-800 font-semibold text-sm">{formatDate(activity.date)}（{getWeekday(activity.date)}）</p>
          <div className="flex gap-3 mt-1 text-blue-600 text-xs">
            <span className="flex items-center gap-1"><Clock size={12} />{activity.time_slot}</span>
            <span className="flex items-center gap-1"><MapPin size={12} />{activity.location}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <span className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : absences.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <UserX size={40} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">欠席連絡はありません</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500">{absences.length}名が欠席連絡済み</p>
            {absences.map((ab) => (
              <div key={ab.id} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-sm text-gray-900">{ab.student_name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${REASON_COLOR[ab.reason]}`}>
                    {ab.reason}
                  </span>
                </div>
                {ab.reason_detail && (
                  <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5 mt-1">
                    {ab.reason_detail}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
