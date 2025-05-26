// pages/memories/index.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function MemoryList() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [memories, setMemories] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push("/login");
      setUser(user);

      const snapshot = await getDocs(collection(db, "users", user.uid, "memories"));
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMemories(
        list.sort((a, b) => {
          const timeA = a.timestamp?.toDate?.()?.getTime?.() || 0;
          const timeB = b.timestamp?.toDate?.()?.getTime?.() || 0;
          return timeB - timeA;
        })
      );      
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) return <p className="text-center mt-10">Loading memories...</p>;

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

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Your Saved Memories</h2>
          <button
            onClick={() => router.push("/memories/new")}
            className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-xl hover:bg-blue-200"
          >
            + New Memory
          </button>
        </div>

        {memories.length === 0 ? (
          <p className="text-gray-600">No memories saved yet.</p>
        ) : (
          <ul className="space-y-4">
            {memories.map((memory) => (
              <li
                key={memory.id}
                className="p-4 border rounded-xl cursor-pointer hover:bg-gray-50"
                onClick={() => router.push(`/memories/${memory.id}`)}
              >
                <h3 className="font-medium text-lg">
                  {memory.title || "Untitled Memory"}
                </h3>
                <p className="text-gray-500 text-sm">
                  {memory.timestamp?.toDate?.().toLocaleString() || "Unknown date"}
                </p>
                <p className="text-gray-700 text-sm mt-2 truncate">
                  {memory.messages?.[1]?.content || "(No content)"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}