"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { db, storage, auth } from "@/firebase"; // Ensure auth is imported
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signOut, sendEmailVerification } from "firebase/auth"; // Import Firebase Auth functions

const SettingsPage = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] =
    useState("/default-user.jpg"); // Default image
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Fetch user info from Firestore and initialize form fields
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setDisplayName(userData.displayName || "");
          setBio(userData.bio || "");
          setProfilePictureUrl(
            userData.profilePictureUrl || "/default-user.jpg"
          );
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleProfilePictureChange = (e) => {
    if (e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const updatedData = {};

      // Update displayName if it changed
      if (displayName !== user.displayName) {
        updatedData.displayName = displayName;
      }

      // Update bio if it changed
      if (bio !== user.bio) {
        updatedData.bio = bio;
      }

      // Upload new profile picture if available
      if (profilePicture) {
        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        const uploadTask = uploadBytesResumable(storageRef, profilePicture);
        await uploadTask;
        const downloadURL = await getDownloadURL(storageRef);
        updatedData.profilePictureUrl = downloadURL;
      }

      // Update Firestore with the updated data
      if (Object.keys(updatedData).length > 0) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, updatedData);
      }

      setLoading(false);
      router.push(`/profile/${user.uid}`); // Redirect back to profile after updating
    } catch (error) {
      setError("Error updating profile.");
      setLoading(false);
    }
  };

  // Handle email verification
  const handleEmailVerification = async (e) => {
    if (user && !user.emailVerified) {
      try {
        await sendEmailVerification(auth.currentUser); // Use Firebase auth
        e.target.innerText = "Verifying... Check your mail";
      } catch (error) {
        setError("Failed to send verification email.");
      }
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login"); // Redirect to login page after logout
    } catch (error) {
      setError("Error logging out.");
    }
  };
  if (!user) {
    router.push("/login");
    return null;
  }
  return (
    <div className="p-4 mt-10 md:mt-0 md:w-60% md:ml-[20%] md:p-10">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold mb-4">Settings</h1>
        <button onClick={handleLogout} className="text-red-600">
          Logout
        </button>
      </div>
      <div className="flex flex-col gap-y-4">
        {/* Profile Picture */}
        <div>
          <label htmlFor="profilePicture" className="block text-lg">
            Profile Picture
          </label>
          <div className="mb-2">
            <Image
              src={profilePictureUrl} // Show current or default profile picture
              alt="Profile"
              width={128}
              height={128}
              className="rounded-full w-14 h-14"
            />
          </div>
          <input
            type="file"
            id="profilePicture"
            onChange={handleProfilePictureChange}
            accept="image/*"
          />
        </div>

        {/* Display Name */}
        <div>
          <label htmlFor="displayName" className="block text-lg">
            Display Name
          </label>
          <input
            type="text"
            id="displayName"
            value={displayName} // Initialize with current display name
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full p-2 border"
          />
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-lg">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio} // Initialize with current bio
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-2 border"
          />
        </div>

        {/* Update Profile Button */}
        <button
          onClick={handleUpdateProfile}
          className="bg-indigo-600 md:w-48 text-white p-2 rounded"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>

        {error && <p className="text-red-500">{error}</p>}

        {/* Email Verification */}
        {!user.emailVerified && (
          <button
            onClick={(e) => handleEmailVerification(e)}
            className="bg-yellow-500 md:w-48 text-white p-2 rounded"
          >
            Verify Email
          </button>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
