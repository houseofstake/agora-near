import { NextRequest, NextResponse } from "next/server";
import { JSDOM } from "jsdom";

const ALLOWED_DOMAINS = ["gov.near.org", "github.com"];

export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get("url");

  if (!urlParam) {
    return NextResponse.json(
      { error: "Missing URL parameter" },
      { status: 400 }
    );
  }

  try {
    const url = new URL(urlParam);

    if (!ALLOWED_DOMAINS.includes(url.hostname)) {
      return NextResponse.json(
        { error: "Domain not allowed" },
        { status: 403 }
      );
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch URL" },
        { status: response.status }
      );
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const getMeta = (property: string) => {
      return (
        doc
          .querySelector(`meta[property="${property}"]`)
          ?.getAttribute("content") ||
        doc
          .querySelector(`meta[name="${property}"]`)
          ?.getAttribute("content") ||
        null
      );
    };

    const metadata = {
      title: getMeta("og:title") || doc.title,
      description: getMeta("og:description") || getMeta("description"),
      image: getMeta("og:image"),
    };

    return NextResponse.json(metadata);
  } catch (error) {
    console.error("OG Preview Error:", error);
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }
}
