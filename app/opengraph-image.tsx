import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

export const runtime = "nodejs"
export const alt = "Sara Lorusso"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  const font = await readFile(
    join(process.cwd(), "public", "MessinaSans-Regular.ttf")
  )

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
          }}
        >
          <span
            style={{
              fontFamily: "MessinaSans",
              fontWeight: 400,
              fontSize: 112,
              color: "#111111",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            Sara
          </span>
          <span
            style={{
              fontFamily: "MessinaSans",
              fontWeight: 400,
              fontSize: 112,
              color: "#111111",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            Lorusso
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "MessinaSans",
          data: font,
          style: "normal",
          weight: 400,
        },
      ],
    }
  )
}
