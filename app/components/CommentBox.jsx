"use client";
import { db } from "../../firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";

export const CommentBox = ({ postId, user }) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [userNames, setUserNames] = useState({}); // To store userId -> displayName mapping

  useEffect(() => {
    const commentsRef = collection(db, "posts", postId, "comments");

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
  }, [postId]);

  // Fetch the username for each comment
  useEffect(() => {
    const fetchUserNames = async () => {
      const newUserNames = { ...userNames }; // Copy current state

      const userFetchPromises = comments.map(async (comment) => {
        const { userId } = comment;
        // Only fetch if userId is not in the current userNames state
        if (!newUserNames[userId]) {
          const userRef = doc(db, "users", userId);
          const userSnap = await getDoc(userRef);
          // console.log(userSnap.data());
          if (userSnap.exists()) {
            newUserNames[userId] = userSnap.data().displayName;
          } else {
            newUserNames[userId] = "Unknown"; // Fallback if no user data
          }
        }
      });

      await Promise.all(userFetchPromises);
      setUserNames(newUserNames); // Update state after all usernames are fetched
    };

    if (comments.length > 0) {
      fetchUserNames();
    }
  }, [comments]); // Re-run only when comments change

  // Handle Comment Submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const commentRef = collection(db, "posts", postId, "comments");
    await setDoc(doc(commentRef), {
      userId: user.uid,
      comment: comment.trim(),
      timestamp: new Date(),
    });

    setComment(""); // Reset the input
  };

  return (
    <div className="mt-4">
      <form onSubmit={handleCommentSubmit}>
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full p-2 border rounded-md"
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Post
        </button>
      </form>

      <div className="mt-4">
        {comments.map((comment, index) => (
          <div key={index} className="mb-2">
            <p className="font-semibold">
              {userNames[comment.userId] || "Loading..."}
            </p>
            <p>{comment.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
