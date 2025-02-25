"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

export default function TestPreparationContent() {
  const [step, setStep] = useState<
    "instructions" | "device-check" | "test-recording" | "ready"
  >("instructions")
  const [isRecording, setIsRecording] = useState(false)
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null)
  const [audioDetected, setAudioDetected] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const router = useRouter()

  const [showWarning, setShowWarning] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)

  const [debugInfo, setDebugInfo] = useState<string>("")

  const runDetection = useCallback(async () => {
    if (!videoRef.current) return

    try {
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(dataArray)
        const maxVolume = Math.max(...Array.from(dataArray))
        const hasAudio = maxVolume > -50

        setAudioDetected(hasAudio)

        setDebugInfo(`
Audio Detection:
- Level: ${maxVolume}
- Detected: ${hasAudio ? "Yes" : "No"}
- Threshold: -50

Video Info:
- Size: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}
- Ready: ${videoRef.current.readyState}
- Playing: ${!videoRef.current.paused}

Stream Status: ${streamRef.current?.active ? "Active" : "Inactive"}
        `)
      }

      setTimeout(() => {
        requestAnimationFrame(runDetection)
      }, 100)
    } catch (error) {
      console.error("Detection error:", error)
      requestAnimationFrame(runDetection)
    }
  }, [])

  const setupAudioAnalysis = (stream: MediaStream) => {
    try {
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 1024
      analyser.minDecibels = -90
      analyser.maxDecibels = -10
      analyser.smoothingTimeConstant = 0.2

      const microphone = audioContext.createMediaStreamSource(stream)
      microphone.connect(analyser)
      analyserRef.current = analyser
      audioContextRef.current = audioContext
    } catch (error) {
      console.error("Error setting up audio analysis:", error)
    }
  }

  const goToTestRecording = async () => {
    setStep("test-recording")
    setDebugInfo("Starting setup...")

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      setDebugInfo("Requesting camera and microphone access...")
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      setDebugInfo("Camera and microphone access granted")

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.muted = true
        await videoRef.current.play()
        setDebugInfo("Video preview started")
      }

      setupAudioAnalysis(stream)
      setDebugInfo("Audio analysis initialized")

      runDetection()
      setDebugInfo("Setup complete - audio detection running")
    } catch (error) {
      console.error("Error setting up devices:", error)
      setDebugInfo(`Setup error: ${error}`)
      handlePermissionError(error)
    }
  }

  const handlePermissionError = (error: unknown) => {
    if (error instanceof Error) {
      if (error.name === "NotAllowedError") {
        setPermissionError(
          "Please allow access to your camera and microphone to continue. You may need to reset permissions in your browser settings."
        )
      } else {
        setPermissionError(
          "There was an error accessing your camera or microphone. Please check your device settings."
        )
      }
    }
  }

  const startRecording = async () => {
    console.log("startRecording called")
    if (!streamRef.current) {
      console.error("No stream available")
      return
    }

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: "video/webm;codecs=vp8,opus",
      })
      const chunks: BlobPart[] = []

      mediaRecorder.ondataavailable = (event) => {
        console.log("Data available:", event.data.size)
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstart = () => {
        console.log("MediaRecorder started")
        setIsRecording(true)
      }

      mediaRecorder.onstop = () => {
        console.log("MediaRecorder stopped")
        const blob = new Blob(chunks, { type: "video/webm" })
        const url = URL.createObjectURL(blob)
        console.log("Recording complete, size:", blob.size)
        setRecordedVideo(url)
        setIsRecording(false)
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000)
      console.log("Recording started")

      // Stop after 10 seconds (for testing)
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          stopRecording()
        }
      }, 10000)
    } catch (error) {
      console.error("Error starting recording:", error)
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    console.log("stopRecording called, state:", mediaRecorderRef.current?.state)
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      try {
        mediaRecorderRef.current.stop()
        setIsRecording(false)
      } catch (error) {
        console.error("Error stopping recording:", error)
      }
    }
  }

  const restartCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.muted = true
      }
    } catch (error) {
      console.error("Error restarting camera:", error)
    }
  }

  useEffect(() => {
    if (step === "device-check") {
      goToTestRecording()
    }
  }, [step])

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (recordedVideo) {
        URL.revokeObjectURL(recordedVideo)
      }
    }
  }, [recordedVideo])

  const FaceGuideOverlay = () => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative w-64 h-64">
        <div className="absolute inset-0 border-2 border-dashed border-white/70 rounded-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white drop-shadow-lg">
            <svg
              className="w-32 h-32 mx-auto mb-2 text-white/70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <p className="text-sm font-medium text-white/90 drop-shadow">
              Position your face here
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 max-w-2xl mx-auto">
      {step === "instructions" && (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Test Instructions</h1>
          <div className="space-y-4">
            <p>Please read the following instructions carefully:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Ensure you are in a quiet, well-lit room</li>
              <li>Make sure your camera and microphone are working</li>
              <li>You will need to keep your camera on during the test</li>
              <li>The test will take approximately 30 minutes</li>
            </ul>
          </div>
          <button
            onClick={() => setStep("device-check")}
            className="w-full rounded-full bg-foreground text-background px-6 py-3"
          >
            Continue to Device Check
          </button>
        </div>
      )}

      {step === "device-check" && (
        <div className="space-y-6 w-full">
          <h2 className="text-2xl font-bold">Device Check</h2>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="relative w-full aspect-video bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ transform: "scaleX(-1)" }}
                  className="w-full h-full rounded-lg bg-gray-100 object-cover"
                  onLoadedMetadata={(e) => {
                    const video = e.target as HTMLVideoElement
                    setDebugInfo(
                      `Video loaded: ${video.videoWidth}x${video.videoHeight}`
                    )
                    video.play().catch((error) => {
                      setDebugInfo(`Video play error: ${error}`)
                    })
                  }}
                  onError={(e) => {
                    const video = e.target as HTMLVideoElement
                    setDebugInfo(`Video error: ${video.error?.message}`)
                  }}
                />
                <FaceGuideOverlay />
              </div>
            </div>
            <div className="flex gap-4">
              <div
                className={`p-2 rounded ${
                  audioDetected ? "bg-green-100" : "bg-red-100"
                }`}
              >
                Microphone: {audioDetected ? "✓" : "×"}
              </div>
            </div>
            <button
              onClick={goToTestRecording}
              className="w-full rounded-full bg-foreground text-background px-6 py-3"
            >
              Test Recording
            </button>
          </div>
        </div>
      )}

      {step === "test-recording" && (
        <div className="space-y-6 w-full">
          <h2 className="text-2xl font-bold">Test Recording</h2>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 relative">
              <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
                {isRecording && (
                  <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    Recording
                  </div>
                )}
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-300 ${
                    audioDetected ? "bg-green-500" : "bg-red-500"
                  } text-white text-sm`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      audioDetected ? "animate-pulse bg-white" : "bg-red-200"
                    }`}
                  />
                  Audio {audioDetected ? "Detected" : "Not Detected"}
                </div>
              </div>

              <div className="relative w-full aspect-video">
                {recordedVideo ? (
                  <video
                    key={recordedVideo}
                    src={recordedVideo}
                    controls
                    onError={(e) => {
                      const target = e.target as HTMLVideoElement
                      console.error("Video error:", target.error)
                    }}
                    onLoadedData={(e) => {
                      const target = e.target as HTMLVideoElement
                      console.log("Video loaded, duration:", target.duration)
                    }}
                    className="w-full h-full rounded-lg bg-gray-100 object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{ transform: "scaleX(-1)" }}
                      className="w-full h-full rounded-lg bg-gray-100 object-cover"
                      onLoadedMetadata={(e) => {
                        const video = e.target as HTMLVideoElement
                        video.play().catch(console.error)
                      }}
                    />
                    <FaceGuideOverlay />
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-center gap-4">
              {!isRecording && !recordedVideo && (
                <button
                  onClick={startRecording}
                  disabled={!audioDetected}
                  className={`px-6 py-3 rounded-full transition-colors duration-300 ${
                    audioDetected
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {!audioDetected ? "Audio Required" : "Start Recording"}
                </button>
              )}
              {isRecording && (
                <button
                  onClick={stopRecording}
                  className="px-6 py-3 bg-gray-500 text-white rounded-full"
                >
                  Stop Recording
                </button>
              )}
              {recordedVideo && (
                <>
                  <button
                    onClick={async () => {
                      setRecordedVideo(null)
                      await restartCamera()
                    }}
                    className="px-6 py-3 bg-red-500 text-white rounded-full"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => {
                      if (streamRef.current) {
                        streamRef.current
                          .getTracks()
                          .forEach((track) => track.stop())
                      }
                      router.push("/test")
                    }}
                    className="px-6 py-3 bg-green-500 text-white rounded-full"
                  >
                    Looks Good
                  </button>
                </>
              )}
            </div>
            <p className="text-center text-sm text-gray-600">
              {!recordedVideo
                ? "Record a short test video to check your microphone"
                : "Play the recording to verify your microphone is working properly"}
            </p>
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono whitespace-pre-wrap">
              {debugInfo}
            </div>
          </div>
          {showWarning && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm">
                <h3 className="text-xl font-bold text-red-600 mb-4">
                  No Audio Detected!
                </h3>
                <p className="mb-4">
                  Please make sure your microphone is working properly.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => {
                      stopRecording()
                      setShowWarning(false)
                      setRecordedVideo(null)
                      restartCamera()
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-full"
                  >
                    Stop and Try Again
                  </button>
                  <button
                    onClick={() => setShowWarning(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-full"
                  >
                    Continue Recording
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {step === "ready" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Ready to Begin</h2>
          <p>Your devices are working properly. You can now start the test.</p>
          <button
            onClick={() => router.push("/test")}
            className="w-full rounded-full bg-foreground text-background px-6 py-3"
          >
            Start Test
          </button>
        </div>
      )}

      {permissionError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h3 className="text-xl font-bold text-red-600 mb-4">
              Permission Required
            </h3>
            <p className="mb-6 text-gray-700">{permissionError}</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setPermissionError(null)
                  goToTestRecording()
                }}
                className="px-4 py-2 bg-foreground text-background rounded-full"
              >
                Try Again
              </button>
              <a
                href="chrome://settings/content/camera"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-500 text-white rounded-full"
              >
                Open Settings
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
