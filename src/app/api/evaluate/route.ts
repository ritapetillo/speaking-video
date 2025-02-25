import { NextResponse } from "next/server"
import type { ESLCriteria, SpeechAnalysis } from "@/types/evaluation"

const ASSEMBLY_AI_KEY = process.env.ASSEMBLY_AI_KEY

if (!ASSEMBLY_AI_KEY) {
  throw new Error("Missing AssemblyAI API key")
}

export async function POST(request: Request) {
  try {
    const { audioUrl } = await request.json()
    console.log("Starting evaluation for audio:", audioUrl)

    // Start transcription
    const response = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        Authorization: ASSEMBLY_AI_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        language_detection: true,
        speech_threshold: 0.2,
        format_text: true,
        auto_highlights: true,
        content_safety: true,
        speech_analytics: true,
      }),
    })

    const initialData = await response.json()
    console.log("Transcription initiated:", {
      id: initialData.id,
      status: initialData.status,
    })

    // Poll for results
    const result = await pollTranscriptionResult(initialData.id)
    console.log("Transcription completed:", {
      text: result.text?.slice(0, 100) + "...", // First 100 chars
      confidence: result.confidence,
      language: result.language,
      duration: result.audio_duration,
      speechRate: result.acoustic_analysis?.speech_rate,
    })

    // Analyze ESL criteria
    const evaluation = analyzeESLCriteria(result)
    console.log("Evaluation results:", {
      scores: {
        fluency: evaluation.fluency,
        pronunciation: evaluation.pronunciation,
        intelligibility: evaluation.intelligibility,
      },
      feedback: evaluation.feedback,
    })

    return NextResponse.json(evaluation)
  } catch (error) {
    console.error("Evaluation error:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
    })
    return NextResponse.json(
      { error: "Failed to evaluate speech" },
      { status: 500 }
    )
  }
}

async function pollTranscriptionResult(
  transcriptId: string
): Promise<SpeechAnalysis> {
  const maxAttempts = 30
  const pollingInterval = 1000 // 1 second
  console.log(`Starting to poll for transcription ${transcriptId}`)

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    console.log(`Polling attempt ${attempt + 1}/${maxAttempts}`)

    const response = await fetch(
      `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
      {
        headers: {
          Authorization: ASSEMBLY_AI_KEY!,
        },
      }
    )

    const result = await response.json()
    console.log("Poll response status:", result.status)

    if (result.status === "completed") {
      return result
    }

    if (result.status === "error") {
      console.error("Transcription failed:", result.error)
      throw new Error("Transcription failed")
    }

    await new Promise((resolve) => setTimeout(resolve, pollingInterval))
  }

  throw new Error("Transcription timeout")
}

function analyzeESLCriteria(analysis: SpeechAnalysis): ESLCriteria {
  // Calculate fluency score based on speech rate, pauses, and duration
  const fluencyScore = calculateFluencyScore({
    speechRate: analysis.acoustic_analysis.speech_rate,
    pauseCount: analysis.pause_count,
    speechDuration: analysis.speech_duration,
    audioDuration: analysis.audio_duration,
  })

  // Calculate pronunciation score
  const pronunciationScore = analysis.acoustic_analysis.pronunciation_score

  // Calculate intelligibility based on clarity and confidence
  const intelligibilityScore =
    analysis.acoustic_analysis.clarity_score * 0.6 + analysis.confidence * 40

  // Generate detailed feedback
  const feedback = generateDetailedFeedback({
    fluency: fluencyScore,
    pronunciation: pronunciationScore,
    intelligibility: intelligibilityScore,
    speechRate: analysis.acoustic_analysis.speech_rate,
    pauseCount: analysis.pause_count,
  })

  return {
    fluency: Math.round(fluencyScore),
    pronunciation: Math.round(pronunciationScore),
    intelligibility: Math.round(intelligibilityScore),
    feedback,
  }
}

function calculateFluencyScore(params: {
  speechRate: number
  pauseCount: number
  speechDuration: number
  audioDuration: number
}): number {
  // Ideal speech rate range: 120-180 words per minute
  const rateScore = Math.max(0, 100 - Math.abs(150 - params.speechRate))

  // Penalize for excessive pauses
  const pauseRatio = params.pauseCount / (params.speechDuration / 60)
  const pauseScore = Math.max(0, 100 - pauseRatio * 20)

  // Calculate speech-to-audio ratio (speaking time vs total time)
  const continuityScore = (params.speechDuration / params.audioDuration) * 100

  return rateScore * 0.4 + pauseScore * 0.3 + continuityScore * 0.3
}

function generateDetailedFeedback(params: {
  fluency: number
  pronunciation: number
  intelligibility: number
  speechRate: number
  pauseCount: number
}): {
  fluency: string
  pronunciation: string
  intelligibility: string
  overall: string
} {
  const feedback = {
    fluency: "",
    pronunciation: "",
    intelligibility: "",
    overall: "",
  }

  // Fluency feedback
  if (params.fluency < 60) {
    feedback.fluency =
      "Try to speak more continuously with fewer pauses. Practice connecting your ideas smoothly."
  } else if (params.fluency < 80) {
    feedback.fluency =
      "Your speech flow is good but could be more natural. Focus on maintaining a steady pace."
  } else {
    feedback.fluency = "Excellent speech flow and natural pacing!"
  }

  // Pronunciation feedback
  if (params.pronunciation < 60) {
    feedback.pronunciation =
      "Focus on clear pronunciation of individual sounds. Practice stress and intonation patterns."
  } else if (params.pronunciation < 80) {
    feedback.pronunciation =
      "Good pronunciation with some areas for improvement. Pay attention to stress patterns."
  } else {
    feedback.pronunciation =
      "Very clear pronunciation with good stress and intonation!"
  }

  // Intelligibility feedback
  if (params.intelligibility < 60) {
    feedback.intelligibility =
      "Work on speaking more clearly and ensuring your message is easily understood."
  } else if (params.intelligibility < 80) {
    feedback.intelligibility =
      "Your speech is generally clear but could be more consistent throughout."
  } else {
    feedback.intelligibility = "Excellent clarity and very easy to understand!"
  }

  // Overall feedback
  const averageScore =
    (params.fluency + params.pronunciation + params.intelligibility) / 3
  feedback.overall =
    `Overall performance: ${Math.round(averageScore)}%. ` +
    (averageScore < 60
      ? "Focus on practicing regularly to improve your speaking skills."
      : averageScore < 80
      ? "Good progress! Keep practicing to enhance your speaking abilities."
      : "Excellent speaking skills! Keep maintaining this high standard.")

  return feedback
}
