import { useEffect, useRef, useState } from "react";
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
import {
  IoChatbubbleOutline,
  IoHeartOutline,
  IoHeart,
  IoVolumeMute,
  IoVolumeHigh,
} from "react-icons/io5";
import FollowButton from "../components/FollowBtn";
import { CommentBox } from "../components/CommentBox";
import { useAuth } from "../context/AuthContext";
import sendNotification from "../utils/sendNotification";

function Short({ short, lastVideoRef }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start with video muted
  const { user } = useAuth();
  const videoRef = useRef(null);
  const [author, setAuthor] = useState(null);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  // Fetch the author of the post
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

  // Fetch and subscribe to comments
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

  // Fetch and subscribe to likes
  useEffect(() => {
    const fetchLikes = async () => {
      const likesRef = collection(db, "posts", short.id, "likes");

      const unsubscribeLikes = onSnapshot(likesRef, (snapshot) => {
        setLikes(snapshot.docs.length);
        const userLikes = snapshot.docs.find((doc) => doc.id === user?.uid);
        setHasLiked(!!userLikes);
      });

      return () => unsubscribeLikes();
    };

    if (user) fetchLikes();
  }, [short.id, user]);

  // Observer to detect if video is in view and handle autoplay and mute/unmute
  // Observer to detect if video is in view and handle autoplay and mute/unmute
  useEffect(() => {
    const videoElement = videoRef.current; // Store the video element in a variable

    if (!videoElement) return; // Early return if video element doesn't exist yet

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log("Intersection detected");
          videoElement.play();
          videoElement.muted = isMuted; // Mute by default when playing
          setIsPlaying(true);
        } else {
          videoElement.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.5 } // Video must be at least 50% in view to play
    );

    observer.observe(videoElement); // Observe the video element

    return () => {
      // Cleanup: Unobserve the video element on component unmount or when ref changes
      if (videoElement) {
        observer.unobserve(videoElement);
      }
    };
  }, [isMuted]);

  // Handle mute/unmute when the video is clicked
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLike = async () => {
    if (!user) return;

    const likeRef = doc(db, "posts", short.id, "likes", user.uid);

    if (hasLiked) {
      await deleteDoc(likeRef);
    } else {
      await setDoc(likeRef, {
        userId: user.uid,
      });
      sendNotification(
        user.uid,
        short.id,
        short.authorId,
        "like",
        "liked your post"
      );
    }
  };

  return (
    author && (
      <div
        className="snap-start h-screen w-full relative flex justify-center items-center md:w-[30%] md:mx-auto"
        ref={lastVideoRef}
      >
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            src={short.mediaUrl}
            // onLoadedData={()=>setTimeout(()=>toggleMute())}
            loop
            playsInline
            autoPlay
            muted={isMuted} // Ensure it's muted on start for autoplay
            onClick={toggleMute} // Toggle mute/unmute on video click
          />

          <div className="absolute bottom-10 left-4 text-white z-10">
            <div className="flex items-center space-x-2 mb-2">
              <Image
                className="w-10 h-10 rounded-full"
                width={40}
                height={40}
                src={author.profilePictureUrl || "/default-user.jpg"}
                alt={short.content}
              />
              <span className="font-bold">{author.displayName}</span>
              <FollowButton targetUserId={short.authorId}></FollowButton>
            </div>
            <p>{short.content}</p>
          </div>

          {comments && (
            <div className="absolute bottom-10 right-4 flex flex-col space-y-4 z-10">
              <button
                onClick={handleLike}
                className="flex flex-col items-center"
              >
                {hasLiked ? (
                  <IoHeart className="text-red-500" size={28} />
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
              <div className=" text-white cursor-pointer" onClick={toggleMute}>
                {isMuted ? (
                  <IoVolumeMute size={28} />
                ) : (
                  <IoVolumeHigh size={28} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  );
}

export default Short;
