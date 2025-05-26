// pages/interview.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { interviewQuestions } from "../data/interviewQuestions";

export default function Interview() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) router.push("/login");
      else {
        setUser(user);
        // Load saved progress
        const progressRef = doc(db, "users", user.uid, "interview", "progress");
        const progressSnap = await getDoc(progressRef);
        if (progressSnap.exists()) {
          const { lastIndex } = progressSnap.data();
          setCurrentIndex(lastIndex + 1);
        }
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleAnswerSubmit = async () => {
    if (!input.trim() || !user) return;
    setSaving(true);
    const question = interviewQuestions[currentIndex];
    const answer = input.trim();

    const answerRef = doc(
      collection(db, "users", user.uid, "interview"),
      `${currentIndex + 1}`
    );
    const progressRef = doc(db, "users", user.uid, "interview", "progress");

    await setDoc(answerRef, {
      question,
      answer,
      timestamp: serverTimestamp(),
    });

    await setDoc(progressRef, { lastIndex: currentIndex });

    setInput("");
    setCurrentIndex((prev) => prev + 1);
    setSaving(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  if (loading)
    return <p className="text-center mt-10">Checking authentication...</p>;

  if (currentIndex >= interviewQuestions.length)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-xl w-full">
          <h2 className="text-2xl font-bold mb-4">Interview complete! 🎉</h2>
          <p className="text-gray-700 mb-6">
            You’ve finished all the questions. Ready to see how the AI describes
            you?
          </p>
          <button
            onClick={() => router.push("/summary")}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700"
          >
            View My Summary
          </button>
        </div>
      </div>
    );

    return (
      <div
        className="bg-gray-50 p-6"
        style={{ minHeight: "100vh", display: "flex", justifyContent: "center" }}
      >
        <div
          className="bg-white p-8 rounded-2xl shadow-md"
          style={{ width: "100%", maxWidth: "900px" }}
        >
          <h2 className="text-2xl font-semibold mb-1">
  Question {currentIndex + 1} of {interviewQuestions.length}
</h2>

<p className="text-sm text-gray-500 mb-2">
  Progress: {Math.round((currentIndex / interviewQuestions.length) * 100)}% complete
</p>

<div className="w-full h-3 bg-gray-200 rounded-full mb-6">
  <div
    className="h-3 bg-blue-600 rounded-full transition-all duration-300"
    style={{
      width: `${Math.round((currentIndex / interviewQuestions.length) * 100)}%`,
    }}
  ></div>
</div>
          <p className="mb-6 text-gray-700 text-lg">
            {interviewQuestions[currentIndex]}
          </p>
    
          <div className="w-full">
            <textarea
              style={{
                width: "100%",
                minWidth: "100%",
                maxWidth: "100%",
                display: "block",
                boxSizing: "border-box",
              }}
              className="border rounded-xl p-4 text-base mb-4"
              rows={12}
              placeholder="Take your time and tell me as much as you’d like..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
    
            <div className="flex justify-between items-center gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-sm text-blue-600 hover:underline"
              >
                Save & Exit
              </button>
    
              <div className="flex items-center gap-4">
                {showSaved && (
                  <span className="text-green-600 text-sm italic">
                    Progress saved ✅
                  </span>
                )}
                <button
                  onClick={handleAnswerSubmit}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Next"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}