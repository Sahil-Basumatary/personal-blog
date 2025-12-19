import { Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

import HomePage from "./pages/HomePage";
import BlogPage from "./pages/BlogPage";
import SingleBlogPage from "./pages/SingleBlogPage";
import NewPostPage from "./pages/NewPostPage";
import EditPostPage from "./pages/EditPostPage";
import AuthSignInPage from "./pages/AuthSignInPage.jsx";
import AuthSignUpPage from "./pages/AuthSignUpPage.jsx";

function RequireAuth({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:id" element={<SingleBlogPage />} />

      <Route
        path="/new-post"
        element={
          <RequireAuth>
            <NewPostPage />
          </RequireAuth>
        }
      />
      <Route
        path="/write"
        element={
          <RequireAuth>
            <NewPostPage />
          </RequireAuth>
        }
      />
      <Route
        path="/edit/:id"
        element={
          <RequireAuth>
            <EditPostPage />
          </RequireAuth>
        }
      />

      <Route path="/sign-in" element={<AuthSignInPage />} />
      <Route path="/sign-up" element={<AuthSignUpPage />} />
    </Routes>
  );
}

export default App;