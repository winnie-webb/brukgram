"use client";
import { useEffect, useState } from "react";
import { auth } from "../../../firebase"; // Firebase auth instance
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase"; // Firestore instance
import Link from "next/link";

const ProfilePage = ({ params }) => {
  const uid = params.uid;
  const [userData, setUserData] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Get the currently logged-in user ID
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null); // Reset if not logged in
      }
    });

    return () => unsubscribe(); // Clean up the subscription
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (uid) {
        try {
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            console.error("User not found");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    if (currentUserId) {
      console.log("User Logged In");
      fetchUserData(); // Fetch only if logged in
    }
  }, [uid, currentUserId]);

  if (!userData) return <div>Loading...</div>;
  const isOwnProfile = currentUserId === uid; // Check if viewing own profile

  return (
    <div className="ml-[20%]">
      <h1>{userData.email}</h1>
      <p>{userData.bio}</p>

      {/* Render additional options based on profile view */}
      {isOwnProfile ? (
        <div>
          <Link href={"/posts"}>
            <button>Create Post</button>
          </Link>
          <button>Edit Profile</button>
          {/* Render other personal options like changing password */}
        </div>
      ) : (
        <button>Follow</button> // Show follow button for other users
      )}
    </div>
  );
};

export default ProfilePage;
