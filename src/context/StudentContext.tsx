"use client"

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react"

type StudentContextType = {
  studentId: string | null
  setStudentId: (id: string | null) => void
  clearStudent: () => void
}

const StudentContext = createContext<StudentContextType>({
  studentId: null,
  setStudentId: () => {},
  clearStudent: () => {},
})

export function StudentProvider({ children }: { children: ReactNode }) {
  const [studentId, setStudentId] = useState<string | null>(null)

  useEffect(() => {
    // Load from localStorage on mount
    const savedId = localStorage.getItem("studentId")
    if (savedId) {
      setStudentId(savedId)
    }
  }, [])

  const clearStudent = () => {
    setStudentId(null)
  }

  return (
    <StudentContext.Provider value={{ studentId, setStudentId, clearStudent }}>
      {children}
    </StudentContext.Provider>
  )
}

export function useStudent() {
  const context = useContext(StudentContext)
  if (context === undefined) {
    throw new Error("useStudent must be used within a StudentProvider")
  }
  return context
}
