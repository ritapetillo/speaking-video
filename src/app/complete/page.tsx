"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useStudent } from "@/context/StudentContext"
import type { ESLCriteria } from "@/types/evaluation"

type Recording = {
  questionId: string
  vimeoUrl: string
  evaluation?: ESLCriteria
}

export default function CompletePage() {
  const router = useRouter()
  const { studentId, setStudentId } = useStudent()

  useEffect(() => {
    if (!studentId) {
      router.push("/")
    }
  }, [studentId, router])

  // Get recordings from URL
  const recordings: Recording[] = (() => {
    if (typeof window === "undefined") return []
    const params = new URLSearchParams(window.location.search)
    const recordingsStr = params.get("recordings")
    return recordingsStr ? JSON.parse(decodeURIComponent(recordingsStr)) : []
  })()

  // Calculate average scores
  const averageScores = recordings.reduce(
    (acc, rec) => {
      if (rec.evaluation) {
        acc.fluency += rec.evaluation.fluency
        acc.pronunciation += rec.evaluation.pronunciation
        acc.intelligibility += rec.evaluation.intelligibility
        acc.count++
      }
      return acc
    },
    { fluency: 0, pronunciation: 0, intelligibility: 0, count: 0 }
  )

  const finalScores = {
    fluency: Math.round(
      averageScores.count ? averageScores.fluency / averageScores.count : 0
    ),
    pronunciation: Math.round(
      averageScores.count
        ? averageScores.pronunciation / averageScores.count
        : 0
    ),
    intelligibility: Math.round(
      averageScores.count
        ? averageScores.intelligibility / averageScores.count
        : 0
    ),
  }

  const handleFinish = () => {
    setStudentId(null)
    router.push("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full space-y-8 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Test Completed!
          </h2>
          <p className="text-gray-600 mb-8">
            Thank you for completing the speaking test. Here are your results:
          </p>

          {/* Overall Scores */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Overall Performance
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <ScoreCard
                title="Fluency"
                score={finalScores.fluency}
                description="Speech flow and natural pacing"
              />
              <ScoreCard
                title="Pronunciation"
                score={finalScores.pronunciation}
                description="Sound clarity and intonation"
              />
              <ScoreCard
                title="Intelligibility"
                score={finalScores.intelligibility}
                description="Overall clarity and understanding"
              />
            </div>
          </div>

          {/* Individual Question Feedback */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Detailed Feedback
            </h3>
            <div className="space-y-4">
              {recordings.map((recording, index) => (
                <div
                  key={recording.questionId}
                  className="border-b pb-4 last:border-b-0"
                >
                  <h4 className="font-medium mb-2">Question {index + 1}</h4>
                  {recording.evaluation && (
                    <div className="text-sm text-gray-600 space-y-2">
                      <p>{recording.evaluation.feedback.fluency}</p>
                      <p>{recording.evaluation.feedback.pronunciation}</p>
                      <p>{recording.evaluation.feedback.intelligibility}</p>
                      <p className="text-gray-800 font-medium mt-2">
                        {recording.evaluation.feedback.overall}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  )
}

function ScoreCard({
  title,
  score,
  description,
}: {
  title: string
  score: number
  description: string
}) {
  return (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
      <div className="text-2xl font-bold text-gray-900 mb-1">{score}%</div>
      <div className="font-medium text-gray-800 mb-1">{title}</div>
      <div className="text-sm text-gray-600">{description}</div>
    </div>
  )
}
