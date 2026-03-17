"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { Activity } from "@/types";
import { formatDate, getWeekday } from "@/lib/utils";
import { MapPin, Clock, Trash2 } from "lucide-react";

interface ActivityModalProps {
  date: string | null;
  activity: Activity | null;
  onClose: () => void;
  onSaved: (activity: Activity) => void;
  onDeleted: (id: string) => void;
}

const TIME_OPTIONS = ["1時間", "1時間30分", "2時間", "2時間30分", "3時間", "4時間"];
const LOCATION_OPTIONS = ["テニスコート", "音楽室", "体育館", "グラウンド", "教室", "その他"];

export default function ActivityModal({ date, activity, onClose, onSaved, onDeleted }: ActivityModalProps) {
  const [timeSlot, setTimeSlot] = useState(activity?.time_slot ?? "2時間");
  const [location, setLocation] = useState(activity?.location ?? "テニスコート");
  const [customLocation, setCustomLocation] = useState(
    activity && !LOCATION_OPTIONS.includes(activity.location) ? activity.location : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!date) return null;

  const handleSave = async () => {
    const loc = location === "その他" ? customLocation.trim() : location;
    if (!loc) { setError("場所を入力してください"); return; }
    setLoading(true); setError("");

    const res = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, time_slot: timeSlot, location: loc }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    onSaved(data);
    onClose();
  };

  const handleDelete = async () => {
    if (!activity) return;
    setLoading(true);
    await fetch("/api/activities", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: activity.id }),
    });
    setLoading(false);
    onDeleted(activity.id);
    onClose();
  };

  return (
    <Modal
      isOpen={!!date}
      onClose={onClose}
      title={activity ? "活動を編集" : "活動を登録"}
    >
      <div className="space-y-4">
        {/* Date display */}
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-blue-800 font-semibold">{formatDate(date)}</p>
          <p className="text-blue-600 text-sm">（{getWeekday(date)}曜日）</p>
        </div>

        {activity ? (
          /* View/Delete mode if activity already exists */
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Clock size={16} className="text-gray-400" />
              <span className="text-sm text-gray-700">{activity.time_slot}</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <MapPin size={16} className="text-gray-400" />
              <span className="text-sm text-gray-700">{activity.location}</span>
            </div>
            <p className="text-xs text-gray-400 text-center">活動は登録済みです</p>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm"
              >
                <Trash2 size={15} />
                活動を削除
              </button>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                <p className="text-red-700 text-sm text-center font-medium">本当に削除しますか？</p>
                <p className="text-red-500 text-xs text-center">欠席データもすべて削除されます</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 btn-secondary text-sm">キャンセル</button>
                  <button onClick={handleDelete} disabled={loading} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 rounded-lg transition-colors">削除する</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Register mode */
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock size={14} className="inline mr-1" />活動時間
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeSlot(t)}
                    className={`py-2 px-2 rounded-lg text-sm border transition-colors ${
                      timeSlot === t
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin size={14} className="inline mr-1" />場所
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {LOCATION_OPTIONS.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLocation(l)}
                    className={`py-2 px-2 rounded-lg text-sm border transition-colors text-left ${
                      location === l
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              {location === "その他" && (
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="場所を入力"
                  className="input-field"
                />
              )}
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="flex-1 btn-secondary">キャンセル</button>
              <button onClick={handleSave} disabled={loading} className="flex-1 btn-primary-admin">
                {loading ? "登録中..." : "登録する"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
