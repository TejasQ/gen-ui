"use client";

import { useActions, useUIState } from "ai/rsc";
import { nanoid } from "nanoid";
import { useState } from "react";

export function ChatForm() {
  const { continueConversation } = useActions();
  const [, setConversation] = useUIState();
  const [input, setInput] = useState("");

  return (
    <form
      action={async () => {
        setConversation((c: any[]) => [
          ...c,
          { id: nanoid(), role: "user", display: input },
        ]);

        const message = await continueConversation(input);

        setConversation((currentConversation: any[]) => [
          ...currentConversation,
          message,
        ]);
      }}
      className="p-4 flex items-center gap-4"
    >
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="p-2 border rounded w-full"
        type="text"
        placeholder="Ask me anything..."
      />
      <button className="bg-black text-white py-2 px-4 rounded" type="submit">
        Ask
      </button>
    </form>
  );
}
