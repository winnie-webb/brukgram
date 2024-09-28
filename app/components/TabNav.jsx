"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AiOutlineHome,
  AiOutlineSearch,
  AiOutlinePlusCircle,
  AiOutlineHeart,
  AiOutlineUser,
  AiFillHome,
  AiFillSearch,
  AiFillPlusCircle,
  AiFillHeart,
  AiFillUser,
} from "react-icons/ai";
import Image from "next/image";
import logo from "../public/logo.png";
const TabNav = () => {
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname

  const handleNavigation = (path) => {
    router.push(path);
  };

  // Helper function to determine if the tab is active
  const isActive = (path) => path === pathname;

  return (
    <>
      <div className="flex flex-col group md:flex-row p-4">
        {/* Sidebar for larger screens */}
        <div className="hidden fixed top-0 left-0 w-16 p-6 md:flex md:flex-col md:w-1/5 bg-white border-r border-gray-200 shadow-lg h-full">
          <Image
            src={logo}
            width={150}
            height={150}
            alt="Brukgram Logo"
            className=" mb-5 object-contain"
          ></Image>
          <button
            onClick={() => handleNavigation("/")}
            aria-label="Home"
            className={`flex items-center py-4 mb-4 ${
              isActive("/") ? "text-black font-bold" : "text-black"
            }`}
          >
            {isActive("/") ? (
              <AiFillHome className="text-3xl" />
            ) : (
              <AiOutlineHome className="text-3xl" />
            )}
            <span className="ml-4">Home</span>
          </button>

          <button
            onClick={() => handleNavigation("/search")}
            aria-label="Search"
            className={`flex items-center py-4 mb-4 ${
              isActive("/search") ? "text-black font-bold" : "text-black"
            }`}
          >
            {isActive("/search") ? (
              <AiFillSearch className="text-3xl" />
            ) : (
              <AiOutlineSearch className="text-3xl" />
            )}
            <span className="ml-4">Search</span>
          </button>

          <button
            onClick={() => handleNavigation("/posts")}
            aria-label="Posts"
            className={`flex items-center py-4 mb-4 ${
              isActive("/posts") ? "text-black font-bold" : "text-black"
            }`}
          >
            {isActive("/posts") ? (
              <AiFillPlusCircle className="text-3xl" />
            ) : (
              <AiOutlinePlusCircle className="text-3xl" />
            )}
            <span className="ml-4">Posts</span>
          </button>

          <button
            onClick={() => handleNavigation("/notifications")}
            aria-label="Notifications"
            className={`flex items-center py-4 mb-4 ${
              isActive("/notifications") ? "text-black font-bold" : "text-black"
            }`}
          >
            {isActive("/notifications") ? (
              <AiFillHeart className="text-3xl" />
            ) : (
              <AiOutlineHeart className="text-3xl" />
            )}
            <span className="ml-4">Notifications</span>
          </button>

          <button
            onClick={() => handleNavigation("/profile")}
            aria-label="Profile"
            className={`flex items-center py-4 mb-4 ${
              isActive("/profile") ? "text-black font-bold" : "text-black"
            }`}
          >
            {isActive("/profile") ? (
              <AiFillUser className="text-3xl" />
            ) : (
              <AiOutlineUser className="text-3xl" />
            )}
            <span className="ml-4">Profile</span>
          </button>
        </div>

        {/* Bottom navigation for smaller screens */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden">
          <div className="fixed top-0 left-0 border-b-2 bg-white z-20 w-full flex justify-between items-center px-4 py-2">
            <Image
              src={logo}
              width={100}
              height={120}
              alt="Brukgram Logo"
              className=" object-contain mt-2"
            ></Image>
            <div className="flex gap-3">
              <button
                onClick={() => handleNavigation("/posts")}
                aria-label="Posts"
                className={`flex flex-col items-center ${
                  isActive("/posts") ? "text-black font-bold" : "text-black"
                }`}
              >
                {isActive("/posts") ? (
                  <AiFillPlusCircle className="text-3xl" />
                ) : (
                  <AiOutlinePlusCircle className="text-3xl" />
                )}
              </button>
              <button
                onClick={() => handleNavigation("/notifications")}
                aria-label="Notifications"
                className={`flex flex-col items-center ${
                  isActive("/notifications")
                    ? "text-black font-bold"
                    : "text-black"
                }`}
              >
                {isActive("/notifications") ? (
                  <AiFillHeart className="text-3xl" />
                ) : (
                  <AiOutlineHeart className="text-3xl" />
                )}
              </button>
            </div>
          </div>
          <div className="flex justify-around py-3">
            <button
              onClick={() => handleNavigation("/")}
              aria-label="Home"
              className={`flex flex-col items-center ${
                isActive("/") ? "text-black font-bold" : "text-black"
              }`}
            >
              {isActive("/") ? (
                <AiFillHome className="text-3xl" />
              ) : (
                <AiOutlineHome className="text-3xl" />
              )}
            </button>

            <button
              onClick={() => handleNavigation("/search")}
              aria-label="Search"
              className={`flex flex-col items-center ${
                isActive("/search") ? "text-black font-bold" : "text-black"
              }`}
            >
              {isActive("/search") ? (
                <AiFillSearch className="text-3xl" />
              ) : (
                <AiOutlineSearch className="text-3xl" />
              )}
            </button>

            <button
              onClick={() => handleNavigation("/profile")}
              aria-label="Profile"
              className={`flex flex-col items-center ${
                isActive("/profile") ? "text-black font-bold" : "text-black"
              }`}
            >
              {isActive("/profile") ? (
                <AiFillUser className="text-3xl" />
              ) : (
                <AiOutlineUser className="text-3xl" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TabNav;
