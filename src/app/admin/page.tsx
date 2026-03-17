import { redirect } from 'next/navigation'
import { getSession, getActivities, getStudents } from '../actions'
import AdminDashboard from './AdminDashboard'

export default async function AdminPage() {
  const session = await getSession()
  if (!session || (session.role !== 'admin' && session.name !== '管理者')) {
    redirect('/login')
  }

  const activities = await getActivities()
  const students = await getStudents()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">管理者ダッシュボード</h1>
          <form action="/login" method="GET">
            <button type="submit" className="text-sm border rounded px-3 py-1 hover:bg-slate-100">ログアウト</button>
          </form>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <AdminDashboard activities={activities} students={students} />
        </div>
      </main>
    </div>
  )
}
