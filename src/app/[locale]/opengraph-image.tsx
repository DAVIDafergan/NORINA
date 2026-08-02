import { ImageResponse } from "next/og";

export const alt = "NORINA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default share-preview card for any page that doesn't define its own
// openGraph.images (homepage, category pages, ...) - product pages override
// this with a real product photo. Kept deliberately simple (brand colors +
// wordmark, no photography) since there's no real lifestyle photography to
// use yet - see PlaceholderImage for the same rationale on-site.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f4ec",
        }}
      >
        <div
          style={{
            display: "flex",
            border: "1px solid #ddc9a3",
            padding: "48px 80px",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 96,
              color: "#201d1a",
              letterSpacing: 24,
              fontWeight: 600,
            }}
          >
            NORINA
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 28,
              color: "#b08d57",
              letterSpacing: 10,
              textTransform: "uppercase",
            }}
          >
            Women&apos;s Fashion
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
