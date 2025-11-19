import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MyCSJourney from "./pages/MyCSJourney";
import LifeInLondon from "./pages/LifeInLondon";
import Motivation from "./pages/Motivation";
import ToolsResources from "./pages/ToolsResources";
import BlogPage from "./pages/BlogPage";
import SingleBlogPage from "./pages/SingleBlogPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/cs-journey" element={<MyCSJourney />} />
        <Route path="/life-in-london" element={<LifeInLondon />} />
        <Route path="/motivation" element={<Motivation />} />
        <Route path="/tools" element={<ToolsResources />} />
        <Route path="/blog/:id" element={<SingleBlogPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;