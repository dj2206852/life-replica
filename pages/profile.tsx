// pages/profile.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    age: "",
    location: "",
    bio: "",
    visibility: "private",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push("/login");
      setUser(user);

      const docRef = doc(db, "users", user.uid, "profile", "main");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setForm(docSnap.data());
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const docRef = doc(db, "users", user.uid, "profile", "main");
    await setDoc(docRef, form);
    setSaving(false);
    alert("Profile saved!");
  };

  if (loading) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <img
            src={user.photoURL || "https://via.placeholder.com/150"}
            alt="Profile Picture"
            className="w-24 h-24 rounded-full border-2 border-gray-300"
          />
          <h2 className="text-2xl font-semibold">{form.name || user.displayName || "User"}</h2>
          <p className="text-gray-600 text-sm">Registered email address: {user.email || "No email available"}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border px-4 py-2 rounded-xl"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="text"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              className="w-full border px-4 py-2 rounded-xl"
              placeholder="Your age"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full border px-4 py-2 rounded-xl"
              placeholder="Your location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4}
              className="w-full border px-4 py-2 rounded-xl"
              placeholder="Write a short bio or anything you’d like people to know..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
            <select
              value={form.visibility}
              onChange={(e) => setForm({ ...form, visibility: e.target.value })}
              className="w-full border px-4 py-2 rounded-xl"
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
              <option value="legacy">Legacy</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 text-white px-6 py-2 rounded-xl disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full text-sm text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}