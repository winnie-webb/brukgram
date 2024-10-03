"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import GoogleBtn from "../components/auth-utils/GoogleBtn";
import { registerUser } from "../components/auth-utils/registerUser";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const { currentUser, loading } = useAuth();
  const [error, setError] = useState(null);

  const router = useRouter();

  const checkDisplayNameExists = async (displayName) => {
    const displayNameRef = collection(db, "users");
    const querySnapshot = await getDocs(displayNameRef);
    const existingNames = querySnapshot.docs.map(
      (doc) => doc.data().displayName
    );
    return existingNames.includes(displayName);
  };

  useEffect(() => {
    if (!loading && currentUser) {
      router.push("/"); // Redirect if logged in
    }
  }, [currentUser, loading, router]);

  const validationSchema = Yup.object().shape({
    email: Yup.string().required("Email is required").email("Email is invalid"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
    displayName: Yup.string().required("Display name is required"),
  });

  const onSubmit = async (data) => {
    const { email, password, displayName } = data;
    try {
      const existing = await checkDisplayNameExists(displayName);
      if (existing) {
        setError("This display name is already in use.");
        return;
      }
      registerUser(email, password, displayName, setError, router);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already in use.");
      } else {
        setError(`Please ensure your credentials are correct. ${err.message}`);
      }
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-md">
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 text-black"
        >
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium ">
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              {...register("displayName")}
              onChange={(e) => setDisplayName(e.target.value)}
              className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.displayName && (
              <p className="text-red-500">{errors.displayName.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium ">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              {...register("email")}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium ">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              {...register("password")}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.password && (
              <p className="text-red-500">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-200"
          >
            Sign Up
          </button>
        </form>
        <GoogleBtn setError={setError} />

        <p className="text-center text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-600 hover:text-indigo-500">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
