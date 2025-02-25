"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

const StudentWelcome = dynamic(() => import("./StudentWelcome"), {
  ssr: false,
})

export default function ClientPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StudentWelcome />
    </Suspense>
  )
}
