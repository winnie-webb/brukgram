"use client";
import { useRef, useState } from "react";
import { IoIosPlay } from "react-icons/io";

const VideoPlayer = ({ videoSrc }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div onClick={handlePlayPause} className="relative h-full">
      <video
        ref={videoRef}
        src={videoSrc}
        className="h-full object-contain"
        playsInline
        controls={false}
      />

      {!isPlaying && (
        <button
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
          aria-label="Play video"
        >
          <IoIosPlay className="text-white text-6xl" />
        </button>
      )}
    </div>
  );
};

export default VideoPlayer;
