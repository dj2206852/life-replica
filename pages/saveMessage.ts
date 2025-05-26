import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { User } from "firebase/auth";

export async function saveMessage(user: User, role: "user" | "ai", content: string) {
  try {
    // Convert "ai" to "assistant" for OpenAI compatibility
    const safeRole = role === "ai" ? "assistant" : role;

    await addDoc(collection(db, "users", user.uid, "messages"), {
      role: safeRole,
      content,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error("Error saving message:", err);
  }
}