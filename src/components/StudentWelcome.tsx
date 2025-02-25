"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useStudent } from "@/context/StudentContext"

interface Student {
  id: string
  first_name: string
}

export default function StudentWelcome() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const { setStudentId } = useStudent()

  useEffect(() => {
    fetch(`/api/students?id=${searchParams.get("id")}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setStudent(data)
          setStudentId(data.id)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [searchParams, setStudentId])

  const handleStartTest = async () => {
    if (student) {
      setStudentId(student.id)
      await new Promise((resolve) => setTimeout(resolve, 100))
      router.push("/prepare")
    }
  }

  if (loading) return <div>Loading...</div>
  if (!student) return <div>Unauthorized</div>

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-bold">Welcome, {student.first_name}!</h1>
      <button
        onClick={handleStartTest}
        className="rounded-full bg-foreground text-background px-6 py-3"
      >
        Start Test
      </button>
    </div>
  )
}
