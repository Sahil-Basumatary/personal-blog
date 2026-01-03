import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import SingleBlogPage from "../SingleBlogPage";

vi.mock("../../api/posts", () => ({
  fetchPostById: vi.fn(),
  incrementPostViews: vi.fn(),
  voteOnPost: vi.fn(),
  deletePost: vi.fn()
}));

vi.mock("@clerk/clerk-react", () => ({
  useUser: () => ({ isLoaded: true, isSignedIn: false, user: null }),
  useAuth: () => ({ getToken: async () => "test-token" }),
  useClerk: () => ({
    signOut: vi.fn(),
    openSignIn: vi.fn(),
  }),
}));

vi.mock("../../components/ReadingProgressBar", () => ({
  default: () => <div data-testid="reading-progress" />
}));

const { fetchPostById, incrementPostViews } = await import("../../api/posts");

function renderWithRouter(initialPath = "/blog/123") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/blog/:id" element={<SingleBlogPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("SingleBlogPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders post details and views from backend", async () => {
    const post = {
      _id: "123",
      title: "Test Single Post",
      content: [
        "Hello from the **single post**.",
        "",
        "[good link](/blog)",
        "[bad link](javascript:alert(1))",
        "",
        "![local](/images/New-profile-picture.jpeg)",
        "![blocked](https://evil.com/a.png)",
        "",
        "<script>window.__xss = true</script>",
      ].join("\n"),
      category: "cs-journey",
      categoryLabel: "My CS Journey",
      excerpt: "Short description",
      views: 7,
      createdAt: "2024-01-05T00:00:00.000Z"
    };

    fetchPostById.mockResolvedValueOnce(post);
    incrementPostViews.mockResolvedValueOnce({
      ...post,
      views: 8
    });

    renderWithRouter("/blog/123");

    expect(screen.getByText(/Loading post/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Test Single Post" })
      ).toBeInTheDocument();
    });


    expect(screen.getByText("My CS Journey")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/8 views/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Hello from the/i)).toBeInTheDocument();
    expect(screen.getByText("single post")).toBeInTheDocument();
    expect(document.querySelector("strong")?.textContent).toBe("single post");

    expect(screen.getByRole("link", { name: "good link" })).toHaveAttribute(
      "href",
      "/blog"
    );
    expect(screen.queryByRole("link", { name: "bad link" })).toBeNull();

    expect(screen.getByRole("img", { name: "local" })).toHaveAttribute(
      "src",
      "/images/New-profile-picture.jpeg"
    );
    expect(screen.queryByRole("img", { name: "blocked" })).toBeNull();

    expect(document.querySelector("script")).toBeNull();

    expect(
      screen.getByRole("link", { name: /Back to all posts/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Home/i })).toBeInTheDocument();
  });

  it("shows not found when backend returns error", async () => {
    fetchPostById.mockRejectedValueOnce(new Error("Not found"));

    renderWithRouter("/blog/does-not-exist");

    await waitFor(() => {
      expect(screen.getByText(/Post not found/i)).toBeInTheDocument();
    });
  });
});