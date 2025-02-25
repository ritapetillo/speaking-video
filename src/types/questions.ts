export interface Question {
  id: string
  category: 1 | 2 | 3 // 1: intro, 2: free, 3: media
  text: string
  preparationTime: number // in seconds
  responseTime: number // in seconds
  media?: {
    type: "video" | "image"
    url: string
    duration?: number // for videos
  }
}

export type TestSession = {
  studentId: string
  questions: Question[]
  currentQuestionIndex: number
  recordings: {
    questionId: string
    vimeoUrl: string
  }[]
}
