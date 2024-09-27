"use client";
import React, { useState, useEffect } from "react";
import PostCard from "./components/PostCard"; // Assuming this component exists
import { db } from "../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

const HomePage = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div>
        {posts.map((post, index) => (
          <PostCard key={index} post={post} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
