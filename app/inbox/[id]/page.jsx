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

const ChatView = ({ params }) => {
  const { id } = params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState(null);

  // Fetch the other user's info (name and profile picture)
  useEffect(() => {
    const getOtherUser = async () => {
      const convoDoc = await getDoc(doc(db, "conversations", id));
      const participants = convoDoc.data().participants;
      const otherUserId = participants.find((uid) => uid !== user.uid);

      if (otherUserId) {
        const otherUserDoc = await getDoc(doc(db, "users", otherUserId));
        setOtherUser(otherUserDoc.data());
      }
    };

    getOtherUser();
  }, [id, user]);

  useEffect(() => {
    const messagesRef = collection(db, "conversations", id, "messages");
    const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesData);
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
    <div className="p-4 mt-10 max-w-md mx-auto">
      {/* Display other user's info */}
      {otherUser && (
        <div className="flex items-center mb-4">
          <Image
            src={otherUser.profilePicture}
            alt={`${otherUser.displayName}'s profile picture`}
            className=" rounded-full"
            width={30}
            height={30}
          />
          <span className="ml-3 font-semibold text-lg">
            {otherUser.displayName}
          </span>
        </div>
      )}

      <div className="h-80 overflow-y-scroll border rounded p-3 bg-gray-100">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex mb-3 ${
              msg.senderId === user.uid ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-2 rounded-lg max-w-xs text-white ${
                msg.senderId === user.uid
                  ? "bg-blue-500 self-end"
                  : "bg-gray-300 text-black"
              }`}
            >
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="flex mt-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
          className="border p-2 w-full rounded-l-md"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-r-md"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatView;
