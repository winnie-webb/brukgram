"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { IoArrowBack } from "react-icons/io5"; // Back arrow
import { useRouter } from "next/navigation"; // For navigation
import Short from "./Short";

export default function Shorts() {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const router = useRouter();
  const lastVideoRef = useRef();

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
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setPage((prevPage) => prevPage + 1); // Load the next set of videos
        }
      },
      { threshold: 1.0 }
    );

    if (lastVideoRef.current) {
      observer.observe(lastVideoRef.current);
    }

    return () => {
      if (lastVideoRef.current) {
        observer.unobserve(lastVideoRef.current);
      }
    };
  }, [loading]);

  return (
    <div className=" snap-y snap-mandatory h-screen overflow-y-scroll bg-white relative">
      {/* Back arrow */}
      <button
        className="fixed top-5 left-4 text-white z-10"
        onClick={() => router.back()}
      >
        <IoArrowBack size={28} />
      </button>

      {shorts.map((short, index) => (
        <Short
          key={index}
          short={short}
          isLast={index === shorts.length - 1}
          lastVideoRef={lastVideoRef}
        />
      ))}
    </div>
  );
}
