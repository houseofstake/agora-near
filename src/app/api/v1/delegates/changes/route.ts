import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchDelegateStatementChanges } from "@/lib/api/delegates/requests";
import { validateBearerToken } from "@/lib/apiAuth";

// Query parameter validation schema
const querySchema = z.object({
  offset: z.coerce.number().int().min(1).default(10),
  page: z.coerce.number().int().min(1).default(1),
  lookback_days: z.coerce.number().int().min(1).optional(),
});

/**
 * GET /api/v1/delegates/changes
 *
 * Public endpoint to list delegate statement changes.
 *
 * Query parameters:
 * - offset: Number of records to return (default: 10)
 * - page: Page number (default: 1)
 * - lookback_days: Number of days to look back for changes
 */
export async function GET(request: NextRequest) {
  // Validate bearer token
  const authError = validateBearerToken(request);
  if (authError) {
    return authError;
  }

  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const validationResult = querySchema.safeParse({
      offset: searchParams.get("offset") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      lookback_days: searchParams.get("lookback_days") ?? undefined,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { offset, page, lookback_days } = validationResult.data;

    // Fetch from backend
    const data = await fetchDelegateStatementChanges(
      offset,
      page,
      lookback_days
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching delegate statement changes:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch delegate statement changes",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
