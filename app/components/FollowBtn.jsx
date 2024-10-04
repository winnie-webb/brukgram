"use client";
import { useAuth } from "@/app/context/AuthContext";
import { db } from "@/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  setDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";

const FollowButton = ({ targetUserId }) => {
  const { user } = useAuth(); // Current logged-in user
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !targetUserId || user.uid === targetUserId) return; // Prevent self-following

    const checkFollowingStatus = async () => {
      const currentUserRef = doc(db, "users", user.uid);
      const currentUserSnap = await getDoc(currentUserRef);

      if (currentUserSnap.exists()) {
        const currentUserData = currentUserSnap.data();
        setIsFollowing(currentUserData.following?.includes(targetUserId));
      }
    };

    checkFollowingStatus();
  }, [user, targetUserId]);

  const handleFollow = async () => {
    if (!user || !targetUserId || loading) return;
    setLoading(true);

    const currentUserRef = doc(db, "users", user.uid);
    const targetUserRef = doc(db, "users", targetUserId);

    try {
      if (isFollowing) {
        // Unfollow logic
        await updateDoc(currentUserRef, {
          following: arrayRemove(targetUserId),
        });
        await updateDoc(targetUserRef, {
          followers: arrayRemove(user.uid),
        });
        setIsFollowing(false);
      } else {
        // Follow logic
        await updateDoc(currentUserRef, {
          following: arrayUnion(targetUserId),
        });
        await updateDoc(targetUserRef, {
          followers: arrayUnion(user.uid),
        });
        const followerDoc = await getDoc(doc(db, "users", user.uid));
        const followerData = followerDoc.data();

        // Create a notification for the followed user
        const notificationRef = doc(
          collection(db, "users", targetUserId, "notifications")
        );
        await setDoc(notificationRef, {
          type: "follow",
          message: `${followerData.displayName} started following you`,
          senderId: user.uid,
          senderDisplayName: followerData.displayName, // Store the follower's display name
          timestamp: serverTimestamp(),
          isRead: false,
        });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error updating follow status: ", error);
    }

    setLoading(false);
  };

  // Don't show the button if the current user is trying to follow themselves
  if (user.uid === targetUserId) return null;

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`px-2 py-[0.05rem] rounded-sm ${
        isFollowing ? "bg-gray-300 text-black" : "bg-indigo-500 text-white"
      }`}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
};

export default FollowButton;
