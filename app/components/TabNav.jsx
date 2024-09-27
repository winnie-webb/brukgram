"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AiOutlineHome,
  AiFillHome,
  AiOutlineSearch,
  AiFillSearch,
  AiOutlinePlusCircle,
  AiFillPlusCircle,
  AiOutlineHeart,
  AiFillHeart,
  AiOutlineUser,
  AiFillUser,
} from "react-icons/ai"; // Import both outline and filled icons from react-icons

const TabNav = () => {
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname

  const handleNavigation = (path) => {
    router.push(path);
  };

  // Helper function to determine if the tab is active
  const isActive = (path) => path === pathname;

  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar for larger screens */}
      <div className="hidden fixed top-0 left-0 w-16 md:flex md:flex-col md:w-1/4 bg-white border-r border-gray-200 shadow-lg h-full">
        <button
          onClick={() => handleNavigation("/")}
          aria-label="Home"
          className={`flex items-center p-4 ${
            isActive("/") ? "text-black font-bold" : "text-gray-500"
          }`}
        >
          {isActive("/") ? (
            <AiFillHome className="text-2xl" />
          ) : (
            <AiOutlineHome className="text-2xl" />
          )}
          <span className="ml-2">Home</span>
        </button>

        <button
          onClick={() => handleNavigation("/search")}
          aria-label="Search"
          className={`flex items-center p-4 ${
            isActive("/search") ? "text-black font-bold" : "text-gray-500"
          }`}
        >
          {isActive("/search") ? (
            <AiFillSearch className="text-2xl" />
          ) : (
            <AiOutlineSearch className="text-2xl" />
          )}
          <span className="ml-2">Search</span>
        </button>

        <button
          onClick={() => handleNavigation("/posts")}
          aria-label="Posts"
          className={`flex items-center p-4 ${
            isActive("/posts") ? "text-black font-bold" : "text-gray-500"
          }`}
        >
          {isActive("/posts") ? (
            <AiFillPlusCircle className="text-2xl" />
          ) : (
            <AiOutlinePlusCircle className="text-2xl" />
          )}
          <span className="ml-2">Posts</span>
        </button>

        <button
          onClick={() => handleNavigation("/notifications")}
          aria-label="Notifications"
          className={`flex items-center p-4 ${
            isActive("/notifications")
              ? "text-black font-bold"
              : "text-gray-500"
          }`}
        >
          {isActive("/notifications") ? (
            <AiFillHeart className="text-2xl" />
          ) : (
            <AiOutlineHeart className="text-2xl" />
          )}
          <span className="ml-2">Notifications</span>
        </button>

        <button
          onClick={() => handleNavigation("/profile")}
          aria-label="Profile"
          className={`flex items-center p-4 ${
            isActive("/profile") ? "text-black font-bold" : "text-gray-500"
          }`}
        >
          {isActive("/profile") ? (
            <AiFillUser className="text-2xl" />
          ) : (
            <AiOutlineUser className="text-2xl" />
          )}
          <span className="ml-2">Profile</span>
        </button>
      </div>

      {/* Bottom navigation for smaller screens */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden">
        <div className="flex justify-around py-3">
          <button
            onClick={() => handleNavigation("/")}
            aria-label="Home"
            className={`flex flex-col items-center ${
              isActive("/") ? "text-black font-bold" : "text-gray-500"
            }`}
          >
            {isActive("/") ? (
              <AiFillHome className="text-2xl" />
            ) : (
              <AiOutlineHome className="text-2xl" />
            )}
          </button>

          <button
            onClick={() => handleNavigation("/search")}
            aria-label="Search"
            className={`flex flex-col items-center ${
              isActive("/search") ? "text-black font-bold" : "text-gray-500"
            }`}
          >
            {isActive("/search") ? (
              <AiFillSearch className="text-2xl" />
            ) : (
              <AiOutlineSearch className="text-2xl" />
            )}
          </button>

          <button
            onClick={() => handleNavigation("/posts")}
            aria-label="Posts"
            className={`flex flex-col items-center ${
              isActive("/posts") ? "text-black font-bold" : "text-gray-500"
            }`}
          >
            {isActive("/posts") ? (
              <AiFillPlusCircle className="text-2xl" />
            ) : (
              <AiOutlinePlusCircle className="text-2xl" />
            )}
          </button>

          <button
            onClick={() => handleNavigation("/notifications")}
            aria-label="Notifications"
            className={`flex flex-col items-center ${
              isActive("/notifications")
                ? "text-black font-bold"
                : "text-gray-500"
            }`}
          >
            {isActive("/notifications") ? (
              <AiFillHeart className="text-2xl" />
            ) : (
              <AiOutlineHeart className="text-2xl" />
            )}
          </button>

          <button
            onClick={() => handleNavigation("/profile")}
            aria-label="Profile"
            className={`flex flex-col items-center ${
              isActive("/profile") ? "text-black font-bold" : "text-gray-500"
            }`}
          >
            {isActive("/profile") ? (
              <AiFillUser className="text-2xl" />
            ) : (
              <AiOutlineUser className="text-2xl" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TabNav;
