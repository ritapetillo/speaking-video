import Airtable from "airtable"

const airtable = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
})

const base = airtable.base(process.env.AIRTABLE_BASE_ID || "")

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get("id")

  if (!studentId) {
    return Response.json({ error: "Student ID is required" }, { status: 400 })
  }

  try {
    const records = await base("Participants")
      .select({
        filterByFormula: `{StudentID} = '${studentId}'`,
        maxRecords: 1,
      })
      .firstPage()

    if (records.length === 0) {
      return Response.json({ error: "Student not found" }, { status: 404 })
    }

    const record = records[0]
    return Response.json({
      id: record.get("StudentID"),
      first_name: record.get("First Name"),
    })
  } catch (_error) {
    return Response.json({ error: "Failed to fetch student" }, { status: 500 })
  }
}
