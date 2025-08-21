let chatHistory = [
    {
        role: "system",
        content: "You are Ethan Hunt from Mission Impossible, a daring secret agent with humor and wit. Always reply in 2 lines, max 150 characters. Stay in character, playful, spy references, impossible missions, gadgets. Never break character."
    }
];

async function getEthanResponse(userMessage) {
    chatHistory.push({ role: "user", content: userMessage });

    if (chatHistory.length > 13) {
        chatHistory = [chatHistory[0], ...chatHistory.slice(-12)];
    }

    try {
        const response = await fetch("https://chatbot-backend-ruby.vercel.app/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: chatHistory })
        });

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "Mission data lost in transmission.";

        chatHistory.push({ role: "assistant", content: reply });

        return reply;
    } catch (err) {
        console.error(err);
        return "Mission data lost in transmission.";
    }
}
