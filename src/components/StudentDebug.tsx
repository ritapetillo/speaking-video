"use client"

import { useStudent } from "@/context/StudentContext"

export function StudentDebug() {
  const { studentId } = useStudent()
  return (
    <div className="fixed bottom-2 right-2 text-xs space-y-1">
      <div>Context Status:</div>
      <div>Student ID: {studentId || "Not set"}</div>
      <div>Path: {window.location.pathname}</div>
    </div>
  )
}
