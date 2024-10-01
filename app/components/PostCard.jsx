"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  doc,
  collection,
  setDoc,
  onSnapshot,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import VideoPlayer from "./VideoPlayer"; // Assuming you have a VideoPlayer component
import { useAuth } from "../context/AuthContext";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { CommentBox } from "./CommentBox";
import { FiMessageCircle, FiSend } from "react-icons/fi";
import Link from "next/link";

const PostCard = ({ post }) => {
  const { id, mediaUrl, mediaType, content, authorId } = post;
  const { user } = useAuth();
  const [likes, setLikes] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [postUser, setPostUser] = useState(null);

  // Fetch likes and comments on mount and listen to changes
  useEffect(() => {
    if (id) {
      const likesRef = collection(db, "posts", id, "likes");

      const unsubscribeLikes = onSnapshot(likesRef, (snapshot) => {
        setLikes(snapshot.docs.map((doc) => doc.id));
        setHasLiked(snapshot.docs.some((doc) => doc.id === user?.uid));
      });

      return () => {
        unsubscribeLikes();
      };
    }
  }, [id, user?.uid]);

  // Fetch the post author's user information
  useEffect(() => {
    const getPostUser = async () => {
      if (authorId && !postUser) {
        const postRef = doc(db, "users", authorId);
        const postUserSnap = await getDoc(postRef);
        if (postUserSnap.exists()) {
          setPostUser(postUserSnap.data());
        }
      }
    };
    getPostUser();
  }, [authorId, postUser]);

  // Handle Like Action
  const handleLike = async () => {
    if (!user) return; // User must be logged in

    const likeRef = doc(db, "posts", id, "likes", user.uid);

    if (hasLiked) {
      // Unlike the post
      await deleteDoc(likeRef);
    } else {
      // Like the post
      await setDoc(likeRef, {
        userId: user.uid,
      });
    }
  };

  return (
    <div className="relative bg-white mb-6">
      <div className="flex items-center mb-2">
        {postUser ? (
          <>
            <Image
              className="rounded-full w-12 h-12"
              src={postUser.profilePictureUrl || "/default-user.jpg"}
              alt="Profile"
              width={50}
              height={50}
            />
            <Link href={`/profile/${user.uid}`} className="font-semibold ml-2">
              {postUser.displayName}
            </Link>
          </>
        ) : (
          <p className="font-semibold">Anonymous</p>
        )}
      </div>
      {mediaType === "image" ? (
        <div className="relative w-full mb-1 aspect-w-16 aspect-h-16">
          <Image className="object-cover" src={mediaUrl} alt={content} fill />
        </div>
      ) : (
        <VideoPlayer videoSrc={mediaUrl} />
      )}

      <div className="px-2 md:px-0">
        <p className="text-gray-800">{content}</p>

        <div className="flex gap-x-2 mt-2 items-center">
          <button onClick={handleLike} className="flex items-center">
            {hasLiked ? (
              <AiFillHeart className="w-6 h-6 text-red-500" />
            ) : (
              <AiOutlineHeart className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={() => setShowCommentBox(!showCommentBox)}
            className="flex items-center"
          >
            <FiMessageCircle className="w-6 h-6" />
          </button>

          <button className="flex items-center">
            <FiSend className="w-6 h-6" />
          </button>
        </div>
        <span className="mt-2 ml-1 block font-bold text-gray-600">
          {likes.length} {likes.length === 1 ? "Like" : "Likes"}
        </span>

        {/* Comment Section */}
        {showCommentBox && (
          <CommentBox
            post={post} // Pass the entire post
            user={user}
            onClose={() => setShowCommentBox(false)}
          />
        )}
      </div>
    </div>
  );
};

export default PostCard;
