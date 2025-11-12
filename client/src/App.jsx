import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'


function App() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
   //basic for now :)
    fetch("http://localhost:5050/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error("Error fetching posts:", err));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Sahils Blog</h1>
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post.id} style={{ marginBottom: "1rem" }}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
          </div>
        ))
      ) : (
        <p>Cooking posts....</p>
      )}
    </div>
  );
}

export default App
