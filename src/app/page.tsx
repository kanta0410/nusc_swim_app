import { redirect } from 'next/navigation'
import { getSession } from './actions'

export default async function Home() {
  const session = await getSession()

  if (session) {
    if (session.role === 'admin' || session.name === '管理者') {
      redirect('/admin')
    } else {
      redirect('/student')
    }
  }

  redirect('/login')
}
