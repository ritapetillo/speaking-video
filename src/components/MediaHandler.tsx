"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { useStudent } from "@/context/StudentContext"

const TestPreparationContent = dynamic(
  () => import("./TestPreparationContent"),
  {
    ssr: false,
    loading: () => null,
  }
)

export default function MediaHandler() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { studentId } = useStudent()

  useEffect(() => {
    if (!studentId) {
      router.push("/")
      return
    }
    setMounted(true)
  }, [studentId, router])

  if (!mounted) return null

  return <TestPreparationContent />
}
