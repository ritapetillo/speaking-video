"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Question, TestSession } from "@/types/questions"
import { getRandomQuestions } from "@/data/questions"
import { useStudent } from "@/context/StudentContext"

export default function TestContent() {
  const router = useRouter()
  const { studentId } = useStudent()
  const [isInitialized, setIsInitialized] = useState(false)
  const [session, setSession] = useState<TestSession | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTimeLeft, setRecordingTimeLeft] = useState<number | null>(
    null
  )
  const [isMediaPlaying, setIsMediaPlaying] = useState(false)
  const [mediaError, setMediaError] = useState<string | null>(null)

  // Add state for media viewing time
  const [mediaViewTime, setMediaViewTime] = useState<number | null>(null)

  // Add upload state
  const [isUploading, setIsUploading] = useState(false)

  // Add state for recording URLs
  type Recording = {
    questionId: string
    vimeoUrl: string
  }

  const [recordings, setRecordings] = useState<Recording[]>([])

  // Add state for completed recording
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunks = useRef<BlobPart[]>([])
  const mediaRef = useRef<HTMLVideoElement>(null)

  // Add this function at the top of your component
  const playBeep = () => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.type = "sine"
      oscillator.frequency.value = 880 // frequency in hertz
      gainNode.gain.value = 0.1 // volume control

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1) // Duration of beep in seconds
    } catch (error) {
      console.error("Error playing beep:", error)
    }
  }

  // Initialize session
  useEffect(() => {
    const initializeTest = async () => {
      try {
        if (!studentId) {
          console.log("No student ID found, redirecting...")
          router.push("/")
          return
        }

        const questions = getRandomQuestions()
        setSession({
          studentId,
          questions,
          currentQuestionIndex: 0,
          recordings: [],
        })
        setIsInitialized(true)
      } catch (error) {
        console.error("Error initializing test:", error)
        router.push("/")
      }
    }

    initializeTest()
  }, [studentId, router])

  // Start first question when session is initialized
  useEffect(() => {
    if (isInitialized && session && !currentQuestion) {
      const firstQuestion = session.questions[0]
      setCurrentQuestion(firstQuestion)
    }
  }, [isInitialized, session, currentQuestion])

  // Initialize video stream
  useEffect(() => {
    if (!currentQuestion) return

    const initStream = async () => {
      try {
        console.log("Requesting media permissions...")
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
        console.log("Media stream obtained")
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.muted = true
        }
      } catch (error) {
        console.error("Error accessing media devices:", error)
        setMediaError("Failed to access camera or microphone")
      }
    }

    // Reset recording states when question changes
    setRecordingBlob(null)
    setIsRecording(false)
    setRecordingTimeLeft(null)
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop()
    }
    mediaRecorderRef.current = null
    chunks.current = []

    initStream()

    // Set initial countdown or media time based on media type
    if (currentQuestion.media) {
      if (
        currentQuestion.media.type === "video" &&
        currentQuestion.media.duration
      ) {
        setMediaViewTime(currentQuestion.media.duration)
        setCountdown(null)
      } else {
        // For images, go straight to preparation time
        setMediaViewTime(null)
        setCountdown(currentQuestion.preparationTime)
      }
    } else {
      setMediaViewTime(null)
      setCountdown(currentQuestion.preparationTime)
    }

    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop()
      }
    }
  }, [currentQuestion])

  // Update the countdown effect to handle media timing
  useEffect(() => {
    if (!currentQuestion) return

    if (
      currentQuestion.media?.type === "video" &&
      currentQuestion.media.duration
    ) {
      setMediaViewTime(currentQuestion.media.duration)
      setCountdown(null)
    } else {
      // For images or no media, go straight to preparation time
      setMediaViewTime(null)
      setCountdown(currentQuestion.preparationTime)
    }
  }, [currentQuestion])

  // Update the countdown effect to properly trigger recording
  useEffect(() => {
    if (countdown === null) return

    // Clear any existing recording when countdown starts
    setRecordingBlob(null)

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) {
          clearInterval(timer)
          return null
        }
        if (prev <= 0) {
          clearInterval(timer)
          console.log("Starting recording after countdown...")
          startRecording()
          return null
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [countdown])

  // Update the media viewing effect to properly transition to countdown
  useEffect(() => {
    if (mediaViewTime === null) return

    // Clear any existing recording when media viewing starts
    setRecordingBlob(null)

    const timer = setInterval(() => {
      setMediaViewTime((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer)
          if (prev === 0) {
            if (currentQuestion) {
              if (mediaRef.current) {
                mediaRef.current.pause()
              }
              setCountdown(currentQuestion.preparationTime)
            }
          }
          return null
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [mediaViewTime, currentQuestion])

  // Update the startRecording function
  const startRecording = async () => {
    if (!streamRef.current || !currentQuestion) return

    try {
      // Play beep sound
      playBeep()

      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: "video/webm;codecs=vp8,opus",
      })

      mediaRecorder.ondataavailable = (e) => {
        console.log("Data available:", e.data.size) // Debug log
        if (e.data.size > 0) {
          chunks.current.push(e.data)
        }
      }

      mediaRecorder.onstart = () => {
        console.log("MediaRecorder started") // Debug log
        setIsRecording(true)
        setRecordingTimeLeft(currentQuestion.responseTime)
      }

      mediaRecorder.onstop = () => {
        console.log("MediaRecorder stopped") // Debug log
        const blob = new Blob(chunks.current, { type: "video/webm" })
        chunks.current = []
        setIsRecording(false)
        setRecordingTimeLeft(null)
        setRecordingBlob(blob)
      }

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event) // Debug log
      }

      mediaRecorder.start(1000)
      mediaRecorderRef.current = mediaRecorder

      // Start recording countdown
      const timer = setInterval(() => {
        setRecordingTimeLeft((prev) => {
          if (prev === null || prev <= 0) {
            clearInterval(timer)
            if (mediaRecorderRef.current?.state === "recording") {
              mediaRecorderRef.current.stop()
            }
            return null
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  // Update the Stop & Continue button handler
  const handleStopRecording = async () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop()
    }
  }

  // Add function to handle next question with upload
  const handleNextQuestion = async () => {
    if (!recordingBlob || !session || !currentQuestion) return

    try {
      setIsUploading(true)
      const fileName = `${studentId}_question_${
        session.currentQuestionIndex + 1
      }`
      // Upload to Vimeo
      const response = await uploadToVimeo(recordingBlob, fileName)

      // Store the recording URL
      setRecordings((prev) => [
        ...prev,
        {
          questionId: currentQuestion.id,
          vimeoUrl: response.url,
        },
      ])

      // Update session with recording
      setSession((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          recordings: [
            ...prev.recordings,
            {
              questionId: currentQuestion.id,
              vimeoUrl: response.url,
            },
          ],
        }
      })

      // Save to Airtable
      try {
        await fetch("/api/recordings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId,
            questionId: currentQuestion.id,
            videoUrl: response.url,
            questionNumber: session.currentQuestionIndex + 1,
          }),
        })
      } catch (error) {
        console.error("Failed to save recording to Airtable:", error)
      }

      // Clear recording blob
      setRecordingBlob(null)

      // Move to next question
      goToNextQuestion()
    } catch (error) {
      console.error("Failed to upload video:", error)
      alert("Failed to upload video. Please try again.")
      setIsUploading(false)
    }
  }

  // Update goToNextQuestion function
  const goToNextQuestion = () => {
    if (!session) return

    const nextIndex = session.currentQuestionIndex + 1
    if (nextIndex < session.questions.length) {
      // Reset all recording-related states first
      setRecordingBlob(null)
      setIsRecording(false)
      setRecordingTimeLeft(null)
      setIsUploading(false)

      // Stop any ongoing recording
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop()
      }
      mediaRecorderRef.current = null
      chunks.current = []

      // Reset media states
      setMediaViewTime(null)
      setMediaError(null)

      // Update session and question after states are reset
      setSession((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          currentQuestionIndex: nextIndex,
        }
      })

      // Set the new question after a small delay to ensure states are reset
      setTimeout(() => {
        if (session.questions[nextIndex]) {
          setCurrentQuestion(session.questions[nextIndex])
        }
      }, 100)
    } else {
      // Test complete - redirect to completion page
      router.push(
        `/complete?recordings=${encodeURIComponent(JSON.stringify(recordings))}`
      )
    }
  }

  // Update the uploadToVimeo function with better error handling
  const uploadToVimeo = async (
    blob: Blob,
    fileName: string
  ): Promise<{ url: string; videoId: string }> => {
    try {
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string)
      })
      reader.readAsDataURL(blob)
      const base64Data = await base64Promise

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoBlob: base64Data,
          fileName,
        }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to upload video")
      }

      return {
        url: data.url,
        videoId: data.videoId,
      }
    } catch (error) {
      console.error("Error uploading to Vimeo:", error)
      throw new Error(
        error instanceof Error ? error.message : "Failed to upload video"
      )
    }
  }

  // Add upload indicator to UI
  if (isUploading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <div className="text-xl font-medium">Uploading recording...</div>
        </div>
      </div>
    )
  }

  // Add loading state
  if (!isInitialized || !session || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-xl">Loading test...</div>
          <div className="text-sm text-gray-500">Student ID: {studentId}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2">
        <div
          className="bg-green-600 h-full transition-all duration-300"
          style={{
            width: `${
              (((session?.currentQuestionIndex || 0) + 1) /
                (session?.questions.length || 1)) *
              100
            }%`,
          }}
        />
      </div>

      {/* Question Progress Text */}
      <div className="p-4 text-center text-sm text-gray-600">
        Question {(session?.currentQuestionIndex || 0) + 1} of{" "}
        {session?.questions.length}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-4xl w-full space-y-6 text-center">
          <h2 className="text-2xl font-semibold">{currentQuestion?.text}</h2>

          {/* Media and Video Container */}
          <div
            className={`grid ${
              currentQuestion?.media ? "grid-cols-2" : "grid-cols-1"
            } gap-4`}
          >
            {/* Media Display */}
            {currentQuestion?.media?.type === "image" && (
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={currentQuestion.media.url}
                  alt="Question media"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Video Preview with Countdown Overlay */}
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ transform: "scaleX(-1)" }}
                className="w-full h-full object-cover"
              />

              {/* Countdown Overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center">
                  <div className="space-y-4">
                    <div className="text-white text-xl">Get ready!</div>
                    <div className="text-white text-lg">
                      Recording will start in
                    </div>
                    <div className="text-6xl font-bold text-white">
                      {countdown}
                    </div>
                    <div className="text-white text-lg">seconds</div>
                  </div>
                </div>
              )}

              {/* Recording indicator and controls */}
              {isRecording && (
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    Recording: {recordingTimeLeft}s
                  </div>
                  <button
                    onClick={handleStopRecording}
                    className="bg-gray-800 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition-colors"
                  >
                    Stop Recording
                  </button>
                </div>
              )}

              {/* Upload button */}
              {recordingBlob &&
                !isRecording &&
                !isUploading &&
                !countdown &&
                !mediaViewTime && (
                  <div className="absolute bottom-4 right-4">
                    <button
                      onClick={handleNextQuestion}
                      disabled={isUploading}
                      className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition-colors"
                    >
                      {isUploading ? (
                        <div className="flex items-center gap-2">
                          <span className="animate-spin">⏳</span>
                          <span>Uploading...</span>
                        </div>
                      ) : (
                        "Upload & Continue"
                      )}
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
