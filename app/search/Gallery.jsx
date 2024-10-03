import React from "react";
import Image from "next/image";
import VideoPlayer from "../components/VideoPlayer";

const Gallery = ({ media }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
      {media.map((item, index) => (
        <div key={index} className="relative w-full h-40 md:h-60">
          {item.mediaType === "image" ? (
            <Image
              src={item.mediaUrl}
              alt="Media"
              layout="fill"
              className="object-cover"
            />
          ) : item.mediaType === "video" ? (
            <VideoPlayer videoSrc={item.mediaUrl} />
          ) : (
            <p>{item.content}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default Gallery;
