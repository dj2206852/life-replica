// pages/summary.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function SummaryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [summary, setSummary] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push("/login");
      setUser(user);

      const docRef = doc(db, "users", user.uid, "interview", "summary");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSummary(docSnap.data().summary || "");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await setDoc(doc(db, "users", user.uid, "interview", "summary"), { summary });
    setSaving(false);
    setEditing(false);
  };

  if (loading) return <p className="text-center mt-10">Loading summary...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-md">
        <div className="mb-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </button>
        </div>

        <h2 className="text-2xl font-semibold mb-4">AI Personality Summary</h2>

        {editing ? (
          <>
            <textarea
              className="w-full border p-4 rounded-xl mb-4"
              rows={10}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditing(false)}
                className="text-sm text-gray-600 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Summary"}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="whitespace-pre-wrap text-gray-800 mb-4">{summary || "No summary found yet."}</p>
            <button
              onClick={() => setEditing(true)}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-xl"
            >
              Edit Summary
            </button>
          </>
        )}
      </div>
    </div>
  );
}