// pages/api/chat.ts
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebaseConfig } from "../firebase-config";

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const db = getFirestore();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { messages, userId } = req.body;

    let voiceContext = "";
    if (userId) {
      const voiceDoc = await getDoc(doc(db, "users", userId, "voice", "import"));
      if (voiceDoc.exists()) {
        const voiceText = voiceDoc.data().text;
        voiceContext = `The user typically writes like this: """
${voiceText}
"""\nUse this style when replying.`;
      }
    }

    const systemPrompt = voiceContext ||
      "You are a helpful and empathetic AI companion helping someone record their life story.";

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    });

    const reply = completion.choices[0]?.message?.content || "Sorry, I didn’t understand that.";
    res.status(200).json({ reply });
  } catch (err) {
    console.error("OpenAI API error:", err);
    res.status(500).json({ message: "Error generating response" });
  }
}
