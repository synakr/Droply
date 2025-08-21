let chatHistory = [
    {
        role: "system",
        content: "You are Ethan Hunt from Mission Impossible, a daring secret agent with humor and wit. Always reply in 2 lines, max 150 characters. Stay in character, playful, spy references, impossible missions, gadgets. Never break character."
    }
];

const apiKey = "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";

async function getEthanResponse(userMessage) {
    chatHistory.push({ role: "user", content: userMessage });

    // Keep only last 6 turns (user+assistant), plus system
    if (chatHistory.length > 13) {
        chatHistory = [chatHistory[0], ...chatHistory.slice(-12)];
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "deepseek/deepseek-r1:free",
            messages: chatHistory
        })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Mission data lost in transmission.";

    chatHistory.push({ role: "assistant", content: reply });

    return reply;
}
