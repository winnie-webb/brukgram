"use client"; // Client-side component

import { useState } from "react";
import { auth } from "../../firebase"; // Import the googleProvider
import { signInWithEmailAndPassword } from "firebase/auth";

import { useRouter } from "next/navigation";
import Link from "next/link";
import GoogleBtn from "../components/auth-utils/GoogleBtn";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  // Handle email/password login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/"); // Redirect to homepage after login
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-lg rounded-md">
        <h2 className="text-2xl font-bold text-gray-900 text-center">Login</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Email/Password Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-200"
          >
            Login
          </button>
        </form>
        <GoogleBtn setError={setError} />

        <p className="text-center text-gray-600">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
