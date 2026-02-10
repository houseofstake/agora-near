import { NextRequest, NextResponse } from "next/server";
import { JSDOM } from "jsdom";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "Missing url parameter" },
      { status: 400 }
    );
  }

  // Security: Only allow specific domains to prevent SSRF
  if (
    !url.startsWith("https://gov.near.org/") &&
    !url.startsWith("https://github.com/houseofstake/proposals/")
  ) {
    return NextResponse.json({ error: "Invalid URL domain" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "bot", // Some sites require a user-agent to return metadata
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch URL" },
        { status: response.status }
      );
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const title =
      document
        .querySelector('meta[property="og:title"]')
        ?.getAttribute("content") ||
      document.querySelector("title")?.textContent ||
      "";

    const description =
      document
        .querySelector('meta[property="og:description"]')
        ?.getAttribute("content") ||
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content") ||
      "";

    const image =
      document
        .querySelector('meta[property="og:image"]')
        ?.getAttribute("content") || "";

    return NextResponse.json({
      title,
      description,
      image,
      url,
    });
  } catch (error) {
    console.error("Error fetching OG data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
