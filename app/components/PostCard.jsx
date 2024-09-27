import Image from "next/image";
import React from "react";

const PostCard = ({ post }) => {
  const { mediaUrl, mediaType, content, userName } = post;

  return (
    <div className="relative  bg-white mb-6">
      <div className="flex items-center  mb-4">
        <div>
          <h3 className="font-semibold">{userName}</h3>
        </div>
      </div>

      <div className="w-full h-full mb-4">
        {mediaType === "image" ? (
          <img
            src={mediaUrl}
            alt={content}
            className="w-full h-full object-cover"
          />
        ) : (
          <video className="w-full h-full object-cover" controls>
            <source src={mediaUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      <p className="text-gray-700">{content}</p>
    </div>
  );
};

export default PostCard;
