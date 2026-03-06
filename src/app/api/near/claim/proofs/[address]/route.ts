import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { address: string } }
) {
  const { address } = params;
  // Phase 2: Claim window is closed. Return empty proofs.
  return NextResponse.json(
    {
      address: address?.toLowerCase() || "",
      totalProofs: 0,
      proofs: [],
    },
    { status: 200 }
  );
}
