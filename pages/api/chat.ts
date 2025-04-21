import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { messages } = req.body;

  const completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages,
  });

  const reply = completion.data.choices[0].message?.content || "Sorry, something went wrong.";
  res.status(200).json({ reply });
}