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
    <div className="relative overflow-hidden">
      <div className="relative">
        <video
          ref={videoRef}
          src={videoSrc}
          className="rounded-lg"
          onClick={handlePlayPause}
          playsInline
          controls={false} // Disable native controls
        />

        {!isPlaying && (
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
            aria-label="Play video"
          >
            <IoIosPlay className="text-white text-6xl" />
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
