import { db } from "@/firebase";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
} from "firebase/firestore";

export default async function sendNotification(
  senderId,
  postId,
  postOwnerId,
  type,
  msg
) {
  const senderDoc = await getDoc(doc(db, "users", senderId));
  const senderData = senderDoc.data();

  // Create a new notification
  const notificationRef = doc(
    collection(db, "users", postOwnerId, "notifications")
  );
  await setDoc(notificationRef, {
    type: type,
    message: `${senderData.displayName} ${msg}`,
    postId: postId,
    senderId: senderId,
    senderDisplayName: senderData.displayName, // Store display name
    timestamp: serverTimestamp(),
    isRead: false,
  });
}
