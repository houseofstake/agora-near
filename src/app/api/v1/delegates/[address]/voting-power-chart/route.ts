import { NextRequest, NextResponse } from "next/server";
import { fetchVotingPowerChart } from "@/lib/api/delegates/requests";
import { validateBearerToken } from "@/lib/apiAuth";

/**
 * GET /api/v1/delegates/[address]/voting-power-chart
 *
 * Public endpoint to get voting power chart data for a delegate.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  // Validate bearer token
  const authError = validateBearerToken(request);
  if (authError) {
    return authError;
  }

  try {
    const address = params.address;

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    // Fetch from backend
    const data = await fetchVotingPowerChart(address);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching voting power chart data:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch voting power chart data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
