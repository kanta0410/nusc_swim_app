"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { Activity, Absence } from "@/types";
import { formatDate, getWeekday } from "@/lib/utils";
import { Clock, MapPin, CheckCircle2 } from "lucide-react";

interface AbsenceFormModalProps {
  activity: Activity | null;
  studentName: string;
  existingAbsence: Absence | null;
  onClose: () => void;
  onSubmitted: (absence: Absence) => void;
}

const REASONS = ["授業", "体調不良", "その他"] as const;

export default function AbsenceFormModal({
  activity,
  studentName,
  existingAbsence,
  onClose,
  onSubmitted,
}: AbsenceFormModalProps) {
  const [reason, setReason] = useState<typeof REASONS[number]>(existingAbsence?.reason ?? "授業");
  const [detail, setDetail] = useState(existingAbsence?.reason_detail ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!activity) return null;

  const handleSubmit = async () => {
    if (reason === "その他" && !detail.trim()) {
      setError("詳細を入力してください");
      return;
    }
    setLoading(true); setError("");

    const res = await fetch("/api/absences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activity_id: activity.id,
        reason,
        reason_detail: detail.trim(),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    onSubmitted(data);
    onClose();
  };

  return (
    <Modal isOpen={!!activity} onClose={onClose} title="欠席連絡">
      <div className="space-y-4">
        {/* Activity info */}
        <div className="bg-green-50 rounded-xl p-3">
          <p className="text-green-800 font-semibold text-sm">{formatDate(activity.date)}（{getWeekday(activity.date)}）</p>
          <div className="flex gap-3 mt-1 text-green-600 text-xs">
            <span className="flex items-center gap-1"><Clock size={12} />{activity.time_slot}</span>
            <span className="flex items-center gap-1"><MapPin size={12} />{activity.location}</span>
          </div>
        </div>

        {existingAbsence ? (
          /* Already submitted */
          <div className="text-center py-4 space-y-2">
            <CheckCircle2 size={40} className="mx-auto text-green-500" />
            <p className="font-medium text-gray-800">欠席連絡済みです</p>
            <div className="bg-gray-50 rounded-lg px-4 py-2 text-sm text-gray-600 text-left space-y-1">
              <p>理由: <span className="font-medium">{existingAbsence.reason}</span></p>
              {existingAbsence.reason_detail && (
                <p>詳細: {existingAbsence.reason_detail}</p>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Student name (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">名前</label>
              <div className="input-field bg-gray-50 text-gray-600 cursor-not-allowed">{studentName}</div>
            </div>

            {/* Reason selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">欠席理由</label>
              <div className="space-y-2">
                {REASONS.map((r) => (
                  <label
                    key={r}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      reason === r
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r}
                      checked={reason === r}
                      onChange={() => { setReason(r); setDetail(""); setError(""); }}
                      className="text-green-600 w-4 h-4"
                    />
                    <span className={`text-sm font-medium ${reason === r ? "text-green-800" : "text-gray-700"}`}>{r}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Conditional detail field */}
            {reason === "その他" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">詳細を記入してください</label>
                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="欠席理由の詳細を入力..."
                  rows={3}
                  className="input-field resize-none"
                  autoFocus
                />
              </div>
            )}

            {error && (
              <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="flex-1 btn-secondary">キャンセル</button>
              <button onClick={handleSubmit} disabled={loading} className="flex-1 btn-primary-student">
                {loading ? "送信中..." : "欠席を連絡する"}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
