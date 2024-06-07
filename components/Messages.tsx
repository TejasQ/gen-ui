"use client";

import { useUIState } from "ai/rsc";
import { useEffect, useRef } from "react";

export function Messages() {
  const [conversation] = useUIState();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.scrollTop = ref.current.scrollHeight;
  }, [conversation.length]);

  return (
    <div
      ref={ref}
      className="px-4 pt-4 flex flex-col gap-4 justify-start overflow-auto h-full"
    >
      {conversation.map((message: any) => (
        <div key={message.id} className="grid gap-2">
          <span className="capitalize text-sm font-bold">{message.role}</span>
          <div className="bg-gray-100 p-4 rounded">{message.display}</div>
        </div>
      ))}
    </div>
  );
}
