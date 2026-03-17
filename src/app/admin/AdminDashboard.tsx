'use client'

import { useState } from 'react'
import { format, isSameDay } from 'date-fns'
import { ja } from 'date-fns/locale'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { Drawer } from 'vaul'
import { addActivity, registerStudent } from '../actions'

type Student = {
  id: string
  name: string
  role: string
  isNewStudent?: boolean
}

type Absence = {
  id: string
  type: string
  reason: string
  reason_detail: string | null
  student: { name: string }
}



type Activity = {
  id: string
  date: Date
  time_slot: string
  location: string
  absences: Absence[]
}

export default function AdminDashboard({ activities, students }: { activities: Activity[], students: Student[] }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [showAddStudent, setShowAddStudent] = useState(false)
  
  const handleDayClick = (day: Date) => {
    setSelectedDate(day)
    setIsDrawerOpen(true)
  }

  // selectedDateの活動リスト
  const currentDayActivities = selectedDate 
    ? activities.filter(a => isSameDay(new Date(a.date), selectedDate))
    : []

  // カレンダーに活動がある日を強調するための修飾子
  const activityDays = activities.map(a => new Date(a.date))
  const modifiers = { hasActivity: activityDays }
  
  const renderDayContent = (day: Date) => {
    const actForDay = activities.filter(a => isSameDay(new Date(a.date), day))
    const totalAbsences = actForDay.reduce((acc, act) => acc + act.absences.filter(ab => ab.type === 'absence').length, 0)
    const totalAttendances = actForDay.reduce((acc, act) => acc + act.absences.filter(ab => ab.type === 'attendance').length, 0)

    return (
      <div className="relative w-full h-full flex flex-col items-center justify-start pt-1">
        <span className="text-base font-medium text-slate-700">{format(day, 'd')}</span>
        {actForDay.length > 0 && (
          <div className="has-activity-indicator mt-1" />
        )}
        <div className="flex flex-col gap-0.5 mt-0.5">
          {totalAbsences > 0 && (
            <div className="absence-badge text-[10px] px-1 py-0">{totalAbsences}休</div>
          )}
          {totalAttendances > 0 && (
            <div className="bg-emerald-500 text-white text-[10px] px-1 py-0 rounded-sm font-bold">{totalAttendances}出</div>
          )}
        </div>
      </div>
    )
  }


  return (
    <div className="space-y-6 pb-20">
      {/* カレンダーエリア */}
      <div className="bg-white rounded-2xl shadow-sm p-4 w-full mx-auto">
        <DayPicker 
          mode="single"
          selected={selectedDate}
          onSelect={(day) => {
            if (day) handleDayClick(day)
          }}
          locale={ja}
          modifiers={modifiers}
          modifiersClassNames={{
            hasActivity: 'bg-blue-50/50 rounded-lg'
          }}
          components={{
            DayButton: (props) => {
              const { day, modifiers, ...buttonProps } = props as any
              return (
                <button {...buttonProps} className={`${buttonProps.className} relative h-[60px] w-full focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg`}>
                  {renderDayContent(day.date)}
                </button>
              )
            }
          }}
          className="w-full"
        />
      </div>

      {/* 生徒一覧エリア */}
      <div className="bg-white p-5 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800">生徒一覧 ({students.length}名)</h2>
          <button 
            onClick={() => setShowAddStudent(true)}
            className="bg-slate-800 text-white px-4 py-2 min-h-[44px] rounded-xl text-sm font-bold hover:bg-slate-700 transition"
          >
            生徒を登録
          </button>
        </div>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead>
              <tr>
                <th className="py-3 text-left font-medium text-slate-400">名前</th>
                <th className="py-3 text-left font-medium text-slate-400">権限</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map(s => (
                <tr key={s.id}>
                  <td className="py-3 font-medium text-slate-700">
                    {s.name}
                    {s.isNewStudent && <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">新入生</span>}
                  </td>
                  <td className="py-3 text-slate-500">{s.role === 'admin' ? '管理者' : '生徒'}</td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>
      </div>

      {/* ドロワー: 活動詳細と登録 */}
      <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-slate-900/40 z-50 transition-opacity" />
          <Drawer.Content className="bg-white flex flex-col rounded-t-[20px] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-50 shadow-2xl">
            <div className="p-4 bg-white flex-1 h-full overflow-y-auto rounded-t-[20px]">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-200 mb-8" />
              
              <Drawer.Title className="text-2xl font-bold mb-6 text-slate-800">
                {selectedDate ? format(selectedDate, 'M月d日(E)', { locale: ja }) : ''} の活動
              </Drawer.Title>

              {/* 活動一覧と欠席者 */}
              <div className="space-y-6 mb-8">
                {currentDayActivities.length === 0 ? (
                  <p className="text-slate-500 font-medium">この日の活動はまだ登録されていません。</p>
                ) : (
                  currentDayActivities.map((act, index) => (
                    <div key={act.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                      <div className="font-bold text-lg mb-1 text-blue-900">活動 {index + 1}</div>
                      <div className="text-sm text-slate-600 space-y-1 mb-4">
                        <div>場所: <span className="font-semibold text-slate-900">{act.location}</span></div>
                        <div>時間: <span className="font-semibold text-slate-900">{act.time_slot}</span></div>
                      </div>

                      <div className="pt-4 border-t border-slate-200">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="font-bold text-[10px] text-red-600 flex items-center gap-1 mb-2 uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              欠席 ({act.absences.filter(ab => ab.type === 'absence').length})
                            </div>
                            {act.absences.filter(ab => ab.type === 'absence').length > 0 ? (
                              <ul className="space-y-1">
                                {act.absences.filter(ab => ab.type === 'absence').map(ab => (
                                  <li key={ab.id} className="text-xs bg-white p-2 rounded border border-slate-100 shadow-sm leading-tight">
                                    <div className="font-bold text-slate-800">{ab.student.name}</div>
                                    <div className="text-slate-400 mt-0.5 truncate">{ab.reason}</div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-[10px] text-slate-400 font-medium">なし</p>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-[10px] text-emerald-600 flex items-center gap-1 mb-2 uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              出席 ({act.absences.filter(ab => ab.type === 'attendance').length})
                            </div>
                            {act.absences.filter(ab => ab.type === 'attendance').length > 0 ? (
                              <ul className="space-y-1">
                                {act.absences.filter(ab => ab.type === 'attendance').map(ab => (
                                  <li key={ab.id} className="text-xs bg-white p-2 rounded border border-slate-100 shadow-sm leading-tight">
                                    <div className="font-bold text-slate-800">{ab.student.name}</div>
                                    <div className="text-slate-400 mt-0.5 truncate">{ab.reason}</div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-[10px] text-slate-400 font-medium">なし</p>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>

              {/* 新規登録フォーム */}
              <div className="border-t-2 border-slate-100 pt-6 mt-6 pb-20">
                <h3 className="text-lg font-bold mb-4 text-slate-800">この日に新しい活動を追加</h3>
                <form action={async (formData) => {
                  if (selectedDate) {
                    formData.append('date', selectedDate.toISOString())
                    await addActivity(formData)
                    setIsDrawerOpen(false)
                  }
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">場所</label>
                    <input 
                      required name="location" type="text" 
                      className="w-full border-slate-300 border rounded-xl px-4 py-3 min-h-[44px] text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      placeholder="例: 第1体育館"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">時間</label>
                    <input 
                      required name="time_slot" type="text" 
                      className="w-full border-slate-300 border rounded-xl px-4 py-3 min-h-[44px] text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      placeholder="例: 13:00~15:00"
                    />
                  </div>
                  <button type="submit" className="w-full mt-4 min-h-[48px] text-base bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:bg-blue-800 shadow-sm transition">
                    活動を登録する
                  </button>
                </form>
              </div>

            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* ドロワー: 新規生徒登録 */}
      <Drawer.Root open={showAddStudent} onOpenChange={setShowAddStudent}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-slate-900/40 z-50 transition-opacity" />
          <Drawer.Content className="bg-white flex flex-col rounded-t-[20px] h-[75vh] mt-24 fixed bottom-0 left-0 right-0 z-50 shadow-2xl">
            <div className="p-4 bg-white flex-1 h-full overflow-y-auto rounded-t-[20px]">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-200 mb-8" />
              
              <Drawer.Title className="text-2xl font-bold mb-6 text-slate-800">新規生徒登録</Drawer.Title>
              
              <form action={async (formData) => {
                await registerStudent(formData)
                setShowAddStudent(false)
              }} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">名前 (必須・スペース可)</label>
                  <input 
                    required name="name" type="text" 
                    className="w-full border-slate-300 border rounded-xl px-4 py-3 min-h-[44px] text-base focus:ring-2 focus:ring-slate-800 focus:border-slate-800"
                    placeholder="例: 山田 太郎"
                  />
                  <p className="mt-2 text-xs text-slate-500">※名前比較時はスペースの有無や全角半角を無視します。</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <input 
                    id="isNewStudent" name="isNewStudent" type="checkbox" value="true"
                    className="w-5 h-5 rounded border-slate-300 text-slate-800 focus:ring-slate-800"
                  />
                  <label htmlFor="isNewStudent" className="text-sm font-bold text-slate-700">新入生として登録する</label>
                </div>

                <button type="submit" className="w-full mt-6 min-h-[48px] text-base bg-slate-800 text-white font-bold rounded-xl active:bg-slate-900 shadow-sm transition">
                  生徒を登録する
                </button>
              </form>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  )
}
