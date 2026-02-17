import { fetchSocialProfile } from "../near-social";
import { JsonRpcProvider } from "@near-js/providers";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock JsonRpcProvider
vi.mock("@near-js/providers", () => {
  return {
    JsonRpcProvider: vi.fn(),
  };
});

// Mock getRpcUrl
vi.mock("@/lib/utils", () => {
  return {
    getRpcUrl: vi.fn().mockReturnValue("https://rpc.mainnet.near.org"),
  };
});

describe("fetchSocialProfile", () => {
  const mockQuery = vi.fn();

  beforeEach(() => {
    (JsonRpcProvider as any).mockImplementation(() => ({
      query: mockQuery,
    }));
    mockQuery.mockReset();
  });

  const encodeResult = (value: any) => {
    return {
      result: Buffer.from(JSON.stringify(value)).toJSON().data,
    };
  };

  it("should return null if profile not found", async () => {
    mockQuery.mockResolvedValueOnce(encodeResult({}));

    const result = await fetchSocialProfile("test.near");
    expect(result).toBeNull();
  });

  it("should return mapped profile if found", async () => {
    const mockProfileData = {
      "test.near": {
        profile: {
          description: "Test Statement",
          linktree: {
            twitter: "testtwitter",
            website: "https://test.com",
          },
        },
      },
    };

    mockQuery.mockResolvedValueOnce(encodeResult(mockProfileData));

    const result = await fetchSocialProfile("test.near");
    expect(result).toEqual({
      statement: "Test Statement",
      twitter: "testtwitter",
    });
  });

  it("should handle error gracefully and return null", async () => {
    mockQuery.mockRejectedValueOnce(new Error("Network Error"));

    const result = await fetchSocialProfile("test.near");
    expect(result).toBeNull();
  });
});
