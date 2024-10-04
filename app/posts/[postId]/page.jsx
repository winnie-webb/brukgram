// app/posts/[postId].jsx
"use client";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import PostCard from "@/app/components/PostCard";
import { IoArrowBack } from "react-icons/io5";
import { useRouter } from "next/navigation";

const PostPage = ({ params }) => {
  const [post, setPost] = useState(null);
  const router = useRouter();
  const { postId } = params;

  useEffect(() => {
    const fetchPost = async () => {
      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        setPost({ id: postSnap.id, ...postSnap.data() });
      } else {
        console.log("No such post!");
      }
    };

    fetchPost();
  }, [postId]);

  return (
    <div className="md:ml-[20%] mt-24 md:mt-0 md:w-1/4 md:p-10">
      <div className="mx-auto md:w-[90%]">
        <button
          className="fixed top-14 left-4 text-black"
          onClick={() => router.back()}
        >
          <IoArrowBack size={28} className="text-black" />
        </button>
        {post && <PostCard post={post} />}
        {!post && <p>Loading...</p>}
      </div>
    </div>
  );
};

export default PostPage;
