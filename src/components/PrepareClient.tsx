"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

const TestPreparation = dynamic(() => import("./TestPreparation"), {
  ssr: false,
})

export default function PrepareClient() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TestPreparation />
    </Suspense>
  )
}
