// pages/memories/new.tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";

export default function NewMemory() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "What memory would you like to talk about today?" },
  ]);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [memoryId, setMemoryId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
      else {
        setUser(user);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    const userMessage = { role: "user", content: input.trim() };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setInput("");
    setSaving(true);

    try {
      if (!memoryId) {
        const docRef = await addDoc(collection(db, "users", user.uid, "memories"), {
          title: updated[1]?.content?.slice(0, 60) || "Untitled Memory",
          messages: updated,
          timestamp: serverTimestamp(),
        });
        setMemoryId(docRef.id);
      } else {
        const docRef = doc(db, "users", user.uid, "memories", memoryId);
        await updateDoc(docRef, { messages: updated });
      }

      const res = await fetch("/api/memory-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });

      const data = await res.json();
      const aiReply = {
        role: "assistant",
        content: data.reply || "That's very special. Can you share more about that?",
      };

      const final = [...updated, aiReply];
      setMessages(final);

      if (memoryId) {
        const docRef = doc(db, "users", user.uid, "memories", memoryId);
        await updateDoc(docRef, { messages: final });
      }
    } catch (err) {
      console.error("Error handling memory save/chat:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Checking authentication...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-md">
        {/* Back to Dashboard */}
        <div className="mb-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </button>
        </div>

        <h2 className="text-2xl font-semibold mb-4">New Memory</h2>
        <div className="space-y-4 h-96 overflow-y-auto border p-4 rounded-xl">
          {messages.map((msg, i) => (
            <div key={i} className={msg.role === "user" ? "text-right" : "text-left"}>
              <span className="inline-block px-4 py-2 rounded-xl bg-gray-200 max-w-xs">
                {msg.content}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <input
            className="flex-1 border rounded-xl px-4 py-2"
            placeholder="Type your response..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl"
            disabled={saving}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}