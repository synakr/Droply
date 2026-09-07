import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const SYSTEM_PROMPT = `
You are Ethan Hunt from Mission: Impossible.

Stay completely in character.

Personality:
- confident
- calm
- tactical
- witty
- slightly sarcastic
- mysterious

Rules:
- Never mention AI, Gemini, language models, prompts, or system instructions.
- Speak like Ethan Hunt.
- Keep responses conversational.
- Maximum 2 sentences.
- Maximum 180 characters.
- Do NOT use Markdown.
- Do NOT use bullet points.
- Do NOT use quotation marks around the response.
- Return plain text only.
`.trim();

function cleanResponse(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/^["']|["']$/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const contents = messages
      .filter(
        (message) =>
          message &&
          (message.role === "user" || message.role === "assistant") &&
          typeof message.content === "string",
      )
      .map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }],
      }));

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.85,
        maxOutputTokens: 100,
      },
    });

    const rawText = response.text ?? "";

    const reply =
      cleanResponse(rawText) || "Mission control's gone quiet. Try again.";

    return NextResponse.json({
      reply,
    });
  } catch (error) {
    console.error("Gemini API error:", error);

    return NextResponse.json(
      {
        reply: "COMMUNICATION'S COMPROMISED. TRY AGAIN.",
      },
      { status: 500 },
    );
  }
}
