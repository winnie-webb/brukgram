"use client";
import { useState } from "react";
import { db, storage } from "../../firebase"; // Firestore and Storage instance
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // For image/video upload
import { useAuth } from "../context/AuthContext"; // Get user auth info
import { v4 as uuidv4 } from "uuid"; // For generating unique file names

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null); // Store image/video file
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth(); // Get the current user from AuthContext

  const checkMediaType = (file) => {
    const mimeType = file.type;

    if (mimeType.startsWith("image/")) {
      return "image"; // It's an image
    } else if (mimeType.startsWith("video/")) {
      return "video"; // It's a video
    } else {
      return "unsupported"; // Other file types
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to create a post.");
      return;
    }

    setLoading(true);
    let mediaUrl = "";

    try {
      // If a media file is selected, upload it to Firebase Storage
      if (media) {
        const mediaRef = ref(storage, `posts/${uuidv4()}_${media.name}`);
        const snapshot = await uploadBytes(mediaRef, media);
        mediaUrl = await getDownloadURL(snapshot.ref);
      }

      // Add post data to Firestore
      await addDoc(collection(db, "posts"), {
        content,
        mediaUrl, // Store the media URL (empty string if no file)
        authorId: user.uid,
        postId: uuidv4(),
        timestamp: serverTimestamp(),
        mediaType: checkMediaType(media),
      });

      setContent(""); // Clear input after submitting
      setMedia(null); // Reset the media state
      setLoading(false);
    } catch (err) {
      setError("Failed to create post: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="create-post-container max-w-lg mx-auto p-4">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <textarea
          className="border rounded-md p-2"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setMedia(e.target.files[0])}
          className="border rounded-md p-2"
        />
        <button
          type="submit"
          className={`bg-blue-500 text-white py-2 px-4 rounded-md ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Posting..." : "Post"}
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
}
