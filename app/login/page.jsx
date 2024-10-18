"use client";

import { useEffect, useState, useCallback } from "react";
import { auth } from "../../firebase"; // Import the googleProvider
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import GoogleBtn from "../components/auth-utils/GoogleBtn";
import { useAuth } from "../context/AuthContext"; // Use Auth context

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

const LoginPage = () => {
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user, loading } = useAuth(); // Access user and loading from context
  const searchParams = useSearchParams(); // Get search params from URL
  const recruiterQuery = searchParams.get("recruiter");
  useEffect(() => {
    if (!loading && user) {
      router.push("/"); // Redirect if logged in
    }
  }, [user, loading, router]);

  // Validation schema
  const validationSchema = Yup.object().shape({
    email: Yup.string().required("Email is required").email("Email is invalid"),
    password: Yup.string().required("Password is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue, // Allows us to programmatically set input values
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  // Handle email/password login wrapped in useCallback to memoize the function
  const handleLogin = useCallback(
    async (data) => {
      const { email, password } = data;
      try {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/"); // Redirect to homepage after login
      } catch (err) {
        if (err.code === "auth/wrong-password") {
          setError("Invalid password.");
        } else if (err.code === "auth/user-not-found") {
          setError("User not found.");
        } else {
          setError("An error occurred. Please try again.");
        }
      }
    },
    [router] // Dependencies of handleLogin
  );

  // Auto-fill credentials if recruiter query is present
  useEffect(() => {
    if (recruiterQuery) {
      // Pre-fill email and password for recruiters
      setValue("email", "recruiter@brukgram.com");
      setValue("password", "recruiting");
      // Auto-submit the form after pre-filling
      handleSubmit(handleLogin)();
    }
  }, [recruiterQuery, setValue, handleSubmit, handleLogin]); // Added handleLogin as a dependency

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-md">
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Email/Password Login Form */}
        <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
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
              {...register("email")} // Register input for validation
              className={`block w-full px-3 py-2 bg-gray-50 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
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
              {...register("password")} // Register input for validation
              className={`block w-full px-3 py-2 bg-gray-50 border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
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
          {"Don't have an account?"}{" "}
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
