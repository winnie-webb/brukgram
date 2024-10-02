"use client";
import { useEffect, useState, useRef } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { IoArrowBack } from "react-icons/io5"; // Icons for like, comment, and back arrow
import { useRouter } from "next/navigation"; // For navigation
import Short from "./short";

export default function Shorts() {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Get the router for navigation

  const scrollRef = useRef(null); // Reference to the scrollable container

  useEffect(() => {
    const fetchShorts = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "posts"),
          where("mediaType", "==", "video")
        );
        const querySnapshot = await getDocs(q);
        const posts = querySnapshot.docs.map((doc) => doc.data());
        setShorts(posts);
      } catch (error) {
        console.error("Error fetching shorts:", error);
      }
      setLoading(false);
    };

    fetchShorts();
  }, []);

  const handleScroll = () => {
    const container = scrollRef.current;
    if (container) {
      // Check if the user has scrolled to the bottom
      if (
        container.scrollTop + container.clientHeight >=
        container.scrollHeight
      ) {
        // If at the bottom, reset scroll to the top (loop effect)
        container.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="shorts-container snap-y snap-mandatory h-screen overflow-y-scroll bg-black relative"
    >
      {/* Back arrow */}
      <button
        className="absolute top-14 left-2 text-white z-10"
        onClick={() => router.back()}
      >
        <IoArrowBack size={28} />
      </button>

      {/* Render shorts */}
      {shorts.map((short, index) => (
        <Short key={index} short={short} />
      ))}
    </div>
  );
}
