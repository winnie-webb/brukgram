"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { IoArrowBack } from "react-icons/io5"; // Back arrow
import { useRouter } from "next/navigation"; // For navigation
import Short from "./Short";

export default function Shorts() {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(false); // Initialize with false
  const [page, setPage] = useState(0);
  const router = useRouter();
  const lastVideoRef = useRef(); // Only assign to the last video

  // Fetch shorts from Firebase
  const fetchShorts = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "posts"),
        where("mediaType", "==", "video")
      );
      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setShorts((prev) => [...prev, ...posts]); // Append previous videos to the list
    } catch (error) {
      console.error("Error fetching shorts:", error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchShorts();
  }, [fetchShorts, page]);

  // Infinite scrolling function to load more videos when reaching the end
  useEffect(() => {
    if (loading) return; // Don't trigger observer while loading new items

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setPage((prevPage) => prevPage + 1); // Load the next set of videos
        }
      },
      { threshold: 1.0 } // Fully visible element triggers the observer
    );

    const currentRef = lastVideoRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [loading]);

  return (
    <div className="snap-y snap-mandatory h-screen overflow-y-scroll bg-white relative">
      {/* Back arrow */}
      <button
        className="fixed top-5 left-4 text-white z-10"
        onClick={() => router.back()}
      >
        <IoArrowBack size={28} />
      </button>

      {shorts.map((short, index) => {
        // Assign lastVideoRef only to the last video element
        const isLast = index === shorts.length - 1;
        return (
          <Short
            key={short.id + index} // Use a stable key (short.id) instead of index
            short={short}
            lastVideoRef={isLast ? lastVideoRef : null} // Only pass the ref to the last item
          />
        );
      })}

      {loading && <div className="text-center py-4">Loading more...</div>}
    </div>
  );
}
