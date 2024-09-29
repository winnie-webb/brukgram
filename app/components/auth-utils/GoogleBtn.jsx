// "use client";
import React from "react";
import { useRouter } from "next/navigation";
import { googleSignIn } from "./registerUser";

const GoogleBtn = ({ setError }) => {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();

      router.push("/"); // Redirect to homepage after Google login
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <div className="text-center">
      <button
        onClick={handleGoogleSignIn}
        className="mt-4 w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md shadow-sm hover:bg-gray-100 transition-colors duration-200"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
          <path
            fill="#4285F4"
            d="M24 9.5c3.14 0 5.73 1.07 7.86 2.82l5.82-5.82C33.86 3.1 29.34 1 24 1 14.73 1 7.27 6.98 4.34 14.76l6.91 5.37C13.02 15.42 18.05 9.5 24 9.5z"
          />
          <path
            fill="#34A853"
            d="M46.63 24.51c0-1.41-.12-2.79-.35-4.12H24v8.07h12.75c-.55 2.8-2.1 5.15-4.44 6.76l6.91 5.37c4.03-3.72 6.41-9.2 6.41-15.08z"
          />
          <path
            fill="#FBBC05"
            d="M10.25 28.33c-1.61-4.8-1.61-10.4 0-15.2L3.34 7.76C-1.12 14.36-1.12 24.7 3.34 31.3l6.91-5.37z"
          />
          <path
            fill="#EA4335"
            d="M24 46c5.34 0 9.86-1.76 13.32-4.79l-6.91-5.37C27.91 37.7 24 38.5 24 38.5c-6.58 0-12.02-4.12-14.25-9.97l-6.91 5.37C7.27 41.02 14.73 46 24 46z"
          />
        </svg>
        <span>Sign in with Google</span>
      </button>
    </div>
  );
};

export default GoogleBtn;
