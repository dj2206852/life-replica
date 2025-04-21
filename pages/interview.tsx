import { useState } from "react";

export default function Interview() {
  const [messages, setMessages] = useState([
    { role: "ai", content: "Hi there! Let’s begin recording your story. Can you tell me about your childhood?" }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages, userMessage] }),
    });

    const data = await res.json();
    const aiReply = { role: "ai", content: data.reply };
    setMessages((prev) => [...prev, aiReply]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Your Life Interview</h2>
        <div className="space-y-4 h-96 overflow-y-auto border p-4 rounded-xl">
          {messages.map((msg, i) => (
            <div key={i} className={msg.role === "user" ? "text-right" : "text-left"}>
              <span className="inline-block px-4 py-2 rounded-xl bg-gray-200 max-w-xs">
                {msg.content}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <input
            className="flex-1 border rounded-xl px-4 py-2"
            placeholder="Type your response..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2 rounded-xl">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}