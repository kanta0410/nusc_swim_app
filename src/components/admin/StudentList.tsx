"use client";

import { useState } from "react";
import { Student } from "@/types";
import { UserPlus, Users } from "lucide-react";

interface StudentListProps {
  students: Student[];
  onAdded: (student: Student) => void;
}

export default function StudentList({ students, onAdded }: StudentListProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) { setError("名前を入力してください"); return; }
    setLoading(true); setError("");

    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    onAdded(data);
    setName("");
    setShowForm(false);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-blue-600" />
          <h2 className="font-semibold text-gray-900">生徒一覧</h2>
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
            {students.length}名
          </span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary-admin flex items-center gap-1.5 text-sm py-1.5 px-3"
        >
          <UserPlus size={15} />
          追加
        </button>
      </div>

      {showForm && (
        <div className="mb-4 bg-blue-50 rounded-xl p-3 space-y-2">
          <label className="block text-sm font-medium text-gray-700">氏名（漢字フルネーム）</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="例：山田花子"
            className="input-field"
            autoFocus
          />
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button onClick={() => { setShowForm(false); setName(""); setError(""); }} className="flex-1 btn-secondary text-sm">キャンセル</button>
            <button onClick={handleAdd} disabled={loading} className="flex-1 btn-primary-admin text-sm">
              {loading ? "追加中..." : "追加する"}
            </button>
          </div>
        </div>
      )}

      {students.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">生徒が登録されていません</p>
      ) : (
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {students.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </div>
              <span className="text-sm text-gray-800">{s.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
