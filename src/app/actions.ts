'use server'

import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

function normalizeName(name: string) {
  return name.replace(/\s+/g, '')
}

export async function loginAction(formData: FormData) {
  const name = formData.get('name') as string
  const password = formData.get('password') as string

  if (!name || password !== 'nusc') {
    return { error: '名前が未入力、またはパスワードが間違っています。' }
  }

  const inputNameNorm = normalizeName(name)
  let students = await prisma.student.findMany()

  // 初回ログイン用の「管理者」回避
  if (inputNameNorm === '管理者' && !students.some((s: any) => normalizeName(s.name ?? '') === '管理者')) {
    const admin = await prisma.student.create({
      data: {
        name: '管理者',
        password: 'nusc',
        role: 'admin'
      }
    })
    cookies().set('auth_token', admin.id, { path: '/' })
    return { success: true, role: 'admin' }
  }

  const user = students.find((s: any) => normalizeName(s.name ?? '') === inputNameNorm)

  if (!user) {
    return { error: '登録が存在しません。管理者に確認してください。' }
  }

  cookies().set('auth_token', user.id, { path: '/' })
  return { success: true, role: user.role }
}

export async function logoutAction() {
  cookies().delete('auth_token')
}

export async function getSession() {
  const token = cookies().get('auth_token')?.value
  if (!token) return null
  const user = await prisma.student.findUnique({ where: { id: token } })
  return user
}

export async function getActivities() {
  const activities = await prisma.activity.findMany({
    include: {
      absences: {
        include: { student: true }
      }
    },
    orderBy: { date: 'asc' }
  })
  return activities
}

export async function addActivity(formData: FormData) {
  const dateObj = new Date(formData.get('date') as string)
  const time_slot = formData.get('time_slot') as string
  const location = formData.get('location') as string

  if (!dateObj || !time_slot || !location) {
    return { error: '入力が不足しています。' }
  }

  await prisma.activity.create({
    data: {
      date: dateObj,
      time_slot,
      location
    }
  })
  revalidatePath('/admin')
  return { success: true }
}

export async function registerStudent(formData: FormData) {
  let name = formData.get('name') as string
  const role = formData.get('role') as string || 'student'
  const grade = formData.get('grade') as string
  const isNewStudentFromForm = formData.get('isNewStudent') === 'true'
  const isNewStudent = isNewStudentFromForm || grade === '新入生'

  await prisma.student.create({
    data: {
      name,
      role,
      isNewStudent,
      grade
    }
  })

  revalidatePath('/admin')
  return { success: true }
}

export async function getStudents() {
  return await prisma.student.findMany()
}

export async function addAbsence(formData: FormData) {
  const session = await getSession()
  if (!session) return { error: 'ログインが必要です' }

  const activity_id = formData.get('activity_id') as string
  const reason = formData.get('reason') as string
  const reason_detail = formData.get('reason_detail') as string || null
  const type = (formData.get('type') as string) || 'absence'

  if (!activity_id || !reason) {
    return { error: '入力内容が不足しています' }
  }

  const existing = await prisma.absence.findFirst({
    where: {
      student_id: session.id,
      activity_id
    }
  })

  if (existing) {
    return { error: 'すでにこの活動への連絡を登録済みです' }
  }

  await prisma.absence.create({
    data: {
      student_id: session.id,
      activity_id,
      reason,
      reason_detail,
      type
    }
  })

  revalidatePath('/student')
  return { success: true }
}


export async function deleteAbsence(absenceId: string) {
  const session = await getSession()
  if (!session) return { error: 'ログインが必要です' }

  const existing = await prisma.absence.findUnique({ where: { id: absenceId } })
  if (!existing || existing.student_id !== session.id) return { error: '権限がありません' }

  await prisma.absence.delete({ where: { id: absenceId } })
  revalidatePath('/student')
  return { success: true }
}
