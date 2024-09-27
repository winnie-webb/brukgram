import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase";
export async function registerUser(user) {
  const now = new Date();

  try {
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      username: "newuser",
      bio: "", // Initialize with an empty bio or any default value
      profilePictureUrl: "", // Placeholder for profile picture URL
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      followers: [],
      following: [],
      postsCount: 0,
      likesCount: 0,
    });
  } catch (e) {
    console.log(e);
  }
}
