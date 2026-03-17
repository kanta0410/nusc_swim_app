'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction } from '../actions'

export default function LoginPage() {
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    const result = await loginAction(formData)

    if (result.error) {
      setError(result.error)
    } else if (result.success) {
      if (result.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/student')
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-800">NUSC</h1>
          <p className="mt-2 text-sm text-slate-500">ログインしてください</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="name">
              名前 <span className="text-xs text-slate-400 font-normal">(スペースの有無は問いません)</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-xl border border-slate-300 px-4 py-3 min-h-[48px] text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 山田 太郎"
            />
          </div>
          
          {/* パスワードは要求せず、固定値を隠しフィールドとして送信 */}
          <input type="hidden" name="password" value="nusc" />
          
          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 px-4 py-3 min-h-[48px] text-lg font-bold text-white hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
          >
            ログイン
          </button>
        </form>
      </div>
    </div>
  )
}
