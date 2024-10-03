"use client";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { db } from "@/firebase";

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      // Fetch notifications from the user's notifications subcollection
      const q = query(
        collection(db, "users", user.uid, "notifications"),
        where("isRead", "==", false) // Optionally filter unread notifications
      );
      const querySnapshot = await getDocs(q);
      const fetchedNotifications = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(fetchedNotifications);
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  return (
    <div className="mt-16 p-4 md:p-10 md:mt-0 md:ml-[20%]">
      <h1 className="text-2xl">Notifications</h1>
      <ul className="mt-10">
        {notifications.length !== 0
          ? notifications.map((notification) => (
              <li className="border-b-2 border-gray-300" key={notification.id}>
                {notification.message}
              </li>
            ))
          : "No notifications yet."}
      </ul>
    </div>
  );
};

export default NotificationsPage;
