// pages/api/summarize.ts
import { NextApiRequest, NextApiResponse } from "next";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import OpenAI from "openai";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const db = getFirestore();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { uid } = req.query;
  if (!uid || typeof uid !== "string") {
    return res.status(400).json({ error: "Missing or invalid user ID." });
  }

  try {
    const snapshot = await getDocs(collection(db, "users", uid, "interview"));
    const answers = snapshot.docs.map(doc => doc.data());

    const formatted = answers
      .map((item, i) => `Q${i + 1}: ${item.question}\nA: ${item.answer}`)
      .join("\n\n");

    const prompt = `You are a helpful and empathetic AI. Summarize the following interview responses into a paragraph that describes the user's personality, tone, values, beliefs, speaking style, and emotional traits. Make it sound natural and warm.\n\n${formatted}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an assistant that analyzes personality interviews." },
        { role: "user", content: prompt },
      ],
    });

    const reply = completion.choices[0].message.content;
    res.status(200).json({ summary: reply });
  } catch (err) {
    console.error("Summary generation error:", err);
    res.status(500).json({ error: "Failed to generate summary." });
  }
}
