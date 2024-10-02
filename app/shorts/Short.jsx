import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FiUser } from "react-icons/fi";
import { IoChatbubbleOutline, IoHeartOutline } from "react-icons/io5";

function Short({ short }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef();
  useEffect(() => {
    // Get user with author id from short
  });
  const togglePlayPause = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="snap-start h-screen w-full relative flex justify-center items-center md:w-[30%] md:ml-[20%]">
      <div className="relative w-full h-full">
        {/* Video element */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover" // Fullscreen on mobile, responsive on larger screens
          src={short.mediaUrl}
          autoPlay
          loop
          onClick={togglePlayPause} // Toggle play/pause on click
        />

        {/* Video overlay */}
        <div className="absolute left-4 text-white z-10">
          <div className="flex bottom-20 items-center space-x-2 mb-2">
            <Image
              className="w-10 h-10 rounded-full"
              width={40}
              height={40}
              src={"/default-user.jpg"}
              alt={short.content}
            />
            <span className="font-bold">{short.authorName}</span>
          </div>
          <p>{short.content}</p>
        </div>

        {/* Likes and Comments */}
        <div className="absolute bottom-20 right-4 text-white flex flex-col space-y-4 z-10">
          <button className="flex flex-col items-center">
            <IoHeartOutline size={28} />
            <span>{short.likesCount || 0}</span>
          </button>
          <button className="flex flex-col items-center">
            <IoChatbubbleOutline size={28} />
            <span>{short.commentsCount || 0}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
export default Short;
