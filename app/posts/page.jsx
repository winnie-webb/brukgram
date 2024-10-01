"use client";
import { useState } from "react";
import { db, storage } from "../../firebase"; // Firestore and Storage instance
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // For image/video upload
import { useAuth } from "../context/AuthContext"; // Get user auth info
import { v4 as uuidv4 } from "uuid"; // For generating unique file names
import Cropper from "react-easy-crop"; // Image cropping tool
import { Slider, Button } from "@mui/material"; // Slider for zoom
import { IoIosPlay } from "react-icons/io"; // Play icon for video
import VideoPlayer from "../components/VideoPlayer"; // Custom video player component

export default function CreatePost() {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null); // Store image/video file
  const [croppedMedia, setCroppedMedia] = useState(null); // Cropped image/video
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth(); // Get the current user from AuthContext

  // Cropping state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

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

  const onCropComplete = (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
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
      if (media) {
        if (checkMediaType(media) === "image") {
          // Handle image cropping and upload
          const croppedBlob = await getCroppedImg(media, croppedAreaPixels);
          const mediaRef = ref(storage, `posts/${uuidv4()}_${media.name}`);
          const snapshot = await uploadBytes(mediaRef, croppedBlob);
          mediaUrl = await getDownloadURL(snapshot.ref);
        } else {
          // Handle video upload
          const mediaRef = ref(storage, `posts/${uuidv4()}_${media.name}`);
          const snapshot = await uploadBytes(mediaRef, media);
          mediaUrl = await getDownloadURL(snapshot.ref);
        }
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

  // Converts cropped area into a Blob that can be uploaded
  const getCroppedImg = async (file, croppedAreaPixels) => {
    const image = await createImage(URL.createObjectURL(file));
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const { width, height } = croppedAreaPixels;
    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      width,
      height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg");
    });
  };

  // Helper to create an image object from a URL
  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.src = url;
      image.onload = () => resolve(image);
      image.onerror = (error) => reject(error);
    });

  return (
    <div className="create-post-container mt-14 md:mt-0 max-w-lg mx-auto p-4">
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

        {/* Media Preview */}
        {media && checkMediaType(media) === "image" && (
          <div className="relative w-full h-64">
            <Cropper
              image={URL.createObjectURL(media)}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3} // Example aspect ratio, change as needed
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
            <div className="flex justify-center mt-4">
              <Slider
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e, zoom) => setZoom(zoom)}
              />
            </div>
          </div>
        )}

        {media && checkMediaType(media) === "video" && (
          <VideoPlayer videoSrc={URL.createObjectURL(media)} />
        )}

        <button
          type="submit"
          className={`bg-indigo-600 text-white py-2 px-4 rounded-md ${
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
