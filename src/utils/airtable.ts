import Airtable from "airtable"

// Initialize Airtable with API key from environment variables
const airtable = new Airtable({
  apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY,
})

// Get the base using the base ID from environment variables
const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID
if (!baseId) throw new Error("Airtable Base ID is required")
const base = airtable.base(baseId)

// Type for a student record
export interface Student {
  id: string
  first_name: string
  email?: string
  // Add other fields as needed
}

export interface StudentProgress {
  score?: number
  completedAt?: string
  status: "not_started" | "in_progress" | "completed"
}

export async function getStudent(studentId: string): Promise<Student | null> {
  try {
    const records = await base("Participants") // Replace "Students" with your actual table name
      .select({
        filterByFormula: `{StudentID} = '${studentId}'`,
        maxRecords: 1,
      })
      .firstPage()
    console.log(records)

    if (records.length === 0) {
      return null
    }

    const record = records[0]
    return {
      id: record.get("StudentID") as string,
      first_name: record.get("First Name") as string,
      // Map other fields as needed
    }
  } catch (error) {
    console.error("Error fetching student:", error)
    return null
  }
}

// Add more utility functions as needed
export async function updateStudentProgress(
  studentId: string,
  progress: StudentProgress
): Promise<boolean> {
  try {
    await base("Students").update([
      {
        id: studentId,
        fields: {
          Progress: JSON.stringify(progress),
          LastUpdated: new Date().toISOString(),
        },
      },
    ])
    return true
  } catch (error) {
    console.error("Error updating student progress:", error)
    return false
  }
}
