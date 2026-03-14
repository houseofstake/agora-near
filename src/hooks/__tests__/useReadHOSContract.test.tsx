import { useNear } from "@/contexts/NearContext";
import { CACHE_TTL } from "@/lib/constants";
import {
  QueryClient,
  QueryClientProvider,
  useQueries,
} from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useReadHOSContract } from "../useReadHOSContract";

// Mock the dependencies
vi.mock("@/contexts/NearContext", () => ({
  useNear: vi.fn(),
}));

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQueries: vi.fn(),
  };
});

const mockUseNear = vi.mocked(useNear);
const mockUseQueries = vi.mocked(useQueries);

describe("useReadHOSContract", () => {
  let queryClient: QueryClient;
  let wrapper: React.ComponentType<{ children: React.ReactNode }>;
  let mockViewMethod: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
          staleTime: 0,
          refetchOnWindowFocus: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    mockViewMethod = vi.fn();

    // Setup default mocks
    mockUseNear.mockReturnValue({
      viewMethod: mockViewMethod,
    } as any);

    mockUseQueries.mockReturnValue([
      {
        data: null,
        isLoading: false,
        isError: false,
        error: null,
        isSuccess: false,
        status: "idle",
      },
    ] as any);
  });

  afterEach(async () => {
    queryClient.clear();
  });

  describe("Hook Initialization", () => {
    it("should call useQueries with correct parameters", () => {
      const queries = [
        {
          contractId: "test-contract.testnet",
          methodName: "get_balance" as const,
          config: {
            args: { account_id: "test-account.testnet" },
          },
        },
      ];

      renderHook(() => useReadHOSContract(queries), { wrapper });

      expect(mockUseQueries).toHaveBeenCalledWith({
        queries: expect.arrayContaining([
          expect.objectContaining({
            queryKey: [
              "near-read",
              "test-contract.testnet",
              "get_balance",
              { account_id: "test-account.testnet" },
              undefined,
              undefined,
            ],
            queryFn: expect.any(Function),
            enabled: true,
            staleTime: CACHE_TTL.SHORT,
            gcTime: undefined,
          }),
        ]),
      });
    });

    it("should handle multiple queries", () => {
      const queries = [
        {
          contractId: "test-contract1.testnet",
          methodName: "get_balance" as const,
          config: {
            args: {},
          },
        },
        {
          contractId: "test-contract2.testnet",
          methodName: "ft_balance_of" as const,
          config: {
            args: { account_id: "test-account.testnet" },
          },
        },
      ];

      mockUseQueries.mockReturnValue([
        {
          data: "1000000000000000000000000",
          isLoading: false,
          isError: false,
          error: null,
          isSuccess: true,
          status: "success",
        },
        {
          data: "500000000000000000000000",
          isLoading: false,
          isError: false,
          error: null,
          isSuccess: true,
          status: "success",
        },
      ]);

      const { result } = renderHook(() => useReadHOSContract(queries), {
        wrapper,
      });

      expect(result.current.length).toBe(2);
      expect(mockUseQueries).toHaveBeenCalledWith({
        queries: expect.arrayContaining([
          expect.objectContaining({
            queryKey: [
              "near-read",
              "test-contract1.testnet",
              "get_balance",
              {},
              undefined,
              undefined,
            ],
          }),
          expect.objectContaining({
            queryKey: [
              "near-read",
              "test-contract2.testnet",
              "ft_balance_of",
              { account_id: "test-account.testnet" },
              undefined,
              undefined,
            ],
          }),
        ]),
      });
    });
  });

  describe("Query Configuration", () => {
    it("should handle custom enabled flag", () => {
      const queries = [
        {
          contractId: "test-contract.testnet",
          methodName: "get_balance" as const,
          config: {
            args: { account_id: "test-account.testnet" },
            enabled: false,
          },
        },
      ];

      renderHook(() => useReadHOSContract(queries), { wrapper });

      expect(mockUseQueries).toHaveBeenCalledWith({
        queries: expect.arrayContaining([
          expect.objectContaining({
            enabled: false,
          }),
        ]),
      });
    });

    it("should handle custom staleTime", () => {
      const customStaleTime = 60000; // 1 minute
      const queries = [
        {
          contractId: "test-contract.testnet",
          methodName: "get_balance" as const,
          config: {
            args: { account_id: "test-account.testnet" },
            staleTime: customStaleTime,
          },
        },
      ];

      renderHook(() => useReadHOSContract(queries), { wrapper });

      expect(mockUseQueries).toHaveBeenCalledWith({
        queries: expect.arrayContaining([
          expect.objectContaining({
            staleTime: customStaleTime,
          }),
        ]),
      });
    });

    it("should handle custom gcTime", () => {
      const customGcTime = 120000; // 2 minutes
      const queries = [
        {
          contractId: "test-contract.testnet",
          methodName: "get_balance" as const,
          config: {
            args: { account_id: "test-account.testnet" },
            gcTime: customGcTime,
          },
        },
      ];

      renderHook(() => useReadHOSContract(queries), { wrapper });

      expect(mockUseQueries).toHaveBeenCalledWith({
        queries: expect.arrayContaining([
          expect.objectContaining({
            gcTime: customGcTime,
          }),
        ]),
      });
    });
  });

  describe("Query Function", () => {
    it("should call viewMethod with correct parameters", async () => {
      const mockResult = "1000000000000000000000000";
      mockViewMethod.mockResolvedValue(mockResult);

      const queries = [
        {
          contractId: "test-contract.testnet",
          methodName: "get_balance" as const,
          config: {
            args: { account_id: "test-account.testnet" },
          },
        },
      ];

      renderHook(() => useReadHOSContract(queries), { wrapper });

      // Get the query function that was passed to useQueries
      const queryFunction = (mockUseQueries.mock.calls as any)[0]?.[0]
        ?.queries?.[0]?.queryFn as () => Promise<string> | undefined;

      if (queryFunction) {
        const result = await queryFunction();
        expect(result).toBe(mockResult);
      }

      expect(mockViewMethod).toHaveBeenCalledWith({
        contractId: "test-contract.testnet",
        method: "get_balance",
        args: { account_id: "test-account.testnet" },
        blockId: undefined,
      });
    });

    it("should call viewMethod with blockId when provided", async () => {
      const mockResult = "1000000000000000000000000";
      const blockId = 123456;
      mockViewMethod.mockResolvedValue(mockResult);

      const queries = [
        {
          contractId: "test-contract.testnet",
          methodName: "get_balance" as const,
          config: {
            args: { account_id: "test-account.testnet" },
          },
          blockId,
        },
      ];

      renderHook(() => useReadHOSContract(queries), { wrapper });

      // Get the query function that was passed to useQueries
      const queryFunction = (mockUseQueries.mock.calls as any)[0]?.[0]
        ?.queries?.[0]?.queryFn as () => Promise<unknown> | undefined;

      if (queryFunction) {
        await queryFunction();
      }

      expect(mockViewMethod).toHaveBeenCalledWith({
        contractId: "test-contract.testnet",
        method: "get_balance",
        args: { account_id: "test-account.testnet" },
        blockId,
      });
    });
  });
});
