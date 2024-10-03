"use client";
import { db } from "@/firebase";
import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  getDoc,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import debounce from "lodash/debounce";
import Link from "next/link";
import Image from "next/image";

const InboxPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [existingConversations, setExistingConversations] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Fetch existing conversations for the logged-in user
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.uid) return;

      try {
        const q = query(
          collection(db, "conversations"),
          where("participants", "array-contains", user.uid)
        );

        const querySnapshot = await getDocs(q);
        const conversations = await Promise.all(
          querySnapshot.docs.map(async (conversationDoc) => {
            const convoData = {
              id: conversationDoc.id,
              ...conversationDoc.data(),
            };

            // Ensure convoData.participants is an array and contains valid user IDs
            if (!Array.isArray(convoData.participants)) {
              console.error("Participants is not an array:", convoData);
              return null; // Skip this conversation if participants is invalid
            }

            // Check if it's a self-conversation (user is talking to themselves)
            let otherUserId = convoData.participants.find(
              (uid) => uid !== user.uid
            );

            // Handle self-conversation case
            if (!otherUserId) {
              otherUserId = user.uid; // In case it's a conversation with themselves
            }

            const otherUserDoc = await getDoc(doc(db, "users", otherUserId));
            if (!otherUserDoc.exists()) {
              console.error("User document not found:", otherUserId);
              return null; // Skip if the user doesn't exist
            }

            const otherUserData = otherUserDoc.data();

            return {
              ...convoData,
              otherUser: {
                displayName: otherUserData.displayName,
                profilePicture: otherUserData.profilePictureUrl, // Adjust as per your schema
              },
            };
          })
        );

        // Filter out any null values (in case some conversations were skipped)
        setExistingConversations(conversations.filter(Boolean));
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Debounced search function for users
  const searchUsers = debounce(async (value) => {
    if (!value) {
      setSearchResults([]);
      return;
    }
    try {
      const q = query(
        collection(db, "users"),
        where("displayName", ">=", value),
        where("displayName", "<=", value + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
      setError("Something went wrong with user search.");
    }
  }, 300);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    searchUsers(e.target.value);
  };

  // Handle selecting a user to create a conversation
  const handleSelectUser = async (selectedUser) => {
    if (!user || !selectedUser?.id) {
      setError("Something went wrong with the selected user data");
      return;
    }

    const convoId = [user.uid, selectedUser.id].sort().join("-"); // Create a unique conversation ID

    try {
      // Check if conversation already exists
      const convoDoc = await getDoc(doc(db, "conversations", convoId));

      if (convoDoc.exists()) {
        // Redirect to existing conversation
        router.push(`/inbox/${convoId}`);
      } else {
        // Create a new conversation if it doesn't exist
        await setDoc(doc(db, "conversations", convoId), {
          participants: [user.uid, selectedUser.id],
          createdAt: serverTimestamp(),
        });
        router.push(`/inbox/${convoId}`);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      setError("Failed to create a conversation.");
    }
  };

  return (
    <div className="p-4 md:ml-[20%] mt-10">
      <div className="mx-auto w-[95%]">
        <h1 className="text-2xl font-bold">Inbox</h1>

        {/* Input for starting a new conversation */}
        <div className="relative mt-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="Type a display name..."
            className="p-2 border rounded w-full"
          />

          {/* Dropdown search results */}
          {searchResults.length > 0 && (
            <ul className="absolute w-full bg-white border mt-1 z-10 rounded shadow-md">
              {searchResults.map((result) => (
                <li
                  key={result.id}
                  onClick={() => handleSelectUser(result)}
                  className="p-2 cursor-pointer hover:bg-gray-100"
                >
                  {result.displayName}
                </li>
              ))}
            </ul>
          )}

          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        {/* Display existing conversations */}
        <div className="mt-8">
          <h2 className="text-xl">Messages</h2>
          {existingConversations.length > 0 ? (
            <ul className="mt-4">
              {existingConversations.map((convo) => (
                <Link href={`/inbox/${convo.id}`} key={convo.id}>
                  <li className="flex items-center p-2 border-b cursor-pointer">
                    <Image
                      src={
                        convo.otherUser.profilePicture || "/default-user.jpg"
                      } // Use the correct key
                      alt={`${convo.otherUser.displayName}'s profile picture`}
                      className="rounded-full mr-2"
                      width={30}
                      height={30}
                    />
                    <span>{convo.otherUser.displayName}</span>
                  </li>
                </Link>
              ))}
            </ul>
          ) : (
            <p>No conversations yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InboxPage;
