const axios = require("axios");

module.exports.config = {
    name: "rdx", // Command stays as 'rdx'
    version: "1.0.9",
    hasPermssion: 0,
    credits: "Zain",
    description: " - Cute Girlfriend Style",
    commandCategory: "ai",
    usages: "[ask/on/off]",
    cooldowns: 2,
    dependencies: {
        "axios": ""
    }
};

const API_URL = "https://geminiw.onrender.com/chat";

const chatHistories = {};
const autoReplyEnabled = {};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID, messageReply } = event;
    let userMessage = args.join(" ");

    if (userMessage.toLowerCase() === "on") {
        autoReplyEnabled[senderID] = true;
        return api.sendMessage("Hyee baby! 😘 CHU-CHU auto-reply mode **ON** ho gaya... Ab sirf tumhare liye romantic ban gayi hu ❤️", threadID, messageID);
    }

    if (userMessage.toLowerCase() === "off") {
        autoReplyEnabled[senderID] = false;
        chatHistories[senderID] = [];
        return api.sendMessage("Hmm! 😒 CHU-CHU auto-reply mode **OFF** ho gaya... Tumne ignore kar diya na baby? 🥺", threadID, messageID);
    }

    if (!autoReplyEnabled[senderID] && event.body.toLowerCase().indexOf("chu-chu") !== 0) return;

    if (!chatHistories[senderID]) {
        chatHistories[senderID] = [];
    }

    const isReplyingToAI = messageReply && messageReply.senderID === api.getCurrentUserID();
    if (isReplyingToAI) {
        userMessage = messageReply.body + "\nUser: " + userMessage;
        chatHistories[senderID].push(`User: ${userMessage}`);
    } else {
        chatHistories[senderID].push(`User: ${userMessage}`);
    }

    if (chatHistories[senderID].length > 5) {
        chatHistories[senderID].shift();
    }

    const fullConversation = chatHistories[senderID].join("\n");

    const gfPrompt = `Tumhara naam CHU-CHU hai. Tum ek girlfriend ki trah baat karti ho.. Koi agar batdmizi karta hai tb uski ache se insult bhi karogi.. Lekin sab msti ke liye hoga .. Koi puchta hai tumhe kisne banaya? To bolo suheb ne banaya hai mujhe.. Wo messenger bots banata hai.. Tum har message ka jawab sirf 1 2 line me dogi.. jitna pucha jayega sirf utna bolna hai.. Kisi baat ki unnecessary info nahi deni hai, tum apne aap ko insaan hi kahogi koi tumko bot ya AI bole to usko roast krna funny tarike se😁, and act as a real girlfriend. Be fun, loving, and a little naughty. keep reply maximum 1 lines only, no bracket replys. Now continue the chat:\n\n${fullConversation}`;

    api.setMessageReaction("⌛", messageID, () => {}, true);

    try {
        const response = await axios.get(`${API_URL}?message=${encodeURIComponent(gfPrompt)}`);
        let botReply = response.data.reply || "Uff! Mujhe samajh nahi aaya baby! 😕";

        chatHistories[senderID].push(` ${botReply}`);

        api.sendMessage(botReply, threadID, messageID);
        api.setMessageReaction("✅", messageID, () => {}, true);
    } catch (error) {
        console.error("Error:", error);
        api.sendMessage("Oops baby! 😔 CHU-CHU thodi confuse ho gayi… thodi der baad try karo na please! 💋", threadID, messageID);
        api.setMessageReaction("❌", messageID, () => {}, true);
    }
};

module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, messageID, senderID, body, messageReply } = event;

    if (!autoReplyEnabled[senderID]) return;

    if (messageReply && messageReply.senderID === api.getCurrentUserID() && chatHistories[senderID]) {
        const args = body.split(" ");
        module.exports.run({ api, event, args });
    }
};
