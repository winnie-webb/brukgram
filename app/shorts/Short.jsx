"use client";

import { db } from "@/firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { IoChatbubbleOutline, IoHeartOutline, IoHeart } from "react-icons/io5"; // Import filled heart icon
import FollowButton from "../components/FollowBtn";
import { CommentBox } from "../components/CommentBox";
import { useAuth } from "../context/AuthContext";

function Short({ short, lastVideoRef, isLast }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const { user } = useAuth();
  const videoRef = useRef(null);
  const [author, setAuthor] = useState(null);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    const fetchAuthorProfile = async () => {
      try {
        const userRef = doc(db, "users", short.authorId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setAuthor(userSnap.data());
        } else {
          console.log("No such user!");
        }
      } catch (error) {
        console.error("Error fetching author:", error);
      }
    };

    fetchAuthorProfile();
  }, [short.authorId]);

  useEffect(() => {
    const commentsRef = collection(db, "posts", short.id, "comments");

    const unsubscribeComments = onSnapshot(commentsRef, (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(commentsData);
    });

    return () => {
      unsubscribeComments();
    };
  }, [short.id]);

  // Handle likes
  useEffect(() => {
    const fetchLikes = async () => {
      const likesRef = collection(db, "posts", short.id, "likes");

      const unsubscribeLikes = onSnapshot(likesRef, (snapshot) => {
        setLikes(snapshot.docs.length); // Total number of likes
        const userLikes = snapshot.docs.find((doc) => doc.id === user?.uid);
        setHasLiked(!!userLikes); // Check if the current user has liked the post
      });

      return () => unsubscribeLikes();
    };

    if (user) fetchLikes();
  }, [short.id, user]);

  // Handle play/pause on video click
  const togglePlayPause = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Handle autoplay control based on visibility using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current.play();
            videoRef.current.muted = false; // Unmute video when visible
          } else {
            videoRef.current.pause();
            videoRef.current.muted = true; // Mute video when not visible
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% of the video is visible
    );

    const currentVideoRef = videoRef.current;
    if (currentVideoRef) {
      observer.observe(currentVideoRef);
    }

    return () => {
      if (currentVideoRef) {
        observer.unobserve(currentVideoRef);
      }
    };
  }, []);

  // Handle like button click
  const handleLike = async () => {
    if (!user) return; // User must be logged in

    const likeRef = doc(db, "posts", short.id, "likes", user.uid);

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
    author && (
      <div className="snap-start h-screen w-full relative flex justify-center items-center md:w-[30%] md:mx-auto">
        <div className="relative w-full h-full">
          {/* Video element */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            src={short.mediaUrl}
            autoPlay
            loop
            onClick={togglePlayPause}
          />

          {/* Video overlay */}
          <div className="absolute bottom-8 left-4 text-white z-10">
            <div className="flex items-center space-x-2 mb-2">
              <Image
                className="w-10 h-10 rounded-full"
                width={40}
                height={40}
                src={author ? author.profilePictureUrl : "/default-user.jpg"}
                alt={short.content}
              />
              <FollowButton targetUserId={short.authorId}></FollowButton>
              <span className="font-bold">{author.displayName}</span>
            </div>
            <p>{short.content}</p>
          </div>

          {/* Likes and Comments */}
          {comments && (
            <div className="absolute bottom-8 right-4 flex flex-col space-y-4 z-10">
              <button
                onClick={handleLike}
                className="flex flex-col items-center"
              >
                {hasLiked ? (
                  <IoHeart className="text-red-500" size={28} /> // Use filled heart icon
                ) : (
                  <IoHeartOutline className="text-white" size={28} />
                )}
                <span className="text-white">{likes}</span>
              </button>
              <button
                onClick={() => setShowCommentBox(true)}
                className="flex flex-col items-center"
              >
                <IoChatbubbleOutline className="text-white" size={28} />
                <span className="text-white">{comments.length}</span>
              </button>

              {showCommentBox && (
                <CommentBox
                  post={short}
                  user={user}
                  onClose={() => setShowCommentBox(false)}
                ></CommentBox>
              )}
            </div>
          )}
        </div>
      </div>
    )
  );
}

export default Short;
