import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BlogPage from "../BlogPage";

vi.mock("@clerk/clerk-react", () => ({
  useUser: () => ({ isLoaded: true, isSignedIn: false, user: null }),
  useAuth: () => ({ getToken: async () => "test-token" }),
  useClerk: () => ({
    signOut: vi.fn(),
    openSignIn: vi.fn(),
  }),
}));

vi.mock("../../components/UserChip", () => ({
  default: () => <div data-testid="user-chip" />,
}));

describe("BlogPage", () => {
  let originalFetch;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("renders posts from backend and shows pagination info", async () => {
    const mockResponse = {
      items: [
        {
          _id: "1",
          title: "First post",
          content: "Hello world",
          category: "cs-journey",
          categoryLabel: "My CS Journey",
          excerpt: "First excerpt",
          isFeatured: true,
          views: 3,
          createdAt: "2024-01-01T00:00:00.000Z",
        },
        {
          _id: "2",
          title: "Life in London",
          content: "Groceries and rent",
          category: "life-in-london",
          categoryLabel: "Life in London",
          excerpt: "Second excerpt",
          isFeatured: false,
          views: 5,
          createdAt: "2024-01-02T00:00:00.000Z",
        },
      ],
      total: 2,
      page: 1,
      pageSize: 5,
      totalPages: 3,
    };

    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

    global.fetch = fetchSpy;

    render(
      <MemoryRouter initialEntries={["/blog"]}>
        <BlogPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const firstHeadings = screen.getAllByRole("heading", {
        name: "First post",
      });
      expect(firstHeadings.length).toBe(2);
      const londonHeadings = screen.getAllByRole("heading", {
        name: "Life in London",
      });
      expect(londonHeadings.length).toBe(1);
    });

    expect(
      screen.getByRole("heading", { name: /Recent posts/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const calledUrl = fetchSpy.mock.calls[0][0].toString();
    expect(calledUrl).toContain("/posts?");
    expect(calledUrl).toContain("page=1");
    expect(calledUrl).toContain("limit=5");
  });

  it("shows empty search message when no posts match", async () => {
    const mockResponse = {
      items: [
        {
          _id: "1",
          title: "Some random post",
          content: "Nothing to do with query",
          category: "cs-journey",
          categoryLabel: "My CS Journey",
          excerpt: "Whatever",
          isFeatured: false,
          views: 0,
          createdAt: "2024-01-01T00:00:00.000Z",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 5,
      totalPages: 1,
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(
      <MemoryRouter initialEntries={["/blog"]}>
        <BlogPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Some random post")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Search posts bruv");

    fireEvent.change(input, { target: { value: "nonexistent" } });

    await waitFor(() => {
      expect(
        screen.getByText(/Search results for “nonexistent”/)
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/No posts found matching “nonexistent”/)
    ).toBeInTheDocument();
  });
});