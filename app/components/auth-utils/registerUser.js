import { auth, db } from "../../../firebase"; // Import your Firebase auth and Firestore instances
import { doc, setDoc, getDoc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
// Function to register or sign in the user
const registerUser = async (email, password, displayName, setError, router) => {
  try {
    // Check if user already exists in Firestore
    const userDocRef = doc(db, "users", email);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // If user does not exist, create a new user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const now = Date.now();
      // Save additional user info to Firestore
      await setDoc(userDocRef, {
        email: user.email,
        id: user.uid,
        displayName: displayName,
        bio: "", // Initialize with an empty bio or any default value
        profilePictureUrl: "", // Placeholder for profile picture URL
        createdAt: now.toString(),
        updatedAt: now.toString(),
        followers: [],
        following: [],
        postsCount: 0,
      });
      router.push("/login");

      return user; // Return the user object
    } else {
      // If user exists, simply sign them in
      const userCredential = await signInWithEmailAndPassword(email, password);
      router.push("/login");

      return userCredential.user;
    }
  } catch (error) {
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

    // Check if user already exists in Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        email: user.email,
        id: user.uid,
        displayName: displayName,
        bio: "",
        profilePictureUrl: "",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
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
