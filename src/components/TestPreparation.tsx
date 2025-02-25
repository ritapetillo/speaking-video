"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

const TestPreparationContent = dynamic(
  () => import("./TestPreparationContent").then((mod) => mod.default),
  { ssr: false }
)

export default function TestPreparation() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TestPreparationContent />
    </Suspense>
  )
}
