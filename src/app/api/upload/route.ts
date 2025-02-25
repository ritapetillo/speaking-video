import { Vimeo } from "@vimeo/vimeo"
import { NextResponse } from "next/server"
import { writeFile, unlink } from "fs/promises"
import { join } from "path"
import os from "os"

// Validate environment variables
const VIMEO_CLIENT_ID = process.env.VIMEO_CLIENT_ID
const VIMEO_CLIENT_SECRET = process.env.VIMEO_CLIENT_SECRET
const VIMEO_ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN

if (!VIMEO_CLIENT_ID || !VIMEO_CLIENT_SECRET || !VIMEO_ACCESS_TOKEN) {
  throw new Error("Missing required Vimeo credentials")
}

// Initialize Vimeo client with proper authentication
const client = new Vimeo(
  VIMEO_CLIENT_ID,
  VIMEO_CLIENT_SECRET,
  VIMEO_ACCESS_TOKEN
)

// Add folder ID to environment variables
const VIMEO_FOLDER_ID = process.env.VIMEO_FOLDER_ID

export async function POST(request: Request) {
  let tempFilePath: string | null = null

  try {
    // Verify authentication first
    const authCheck = await new Promise((resolve) => {
      client.request("/me", (error, body) => {
        if (error) {
          console.error("Vimeo authentication error:", error)
          resolve(false)
        } else {
          resolve(true)
        }
      })
    })

    if (!authCheck) {
      return NextResponse.json(
        {
          error: "Failed to authenticate with Vimeo. Please check credentials.",
        },
        { status: 401 }
      )
    }

    const { videoBlob, fileName } = await request.json()

    // Create a temporary file
    const tempDir = os.tmpdir()
    tempFilePath = join(tempDir, `${fileName}.webm`)

    // Convert base64 to buffer and save to temp file
    const videoBuffer = Buffer.from(videoBlob.split(",")[1], "base64")
    await writeFile(tempFilePath, videoBuffer)

    return await new Promise((resolve, reject) => {
      // Proceed with upload
      client.upload(
        tempFilePath,
        {
          name: fileName,
          description: "Test recording response",
          privacy: { view: "unlisted" },
          folder_uri: process.env.VIMEO_FOLDER_ID
            ? `/folders/${process.env.VIMEO_FOLDER_ID}`
            : undefined,
        },
        async function (uri: string) {
          try {
            // Clean up temp file
            if (tempFilePath) {
              await unlink(tempFilePath)
            }

            if (!uri) {
              resolve(
                NextResponse.json(
                  { error: "Failed to get upload URI" },
                  { status: 500 }
                )
              )
              return
            }

            // Get the video URL from the URI
            const videoId = uri.split("/").pop()

            client.request(uri, function (error: any, body: any) {
              if (error) {
                console.error("Error getting video details:", error)
                resolve(
                  NextResponse.json(
                    { error: "Failed to get video details" },
                    { status: 500 }
                  )
                )
                return
              }

              if (!body || !body.player_embed_url) {
                resolve(
                  NextResponse.json(
                    { error: "Invalid response from Vimeo" },
                    { status: 500 }
                  )
                )
                return
              }

              resolve(
                NextResponse.json({
                  url: body.player_embed_url,
                  videoId: videoId,
                })
              )
            })
          } catch (error) {
            console.error("Error in upload callback:", error)
            resolve(
              NextResponse.json(
                { error: "Upload process failed" },
                { status: 500 }
              )
            )
          }
        },
        function (bytesUploaded: number, bytesTotal: number) {
          // Optional: Log upload progress
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)
          console.log(`Upload progress: ${percentage}%`)
        },
        function (error: any) {
          console.error("Failed to upload to Vimeo:", error)
          resolve(
            NextResponse.json(
              { error: "Failed to upload video" },
              { status: 500 }
            )
          )
        }
      )
    })
  } catch (error) {
    // Clean up temp file if it exists
    if (tempFilePath) {
      try {
        await unlink(tempFilePath)
      } catch (cleanupError) {
        console.error("Error cleaning up temp file:", cleanupError)
      }
    }

    console.error("Error processing upload:", error)
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    )
  }
}
