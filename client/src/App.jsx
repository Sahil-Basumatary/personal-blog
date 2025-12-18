// App.jsx
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import BlogPage from "./pages/BlogPage";
import SingleBlogPage from "./pages/SingleBlogPage";
import NewPostPage from "./pages/NewPostPage";
import EditPostPage from "./pages/EditPostPage";
import AuthSignInPage from "./pages/AuthSignInPage.jsx";
import AuthSignUpPage from "./pages/AuthSignUpPage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:id" element={<SingleBlogPage />} />
      <Route path="/new-post" element={<NewPostPage />} />
      <Route path="/write" element={<NewPostPage />} />
      <Route path="/edit/:id" element={<EditPostPage />} />
      <Route path="/sign-in" element={<AuthSignInPage />} />
      <Route path="/sign-up" element={<AuthSignUpPage />} />
    </Routes>
  );
}

export default App;