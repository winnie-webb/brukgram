// app/profile/[uid]/ProfilePage.jsx
"use client";
import FollowButton from "@/app/components/FollowBtn";
import VideoPlayer from "@/app/components/VideoPlayer";
import { useAuth } from "@/app/context/AuthContext";
import { db } from "@/firebase";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const ProfilePage = () => {
  const [userProfile, setUserProfile] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const { user } = useAuth();
  const params = useParams();
  const [isSameUser, setIsSameUser] = useState(false);
  const currentUserProfileId = params.uid;

  useEffect(() => {
    setIsSameUser(user.uid === currentUserProfileId);
  }, [currentUserProfileId, user.uid]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userRef = doc(db, "users", currentUserProfileId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserProfile(userSnap.data());
      } else {
        console.log("No such user!");
      }
    };

    fetchUserProfile();
  }, [currentUserProfileId]);

  useEffect(() => {
    const postsRef = collection(db, "posts");
    const unsubscribe = onSnapshot(postsRef, (snapshot) => {
      const postsData = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((post) => post.authorId === currentUserProfileId); // Filter posts by userId

      setUserPosts(postsData);
    });

    return () => unsubscribe();
  }, [currentUserProfileId]);

  return (
    <div className="py-2 mt-14 md:mt-0 md:w-60% md:ml-[20%] md:p-10">
      <div className="md:w-[70%] mx-auto">
        <div className="flex justify-center md:justify-normal relative items-center mb-4">
          <Image
            src={userProfile.profilePictureUrl || "/default-user.jpg"}
            alt="Profile"
            className="rounded-full w-20 h-20 mr-4"
            width={128}
            height={128}
          />
          <div>
            <div className="flex gap-x-2">
              <h1 className="text-2xl font-bold">{userProfile.displayName}</h1>
              <FollowButton targetUserId={currentUserProfileId} />
            </div>
            {isSameUser && (
              <div className="md:absolute top-10 right-0">
                <Link
                  href="/settings"
                  className="rounded-lg text-indigo-700 font-bold"
                >
                  Edit Profile
                </Link>
              </div>
            )}
            <p className="text-gray-600">
              {userProfile.bio || "No bio available."}
            </p>
            <div className="flex mt-2 space-x-4">
              <div>
                <span className="font-semibold">{userPosts.length}</span> Posts
              </div>
              <div>
                <span className="font-semibold">
                  {userProfile.followers?.length || 0}
                </span>{" "}
                Followers
              </div>
              <div>
                <span className="font-semibold">
                  {userProfile.following?.length || 0}
                </span>{" "}
                Following
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-[0.1rem]">
          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="relative h-full"
              >
                {post.mediaType === "image" ? (
                  <Image
                    src={post.mediaUrl}
                    alt="Post"
                    className="object-cover"
                    fill
                  />
                ) : (
                  <VideoPlayer videoSrc={post.mediaUrl} />
                )}
              </Link>
            ))
          ) : (
            <p>No posts available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
