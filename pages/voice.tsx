// pages/voice.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function VoiceTrainer() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [text, setText] = useState("");
  const [status, setStatus] = useState("Not saved");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push("/login");
      setUser(user);

      const docRef = doc(db, "users", user.uid, "voice", "import");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setText(docSnap.data().text || "");
        setStatus("Saved previously");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleSave = async () => {
    if (!user || !text.trim()) return;
    setSaving(true);
    const docRef = doc(db, "users", user.uid, "voice", "import");
    await setDoc(docRef, { text });
    setSaving(false);
    setStatus("Saved successfully");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setText(result);
      }
    };
    reader.readAsText(file);
  };

  if (loading) return <p className="text-center mt-10">Loading voice training...</p>;

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

        <h2 className="text-2xl font-semibold mb-4">Train the AI with Your Voice</h2>
        <p className="text-gray-700 mb-4">
          Paste your emails, messages, journal entries — anything that sounds like you.
        </p>

        <textarea
          className="w-full border rounded-xl p-4 text-base mb-4"
          rows={10}
          placeholder="Paste your writing here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <input type="file" accept=".txt" onChange={handleFileUpload} className="mb-4" />

        <div className="flex justify-between items-center">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Voice Sample"}
          </button>
          <p className="text-sm text-gray-500 italic">Status: {status}</p>
        </div>
      </div>
    </div>
  );
}