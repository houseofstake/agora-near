import { render, screen, waitFor } from "@testing-library/react";
import LinkPreview from "@/components/shared/LinkPreview";
import * as matchers from '@testing-library/jest-dom/matchers';
import { vi, expect } from "vitest";
import * as useLinkPreviewHook from "@/hooks/useLinkPreview";

expect.extend(matchers);

vi.mock("@/hooks/useLinkPreview");

describe("LinkPreview", () => {
  const mockUseLinkPreview = vi.spyOn(useLinkPreviewHook, "useLinkPreview");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return null for empty url", () => {
    mockUseLinkPreview.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    } as any);

    const { container } = render(<LinkPreview url="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("should show loading state", () => {
    mockUseLinkPreview.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
    } as any);

    render(<LinkPreview url="https://gov.near.org/t/test" />);
  });

  it("should display metadata when data is loaded", async () => {
    const mockData = {
      title: "Test Title",
      description: "Test Description",
      image: "https://example.com/image.png",
    };

    mockUseLinkPreview.mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
    } as any);

    render(<LinkPreview url="https://gov.near.org/t/test" />);

    await waitFor(() => {
      expect(screen.getByText("Test Title")).toBeInTheDocument();
      expect(screen.getByText("Test Description")).toBeInTheDocument();
      const images = screen.getAllByRole("img");
      expect(
        images.some((img) => img.getAttribute("src") === mockData.image)
      ).toBe(true);
    });
  });

  it("should return null on error", () => {
    mockUseLinkPreview.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
    } as any);

    const { container } = render(
      <LinkPreview url="https://gov.near.org/t/fail" />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
