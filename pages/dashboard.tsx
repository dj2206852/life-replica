// pages/dashboard.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
      <div className="max-w-xl w-full bg-white p-6 rounded-2xl shadow-md space-y-4">
        <h2 className="text-2xl font-semibold text-center">Welcome to Your Dashboard</h2>

        <button
          onClick={() => router.push("/profile")}
          className="w-full bg-gray-100 text-gray-800 font-medium py-3 rounded-xl hover:bg-gray-200"
        >
          View Profile
        </button>

        <button
          onClick={() => router.push("/voice")}
          className="w-full bg-orange-100 text-orange-800 font-medium py-3 rounded-xl hover:bg-orange-200"
        >
          Train Voice
        </button>

        <button
          onClick={() => router.push("/interview")}
          className="w-full bg-yellow-100 text-yellow-800 font-medium py-3 rounded-xl hover:bg-yellow-200"
        >
          Start / Resume Interview
        </button>

        <button
          onClick={() => router.push("/summary")}
          className="w-full bg-purple-100 text-purple-800 font-medium py-3 rounded-xl hover:bg-purple-200"
        >
          View Summary
        </button>

        <button
          onClick={() => router.push("/memories/new")}
          className="w-full bg-blue-100 text-blue-800 font-medium py-3 rounded-xl hover:bg-blue-200"
        >
          Add New Memory
        </button>

        <button
          onClick={() => router.push("/memories")}
          className="w-full bg-green-100 text-green-800 font-medium py-3 rounded-xl hover:bg-green-200"
        >
          View Saved Memories
        </button>

        <button
          onClick={() => {
            signOut(auth);
            router.push("/login");
          }}
          className="w-full text-sm text-red-600 hover:underline text-center mt-2"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}