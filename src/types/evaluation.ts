export type ESLCriteria = {
  fluency: number // 0-100
  pronunciation: number // 0-100
  intelligibility: number // 0-100
  feedback: {
    fluency: string
    pronunciation: string
    intelligibility: string
    overall: string
  }
}

export type SpeechAnalysis = {
  text: string
  confidence: number
  words: Array<{
    text: string
    confidence: number
    start: number
    end: number
  }>
  language: string
  audio_duration: number
  speech_duration: number
  speaking_rate: number
  pause_count: number
  acoustic_analysis: {
    speech_rate: number
    pronunciation_score: number
    clarity_score: number
  }
}
