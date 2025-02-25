import { Question } from "@/types/questions"

const PLACEHOLDER_IMAGE = "https://placehold.co/600x400/png"

const introQuestions: Question[] = [
  {
    id: "intro_1",
    category: 1,
    text: "What is your favorite hobby, and why do you enjoy it?",
    preparationTime: 30,
    responseTime: 90,
  },
  {
    id: "intro_2",
    category: 1,
    text: "What is your favorite way to spend the weekend?",
    preparationTime: 30,
    responseTime: 90,
  },
  {
    id: "intro_3",
    category: 1,
    text: "Which birthday was your favorite and why?",
    preparationTime: 30,
    responseTime: 90,
  },
  {
    id: "intro_4",
    category: 1,
    text: "What famous person would you most like to meet?",
    preparationTime: 30,
    responseTime: 90,
  },
  {
    id: "intro_5",
    category: 1,
    text: "What's your favorite holiday? Why?",
    preparationTime: 30,
    responseTime: 90,
  },
  {
    id: "intro_6",
    category: 1,
    text: "Talk about your best friend.",
    preparationTime: 30,
    responseTime: 90,
  },
  {
    id: "intro_7",
    category: 1,
    text: "Talk about your pets. If you don't have any, would you like one?",
    preparationTime: 30,
    responseTime: 90,
  },
  {
    id: "intro_8",
    category: 1,
    text: "Talk about the members of your family.",
    preparationTime: 30,
    responseTime: 90,
  },
  {
    id: "intro_9",
    category: 1,
    text: "What's the best gift you've ever received?",
    preparationTime: 30,
    responseTime: 90,
  },
  {
    id: "intro_10",
    category: 1,
    text: "What's your favorite TV show? Describe it.",
    preparationTime: 30,
    responseTime: 90,
  },
  {
    id: "intro_11",
    category: 1,
    text: "What's the most memorable trip you have taken?",
    preparationTime: 30,
    responseTime: 90,
  },
  {
    id: "intro_12",
    category: 1,
    text: "What's your favorite food from another culture?",
    preparationTime: 30,
    responseTime: 90,
  },
  {
    id: "intro_13",
    category: 1,
    text: "If you could have a superpower, what would you choose?",
    preparationTime: 30,
    responseTime: 90,
  },
  {
    id: "intro_14",
    category: 1,
    text: "If you could meet a character from a book, TV show, or movie, who would you want to meet?",
    preparationTime: 30,
    responseTime: 90,
  },
  {
    id: "intro_15",
    category: 1,
    text: "What do you want to do for work when you get older?",
    preparationTime: 30,
    responseTime: 90,
  },
  {
    id: "intro_16",
    category: 1,
    text: "If you could live anywhere in the world, where would you want to live?",
    preparationTime: 30,
    responseTime: 90,
  },
  {
    id: "intro_17",
    category: 1,
    text: "What type of music do you like the most and the least?",
    preparationTime: 30,
    responseTime: 90,
  },
]

