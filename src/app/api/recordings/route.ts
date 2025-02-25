import { NextResponse } from "next/server"
import Airtable from "airtable"

// Initialize Airtable with better error handling
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error("Missing Airtable credentials")
  throw new Error("Missing required Airtable credentials")
}

// Initialize Airtable with personal access token
const airtable = new Airtable({
  apiKey: AIRTABLE_API_KEY,
  endpointUrl: "https://api.airtable.com",
})

const base = airtable.base(AIRTABLE_BASE_ID)

export async function POST(request: Request) {
  console.log("Starting Airtable recording upload...")

  try {
    const body = await request.json()

    // Log the exact data structure we're trying to create
    console.log("Attempting to create record with fields:", {
      fields: {
        StudentID: {
          type: typeof body.studentId,
          value: body.studentId,
          asArray: [body.studentId],
        },
        QuestionNumber: {
          type: typeof body.questionNumber,
          value: body.questionNumber,
        },
        QuestionID: {
          type: typeof body.questionId,
          value: body.questionId,
        },
        VideoURL: {
          type: typeof body.videoUrl,
          value: body.videoUrl,
        },
      },
    })

    if (!body.studentId || !body.questionId || !body.videoUrl) {
      console.error("Missing required fields:", body)
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    try {
      // Try to fetch the table schema first
      const tableInfo = await base("Recordings")
        .select({
          maxRecords: 0,
        })
        .firstPage()

      console.log("Table fields:", tableInfo[0]?.fields)

      const record = await base("Recordings").create([
        {
          fields: {
            StudentID: [body.studentId],
            QuestionNumber: body.questionNumber,
            QuestionID: body.questionId,
            VideoURL: body.videoUrl,
          },
        },
      ])

      console.log("Successfully created Airtable record:", record[0].id)

      return NextResponse.json({
        success: true,
        id: record[0].id,
      })
    } catch (createError) {
      // Better error handling for Airtable errors
      const airtableError = createError as {
        error?: string
        message?: string
        statusCode?: number
      }
      console.error("Failed to create Airtable record:", {
        error: airtableError.error || "Unknown error",
        message: airtableError.message || "No message provided",
        statusCode: airtableError.statusCode || 500,
      })

      return NextResponse.json(
        {
          error: "Failed to create record in Airtable",
          details: airtableError.message,
        },
        { status: airtableError.statusCode || 422 }
      )
    }
  } catch (error) {
    console.error("Error processing recording upload:", {
      error,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    })

    return NextResponse.json(
      { error: "Failed to save recording" },
      { status: 500 }
    )
  }
}
