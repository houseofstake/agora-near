import { NextRequest, NextResponse } from "next/server";
import { fetchVoteChanges } from "@/lib/api/proposal/requests";
import { validateBearerToken } from "@/lib/apiAuth";

/**
 * GET /api/v1/proposal/[id]/vote-changes
 *
 * Public endpoint to list vote changes for a proposal.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Validate bearer token
  const authError = validateBearerToken(request);
  if (authError) {
    return authError;
  }

  try {
    const proposalId = params.id;

    if (!proposalId) {
      return NextResponse.json(
        { error: "Proposal ID is required" },
        { status: 400 }
      );
    }

    // Fetch from backend
    const data = await fetchVoteChanges(proposalId);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching vote changes for proposal:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch vote changes",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