const freeQuestions: Question[] = [
  {
    id: "free_1",
    category: 2,
    text: "How could schools be improved?",
    preparationTime: 30,
    responseTime: 120,
  },
  {
    id: "free_2",
    category: 2,
    text: "Is traveling important? Why or why not?",
    preparationTime: 30,
    responseTime: 120,
  },
  {
    id: "free_3",
    category: 2,
    text: "If you could change one thing about your country, what would it be?",
    preparationTime: 30,
    responseTime: 120,
  },
  {
    id: "free_4",
    category: 2,
    text: "Do you think technology has made life better or worse? Why?",
    preparationTime: 30,
    responseTime: 120,
  },
  {
    id: "free_5",
    category: 2,
    text: "Is it better to live in a big city or a small town? Explain.",
    preparationTime: 30,
    responseTime: 120,
  },
  {
    id: "free_6",
    category: 2,
    text: "If you had to invent a holiday, what would you celebrate?",
    preparationTime: 30,
    responseTime: 120,
  },
  {
    id: "free_7",
    category: 2,
    text: "What do you think life will be like in 50 years?",
    preparationTime: 30,
    responseTime: 120,
  },
  {
    id: "free_8",
    category: 2,
    text: "Should everyone learn a second language? Why or why not?",
    preparationTime: 30,
    responseTime: 120,
  },
  {
    id: "free_9",
    category: 2,
    text: "What do you think is the biggest problem in the world today?",
    preparationTime: 30,
    responseTime: 120,
  },
  {
    id: "free_10",
    category: 2,
    text: "At what age should children be allowed to have a smartphone? Why?",
    preparationTime: 30,
    responseTime: 120,
  },
  {
    id: "free_11",
    category: 2,
    text: "What is one invention that has changed the world the most? Explain.",
    preparationTime: 30,
    responseTime: 120,
  },
  {
    id: "free_12",
    category: 2,
    text: "What is something that should be taught in schools but isn't?",
    preparationTime: 30,
    responseTime: 120,
  },
  {
    id: "free_13",
    category: 2,
    text: "What is a job that you think won't exist in the future?",
    preparationTime: 30,
    responseTime: 120,
  },
  {
    id: "free_14",
    category: 2,
    text: "What is a job that you think will not be replaced by AI or robots?",
    preparationTime: 30,
    responseTime: 120,
  },
  {
    id: "free_15",
    category: 2,
    text: "What would the perfect city look like?",
    preparationTime: 30,
    responseTime: 120,
  },
  {
    id: "free_16",
    category: 2,
    text: "What is something that should be studied about in school?",
    preparationTime: 30,
    responseTime: 120,
  },
  {
    id: "free_17",
    category: 2,
    text: "Should there be a limit on how much money a person can make?",
    preparationTime: 30,
    responseTime: 120,
  },
]

const mediaQuestions: Question[] = [
  {
    id: "media_1",
    category: 3,
    text: "How do the educational styles in each photo compare? How is each style effective?",
    preparationTime: 30,
    responseTime: 120,
    media: {
      type: "image",
      url: PLACEHOLDER_IMAGE,
      duration: 30,
    },
  },
  {
    id: "media_2",
    category: 3,
    text: "Compare the photos and discuss how people's experiences with technology might differ depending on their age and background.",
    preparationTime: 30,
    responseTime: 120,
    media: {
      type: "image",
      url: PLACEHOLDER_IMAGE,
      duration: 30,
    },
  },
  {
    id: "media_3",
    category: 3,
    text: "How do these two different hobbies benefit the users? How are they similar and different?",
    preparationTime: 30,
    responseTime: 120,
    media: {
      type: "image",
      url: PLACEHOLDER_IMAGE,
      duration: 30,
    },
  },
  {
    id: "media_4",
    category: 3,
    text: "Compare the photos and say how the type of work in each image might affect a person's lifestyle.",
    preparationTime: 30,
    responseTime: 120,
    media: {
      type: "image",
      url: PLACEHOLDER_IMAGE,
      duration: 30,
    },
  },
  {
    id: "media_5",
    category: 3,
    text: "Compare the photos and say what might make each type of travel experience enjoyable.",
    preparationTime: 30,
    responseTime: 120,
    media: {
      type: "image",
      url: PLACEHOLDER_IMAGE,
      duration: 30,
    },
  },
  {
    id: "media_6",
    category: 3,
    text: "Why might each person be doing these activities? Do you think everyone is enjoying the work?",
    preparationTime: 30,
    responseTime: 120,
    media: {
      type: "image",
      url: PLACEHOLDER_IMAGE,
      duration: 30,
    },
  },
  {
    id: "media_7",
    category: 3,
    text: "Compare the photos and discuss how life events can change a person's idea of happiness and purpose.",
    preparationTime: 30,
    responseTime: 120,
    media: {
      type: "image",
      url: PLACEHOLDER_IMAGE,
      duration: 30,
    },
  },
  {
    id: "media_8",
    category: 3,
    text: "Discuss what's happening in each photo and how technology has changed how people work.",
    preparationTime: 30,
    responseTime: 120,
    media: {
      type: "image",
      url: PLACEHOLDER_IMAGE,
      duration: 30,
    },
  },
]

const allQuestions = [...introQuestions, ...freeQuestions, ...mediaQuestions]

export function getRandomQuestions(): Question[] {
  const selectedQuestions: Question[] = []
  const categories = [1, 2, 3]

  // Select one question from each category
  categories.forEach((category) => {
    const categoryQuestions = allQuestions.filter(
      (q) => q.category === category
    )
    const randomIndex = Math.floor(Math.random() * categoryQuestions.length)
    selectedQuestions.push(categoryQuestions[randomIndex])
  })

  return selectedQuestions
}
