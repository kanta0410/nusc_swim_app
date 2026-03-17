import { redirect } from 'next/navigation'
import { getSession, getActivities } from '../actions'
import StudentDashboard from './StudentDashboard'

export default async function StudentPage() {
  const session = await getSession()
  if (!session || session.role === 'admin') {
    redirect('/login')
  }

  const activities = await getActivities()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">NUSC</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700">{session.name} さん</span>
            <form action="/login" method="GET">
              <button type="submit" className="text-sm border rounded px-3 py-1 hover:bg-slate-100">ログアウト</button>
            </form>
          </div>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <StudentDashboard 
            activities={activities} 
            studentId={session!.id} 
            isNewStudent={!!session!.isNewStudent} 
          />
        </div>

      </main>
    </div>
  )
}
