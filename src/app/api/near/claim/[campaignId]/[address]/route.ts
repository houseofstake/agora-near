import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _request: NextRequest,
  { params: _params }: { params: { campaignId: number; address: string } }
) {
  // Phase 2: Claim window is closed. No longer processing claims.
  return NextResponse.json(
    { success: true, message: "Claim window closed" },
    { status: 200 }
  );
}
