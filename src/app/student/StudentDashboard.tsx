'use client'

import { useState } from 'react'
import { format, isSameDay } from 'date-fns'
import { ja } from 'date-fns/locale'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { Drawer } from 'vaul'
import { addAbsence, deleteAbsence } from '../actions'

type Absence = {
  id: string
  reason: string
  reason_detail: string | null
  student_id: string
}

type Activity = {
  id: string
  date: Date
  time_slot: string
  location: string
  absences: Absence[]
}

export default function StudentDashboard({ activities, studentId }: { activities: Activity[], studentId: string }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [reason, setReason] = useState('学校行事')
  const [customReason, setCustomReason] = useState('')

  const handleDayClick = (day: Date) => {
    setSelectedDate(day)
    setReason('学校行事')
    setCustomReason('')
    setIsDrawerOpen(true)
  }

  // 未来の活動だけフィルタ（過去は表示用として残しても良いが、今回は表示）
  const upcomingActivities = activities.filter(a => new Date(a.date) >= new Date(new Date().setHours(0,0,0,0)))
  const activityDays = activities.map(a => new Date(a.date))
  const modifiers = { hasActivity: activityDays }

  const currentDayActivities = selectedDate 
    ? activities.filter(a => isSameDay(new Date(a.date), selectedDate))
    : []

  const renderDayContent = (day: Date) => {
    const actForDay = activities.filter(a => isSameDay(new Date(a.date), day))
    // 自分が欠席登録しているか
    const myAbsenceCount = actForDay.reduce((acc, act) => acc + (act.absences.some(ab => ab.student_id === studentId) ? 1 : 0), 0)

    return (
      <div className="relative w-full h-full flex flex-col items-center justify-start pt-1">
        <span className="text-base font-medium text-slate-700">{format(day, 'd')}</span>
        
        {/* 活動ありのドット表示 */}
        {actForDay.length > 0 && myAbsenceCount === 0 && (
          <div className="has-activity-indicator mt-1" />
        )}

        {/* 自分の欠席がある場合は赤字のラベル表示 */}
        {myAbsenceCount > 0 && (
          <div className="absence-badge mt-1">休</div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-4 rounded-2xl shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-2 px-2">カレンダー</h2>
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

      <div className="bg-white p-5 rounded-2xl shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">リスト表示 (今後の活動)</h2>
        {upcomingActivities.length === 0 ? (
          <div className="text-center py-6 text-slate-500 font-medium bg-slate-50 rounded-xl">
            予定されている活動はありません。
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingActivities.map(act => {
              const myAbsence = act.absences.find(ab => ab.student_id === studentId)
              return (
                <div 
                  key={act.id} 
                  className={`relative p-5 rounded-xl border transition cursor-pointer active:scale-[0.98] ${
                    myAbsence ? 'bg-red-50/50 border-red-200' : 'bg-slate-50 border-slate-200 shadow-sm'
                  }`}
                  onClick={() => handleDayClick(new Date(act.date))}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-bold text-blue-900 text-lg">
                      {format(new Date(act.date), 'M月d日(E)', { locale: ja })}
                    </div>
                    {myAbsence && (
                      <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full ring-1 ring-red-200">
                        欠席登録済
                      </span>
                    )}
                  </div>
                  <div className="text-slate-600 text-sm font-medium">
                    場所: {act.location} / 時間: {act.time_slot}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ドロワー: 欠席登録 / 取り消し詳細 */}
      <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-slate-900/40 z-50 transition-opacity" />
          <Drawer.Content className="bg-white flex flex-col rounded-t-[20px] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-50 shadow-2xl">
            <div className="p-4 bg-white flex-1 h-full overflow-y-auto rounded-t-[20px] pb-24">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-200 mb-8" />
              
              <Drawer.Title className="text-2xl font-bold mb-6 text-slate-800">
                {selectedDate ? format(selectedDate, 'M月d日(E)', { locale: ja }) : ''} の予定
              </Drawer.Title>

              {currentDayActivities.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-xl text-center">
                  <p className="text-slate-500 font-medium text-base">この日に登録されている活動はありません。</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {currentDayActivities.map((act) => {
                    const myAbsence = act.absences.find(ab => ab.student_id === studentId)

                    return (
                      <div key={act.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                        <div className="mb-4">
                          <div className="text-sm text-slate-500 font-semibold mb-1">場所・時間</div>
                          <div className="font-bold text-lg text-slate-900">{act.location} ({act.time_slot})</div>
                        </div>

                        {myAbsence ? (
                          <div className="mt-6 pt-6 border-t border-slate-200">
                            <div className="font-bold text-red-600 mb-3 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-red-400" />
                              現在この活動は欠席登録されています
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-4 text-sm font-medium text-slate-700">
                              理由: {myAbsence.reason} {myAbsence.reason_detail && `(${myAbsence.reason_detail})`}
                            </div>
                            <button 
                              onClick={async () => {
                                if (confirm('欠席登録を取り消しますか？')) {
                                  await deleteAbsence(myAbsence.id)
                                  setIsDrawerOpen(false)
                                }
                              }}
                              className="w-full text-red-600 bg-red-50 font-bold border border-red-200 rounded-xl px-4 py-3 min-h-[48px] active:bg-red-100 transition shadow-sm"
                            >
                              欠席を取り消す
                            </button>
                          </div>
                        ) : (
                          <div className="mt-6 pt-6 border-t border-slate-200">
                            <h3 className="text-lg font-bold mb-4 text-slate-800">欠席を登録する</h3>
                            <form action={async (formData) => {
                              formData.append('activity_id', act.id)
                              await addAbsence(formData)
                              setIsDrawerOpen(false)
                            }} className="space-y-4">
                              <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">理由を選択</label>
                                <select 
                                  name="reason" 
                                  value={reason}
                                  onChange={(e) => setReason(e.target.value)}
                                  className="w-full border-slate-300 bg-white border rounded-xl px-4 py-3 min-h-[48px] text-base font-medium text-slate-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                >
                                  <option value="学校行事">🎓 学校行事</option>
                                  <option value="体調不良">🤒 体調不良</option>
                                  <option value="家庭の用事">🏠 家庭の用事</option>
                                  <option value="その他">📝 その他</option>
                                </select>
                              </div>

                              {reason === 'その他' && (
                                <div className="animate-in slide-in-from-top-2 duration-300 ease-out">
                                  <label className="block text-sm font-bold text-slate-700 mb-2">詳細を入力 (10文字以上推奨)</label>
                                  <textarea 
                                    required 
                                    name="reason_detail" 
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    className="w-full border-slate-300 border rounded-xl px-4 py-3 min-h-[100px] text-base shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" 
                                    placeholder="欠席の理由を具体的に入力してください..."
                                  />
                                </div>
                              )}
                              
                              <button 
                                type="submit" 
                                className="w-full !mt-6 min-h-[48px] text-lg bg-blue-600 text-white font-bold rounded-xl active:bg-blue-700 shadow-md transition"
                              >
                                欠席を確定する
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  )
}
