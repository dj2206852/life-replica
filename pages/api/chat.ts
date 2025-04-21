import { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { messages } = req.body;

  const completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages,
  });

  const reply = completion.data.choices[0].message?.content || "Sorry, something went wrong.";
  res.status(200).json({ reply });
}