"use client";
import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import Image from "next/image";
import Link from "next/link";
import Gallery from "./Gallery"; // Component for the explore gallery
import { AiOutlineSend } from "react-icons/ai";

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allMedia, setAllMedia] = useState([]);

  // Fetch media for the explore gallery
  useEffect(() => {
    const fetchMedia = async () => {
      const mediaQuerySnapshot = await getDocs(collection(db, "posts"));
      const mediaData = mediaQuerySnapshot.docs.map((doc) => doc.data());
      setAllMedia(mediaData);
    };

    fetchMedia();
  }, []);

  // Handle search functionality
  const handleSearch = async (e) => {
    e.preventDefault();

    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("displayName", ">=", searchTerm));
    const querySnapshot = await getDocs(q);

    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setSearchResults(users);
  };

  return (
    <div className="p-4 mt-10 md:ml-[20%]">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6 flex">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            handleSearch(e);
          }}
          placeholder="Search for users"
          className="w-full p-2 border rounded-md"
        />
      </form>

      {/* Search Results */}
      <div className="mb-8">
        {searchResults.length > 0 ? (
          searchResults.map((user) => (
            <div key={user.id} className="flex items-center space-x-4 mb-4">
              <Image
                src={user.profilePictureUrl || "/default-user.jpg"}
                alt={user.displayName}
                width={40}
                height={40}
                className="rounded-full w-10 h-10"
              />
              <Link href={`/profile/${user.id}`}>{user.displayName}</Link>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No users found</p>
        )}
      </div>

      {/* Explore Gallery */}
      <div>
        <h2 className="text-lg font-bold mb-4">Explore</h2>
        <Gallery media={allMedia} />
      </div>
    </div>
  );
};

export default SearchPage;
