import { ApiMessage } from "@/app/types";

export async function getEthanResponse(
  messages: ApiMessage[],
): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Chat request failed");
  }

  return typeof data.reply === "string"
    ? data.reply.trim()
    : "COMMUNICATION'S COMPROMISED. TRY AGAIN.";
}
