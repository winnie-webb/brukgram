"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/firebase";
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "@/app/context/AuthContext";
import Image from "next/image";
import { BiSend } from "react-icons/bi";
import { IoArrowBack } from "react-icons/io5";
import { useRouter } from "next/navigation";

const ChatView = ({ params }) => {
  const { id } = params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState(null);
  const router = useRouter();

  // Fetch the other user's info (name and profile picture)
  useEffect(() => {
    const getOtherUser = async () => {
      const convoDoc = await getDoc(doc(db, "conversations", id));
      const participants = convoDoc.data().participants;
      const otherUserId = participants.find((uid) => uid !== user.uid);
      if (otherUserId) {
        const otherUserDoc = await getDoc(doc(db, "users", otherUserId));
        setOtherUser(otherUserDoc.data());
      } else {
        const currentUserId = participants.find((uid) => uid === user.uid);
        const currentUserDoc = await getDoc(doc(db, "users", currentUserId));
        setOtherUser(currentUserDoc.data());
      }
    };

    getOtherUser();
  }, [id, user]);

  // Fetch and sort messages by timestamp
  useEffect(() => {
    const messagesRef = collection(db, "conversations", id, "messages");
    const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort messages by timestamp (ascending)
      const sortedMessages = messagesData.sort((a, b) => {
        if (a.timestamp && b.timestamp) {
          return a.timestamp.seconds - b.timestamp.seconds;
        }
        return 0; // Keep messages without a timestamp in their current order
      });

      setMessages(sortedMessages);
    });

    return () => unsubscribe();
  }, [id]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    const messageRef = collection(db, "conversations", id, "messages");
    await addDoc(messageRef, {
      senderId: user.uid,
      text: newMessage,
      timestamp: serverTimestamp(),
    });
    setNewMessage(""); // Clear input after sending
  };

  return (
    <div className="h-[100vh] relative bg-gray-100 z-50 max-w-md mx-auto">
      {/* Display other user's info */}
      {otherUser && (
        <div className="flex fixed bg-white w-full top-0 left-0 p-4 items-center mb-4">
          <button className="mr-3" onClick={() => router.back()}>
            <IoArrowBack className="text-2xl"></IoArrowBack>
          </button>
          <Image
            src={otherUser.profilePictureUrl || "/default-user.jpg"}
            alt={`${otherUser.displayName}'s profile picture`}
            className="rounded-[50%] w-10 h-10 object-cover"
            width={40}
            height={40}
          />
          <span className="ml-3 font-semibold text-lg">
            {otherUser.displayName}
          </span>
        </div>
      )}

      <div className="h-full pt-20 overflow-y-scroll border rounded p-3 ">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex mb-3 ${
              msg.senderId === user.uid ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-2 rounded-lg max-w-xs ${
                msg.senderId === user.uid
                  ? "bg-indigo-600 self-end text-white"
                  : "bg-white text-black"
              }`}
            >
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={sendMessage}
        className="flex fixed md:relative bottom-0 w-full z-50"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
          className="border p-2 w-full"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white p-2 rounded-r-md"
        >
          <BiSend></BiSend>
        </button>
      </form>
    </div>
  );
};

export default ChatView;
