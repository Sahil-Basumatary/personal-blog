import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import AuthSignInPage from "./pages/AuthSignInPage.jsx";
import AuthSignUpPage from "./pages/AuthSignUpPage.jsx";
import ToastContainer from "./components/toast/Toast";

const HomePage = lazy(() => import("./pages/HomePage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const SingleBlogPage = lazy(() => import("./pages/SingleBlogPage"));
const NewPostPage = lazy(() => import("./pages/NewPostPage"));
const EditPostPage = lazy(() => import("./pages/EditPostPage"));
const SubscriptionConfirmPage = lazy(() => import("./pages/SubscriptionConfirmPage"));
const UnsubscribePage = lazy(() => import("./pages/UnsubscribePage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));

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
    <>
    <ToastContainer />
    <Suspense
      fallback={
        <div className="page-shell" style={{ padding: "2rem" }}>
          <p>Loading page…</p>
        </div>
      }
    >
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
        <Route path="/confirm/:token" element={<SubscriptionConfirmPage />} />
        <Route path="/unsubscribe/:token" element={<UnsubscribePage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
      </Routes>
    </Suspense>
    </>
  );
}

export default App;