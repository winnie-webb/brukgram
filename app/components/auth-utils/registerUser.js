import { auth, db } from "../../../firebase"; // Import your Firebase auth and Firestore instances
import { doc, setDoc, getDoc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const registerUser = async (email, password, displayName, setError, router) => {
  try {
    // Register the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const now = Date.now();

    // Create a Firestore document with user.uid as the document ID
    const userDocRef = doc(db, "users", user.uid); // Use user.uid instead of email

    // Check if the user already exists in Firestore
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Save additional user info to Firestore
      await setDoc(userDocRef, {
        email: user.email,
        displayName: displayName,
        bio: "", // Initialize with an empty bio or any default value
        profilePictureUrl: "", // Placeholder for profile picture URL
        createdAt: now.toString(),
        updatedAt: now.toString(),
        followers: [],
        following: [],
        postsCount: 0,
      });
    }

    router.push("/login");
    return user; // Return the user object
  } catch (err) {
    if (err.code === "auth/email-already-in-use") {
      setError("This email is already in use.");
    } else {
      setError(`Please ensure your credentials are correct. ${err.message}`);
    }
  }
};

// Function to handle Google Sign-In
const googleSignIn = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const now = new Date().toISOString();

    // Check if the user already exists in Firestore
    const userDocRef = doc(db, "users", user.uid); // Use user.uid
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        email: user.email,
        displayName: user.displayName,
        bio: "",
        profilePictureUrl: "",
        createdAt: now,
        updatedAt: now,
        followers: [],
        following: [],
        postsCount: 0,
      });

      console.log("Google user saved to Firestore:", user);
    } else {
      console.log("Google user already exists:", user);
    }
  } catch (error) {
    console.error("Error during Google sign-in:", error.message);
  }
};

export { registerUser, googleSignIn };
