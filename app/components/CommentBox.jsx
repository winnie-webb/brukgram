import { db } from "../../firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import React, { useEffect, useState, useRef, useCallback } from "react"; // Import useCallback
import { AiOutlineClose, AiOutlineSend } from "react-icons/ai";
import Image from "next/image";
import VideoPlayer from "./VideoPlayer";
import sendNotification from "../utils/sendNotification";

export const CommentBox = ({ post, user, onClose }) => {
  const { id, mediaUrl, mediaType, content, authorId } = post;
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [userNames, setUserNames] = useState({}); // To store userId -> displayName mapping
  const [userPhotos, setUserPhotos] = useState({}); // Store user profile photos
  const modalRef = useRef(null);

  // Fetch usernames and photos only when comments change or on initial render
  const fetchUsernamesAndPhotos = useCallback(async () => {
    const newUserNames = { ...userNames };
    const newUserPhotos = { ...userPhotos };

    const userFetchPromises = comments.map(async (comment) => {
      const { userId } = comment;
      if (!newUserNames[userId]) {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          newUserNames[userId] = userData.displayName;
          newUserPhotos[userId] =
            userData.profilePictureUrl || "/default-user.jpg";
        } else {
          newUserNames[userId] = "Unknown";
        }
      }
    });

    await Promise.all(userFetchPromises);
    setUserNames(newUserNames);
    setUserPhotos(newUserPhotos);
  }, [comments, userNames, userPhotos]); // Memoize the function

  useEffect(() => {
    const commentsRef = collection(db, "posts", id, "comments");

    const unsubscribeComments = onSnapshot(commentsRef, (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(commentsData);
      fetchUsernamesAndPhotos(); // Fetch usernames and photos when new comments arrive
    });

    return () => {
      unsubscribeComments();
    };
  }, [id, fetchUsernamesAndPhotos]); // Now fetchUsernamesAndPhotos is stable

  // Handle Comment Submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const commentRef = collection(db, "posts", id, "comments");

    try {
      await setDoc(doc(commentRef), {
        userId: user.uid,
        comment: comment.trim(),
        timestamp: new Date(),
      });

      await sendNotification(
        user.uid,
        id,
        authorId,
        "comment",
        "commented on your post"
      );

      setComment("");
    } catch (error) {
      console.error("Error submitting comment: ", error);
    }
  };

  const handleModalClick = (e) => {
    e.stopPropagation(); // Prevent clicks inside the modal from closing it
  };

  return (
    <div
      onClick={(e) => {
        onClose();
      }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
    >
      <div
        ref={modalRef}
        onClick={handleModalClick}
        className="bg-white w-full h-full md:h-[80%] md:max-w-[60%] md:flex md:flex-row rounded-lg relative"
      >
        {/* Post Section for larger screens */}
        <div className="hidden md:flex md:w-3/5">
          {/* Media */}
          <div className="relative w-full h-64 md:h-full">
            {mediaType === "image" ? (
              <Image
                src={mediaUrl}
                alt={content}
                fill={true}
                className="object-fill"
              />
            ) : mediaType === "video" ? (
              <VideoPlayer videoSrc={mediaUrl} />
            ) : (
              <p>{content}</p>
            )}
          </div>
        </div>

        {/* Comment Section for all screens */}
        <div className="w-full md:w-2/5 p-4 border-l md:overflow-y-auto text-black">
          <form
            onSubmit={handleCommentSubmit}
            className="flex space-x-2 items-center"
          >
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-2 border rounded-md "
            />
            <button
              type="submit"
              className="p-2 bg-indigo-600 text-white rounded-md flex items-center justify-center"
            >
              <AiOutlineSend className="w-5 h-5" />
            </button>
          </form>

          {/* Comments list */}
          <div className="mt-4 space-y-4">
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <div
                  key={comment.userId + index}
                  className="flex mb-2 space-x-2 items-start"
                >
                  <Image
                    className="rounded-[50%] w-10 h-10"
                    src={userPhotos[comment.userId] || "/default-user.jpg"}
                    alt="Profile"
                    width={30}
                    height={30}
                  />
                  <div>
                    <p className="font-semibold">
                      {userNames[comment.userId] || "Loading..."}
                    </p>
                    <p>{comment.comment}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No comments yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* For smaller screens, show only the comments section */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed inset-0 md:hidden bg-white z-50 flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 z-10"
        >
          <AiOutlineClose className="w-6 h-6" />
        </button>

        {/* Comments list */}
        <div className="flex-grow p-4 overflow-y-auto">
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <div key={index} className="flex space-x-2 mb-2 items-start">
                <Image
                  className="rounded-full w-10 h-10"
                  src={userPhotos[comment.userId] || "/default-user.jpg"}
                  alt="Profile"
                  width={30}
                  height={30}
                />
                <div>
                  <p className="font-semibold">
                    {userNames[comment.userId] || "Loading..."}
                  </p>
                  <p>{comment.comment}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No comments yet.</p>
          )}
        </div>

        {/* Comment input section */}
        <form
          onSubmit={handleCommentSubmit}
          className="flex space-x-2 items-center p-4 border-t"
        >
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-2 border rounded-md"
          />
          <button
            type="submit"
            className="p-2 bg-indigo-600 text-white rounded-md flex items-center justify-center"
          >
            <AiOutlineSend className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
