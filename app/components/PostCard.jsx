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
import {
  AiOutlineHeart,
  AiFillHeart,
  AiOutlineComment,
  AiOutlineShareAlt,
} from "react-icons/ai";
import { CommentBox } from "./CommentBox";
import defaultUser from "../public/default-user.jpg";
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
    <div className="relative bg-white mb-6 p-4 rounded-lg">
      <div className="flex items-center">
        {postUser ? (
          <>
            <Image
              className="rounded-full w-12 h-12"
              src={postUser.profilePictureUrl || defaultUser} // Assuming the post user has a profile picture
              alt="Profile"
              width={50}
              height={50}
            />
            <h3 className="font-semibold">{postUser.userName}</h3>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div className="relative h-60 aspect-w-16 aspect-h-9 w-full mb-4">
        {mediaType === "image" ? (
          <Image
            className="object-cover"
            src={mediaUrl}
            alt={content}
            fill={true}
          />
        ) : mediaType === "video" ? (
          <VideoPlayer videoSrc={mediaUrl} />
        ) : (
          <p>{content}</p>
        )}
      </div>

      <p className="text-gray-700 mb-4">{content}</p>

      <div className="flex gap-x-2 mt-4 items-center">
        <button onClick={handleLike} className="flex items-center space-x-1">
          {hasLiked ? (
            <AiFillHeart className="w-6 h-6 text-red-500" />
          ) : (
            <AiOutlineHeart className="w-6 h-6 text-gray-500" />
          )}
        </button>

        <button
          onClick={() => setShowCommentBox(!showCommentBox)}
          className="flex items-center space-x-1"
        >
          <AiOutlineComment className="w-6 h-6 text-gray-500" />
          <span className="ml-1 font-bold text-gray-600"></span>
        </button>

        <button className="flex items-center space-x-1">
          <AiOutlineShareAlt className="w-6 h-6 text-gray-500" />
        </button>
      </div>
      <span className="mt-2 ml-1 block font-bold text-gray-600">
        {likes.length} {likes.length === 1 ? "Like" : "Likes"}
      </span>

      {/* Comment Section */}
      {showCommentBox && <CommentBox user={user} postId={id}></CommentBox>}
    </div>
  );
};

export default PostCard;
