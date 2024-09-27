"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import Link from "next/link";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      console.log(user);
    });
    return () => unsubscribe();
  }, []);
  return (
    !loading &&
    user && (
      <>
        <div className="container">
          <h1>Welcome, {user.email}!</h1>
        </div>
        <Link href={`/profile/${user.uid}`}>Profile</Link>
      </>
    )
  );
}
