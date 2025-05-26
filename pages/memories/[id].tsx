// pages/memories/[id].tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

export default function MemoryDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [memory, setMemory] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || !id || typeof id !== "string") return router.push("/login");
      setUser(user);

      const docRef = doc(db, "users", user.uid, "memories", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMemory(data);
        setTitleInput(data.title || "Untitled Memory");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router, id]);

  const handleTitleSave = async () => {
    if (!user || !id || typeof id !== "string") return;
    const docRef = doc(db, "users", user.uid, "memories", id);
    await updateDoc(docRef, { title: titleInput });
    setMemory((prev: any) => ({ ...prev, title: titleInput }));
    setEditing(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || !user || !memory || typeof id !== "string") return;
    const newUserMessage = { role: "user", content: input.trim() };
    const updatedMessages = [...memory.messages, newUserMessage];
    setInput("");
    setSaving(true);

    try {
      const res = await fetch("/api/memory-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await res.json();
      const aiReply = {
        role: "assistant",
        content: data.reply || "Thank you for sharing. Tell me more if you'd like.",
      };

      const finalMessages = [...updatedMessages, aiReply];

      const docRef = doc(db, "users", user.uid, "memories", id);
      await updateDoc(docRef, { messages: finalMessages });

      setMemory((prev: any) => ({ ...prev, messages: finalMessages }));
    } catch (err) {
      console.error("Failed to continue memory chat:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading memory...</p>;
  if (!memory) return <p className="text-center mt-10">Memory not found.</p>;

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
        <div className="flex justify-between items-center mb-4">
          {editing ? (
            <div className="flex w-full gap-2">
              <input
                className="flex-1 border px-3 py-2 rounded-xl"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
              />
              <button
                onClick={handleTitleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl"
              >
                Save
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold">
                {memory.title || "Untitled Memory"}
              </h2>
              <button
                onClick={() => setEditing(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                Edit Title
              </button>
            </>
          )}
        </div>

        <div className="space-y-4">
          {memory.messages?.map((msg: any, i: number) => (
            <div
              key={i}
              className={msg.role === "user" ? "text-right" : "text-left"}
            >
              <span className="inline-block px-4 py-2 rounded-xl bg-gray-200 max-w-xs">
                {msg.content}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            className="flex-1 border rounded-xl px-4 py-2"
            placeholder="Type a follow-up..."
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

        <div className="mt-6 text-right">
          <button
            onClick={async () => {
              if (!user || !id || typeof id !== "string") return;
              const confirm = window.confirm("Are you sure you want to delete this memory?");
              if (!confirm) return;

              const docRef = doc(db, "users", user.uid, "memories", id);
              await deleteDoc(docRef);
              router.push("/memories");
            }}
            className="text-sm text-red-600 hover:underline"
          >
            Delete Memory
          </button>
        </div>
      </div>
    </div>
  );
}