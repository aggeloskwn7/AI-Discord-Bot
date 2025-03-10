# AI-Discord-Bot v1.1 🚀

An advanced AI-powered Discord bot with **natural conversation handling, memory context, AI personality customization, and moderation tools**.

## 🔹 What's New in v1.1?
✅ **AI NEVER acknowledges being an AI** – Now always responds as a cool, natural human.  
✅ **Better message handling** – Improved AI response storage and error handling.  
✅ **Full command list** – All bot commands now documented.  
✅ **Setup guide improved** – Easier installation process.  

---

## 📌 Features

- **💬 AI-Powered Responses** – Uses OpenAI to provide natural and intelligent replies.
- **🧠 Conversation Memory** – Remembers past interactions for **context-aware replies**.
- **🎭 Personality Customization** – Adjust AI's tone using `/set-personality`.
- **🔄 AI Memory Reset** – Clear chat history with `/reset-ai`.
- **📊 Usage Statistics** – View bot usage with `/stats`.
- **⚠️ Rate Limiting** – Prevents spam by limiting AI requests per user.
- **🔧 Full Slash Command Support** – No prefix needed.

---

## ⚙️ Installation & Setup

### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/aggeloskwn7/AI-Discord-Bot.git
cd AI-Discord-Bot
```

### **2️⃣ Install Dependencies**
```bash
npm install
```

### **3️⃣ Create a `.env` File**
Inside the project folder, create a `.env` file and add:

```
DISCORD_TOKEN=your-bot-token-here
MONGO_URI=your-mongodb-uri-here
OPENAI_API_KEY=your-openai-api-key-here
CLIENT_ID=your-bot-client-id-here
```

### **4️⃣ Deploy Slash Commands**
Register the bot’s commands globally:
```bash
node deploy-commands.js
```

### **5️⃣ Start the Bot**
Run the bot with:
```bash
node bot.js
```

---

## 📜 Slash Commands

| Command | Description |
|---------|-------------|
| `/setup-ai [channel]` | Sets the AI response channel |
| `/set-personality [type]` | Changes AI behavior (e.g., sarcastic, funny) |
| `/reset-ai` | Resets AI conversation memory |
| `/stats` | Shows bot usage stats (Admins only) |
| `/config` | Displays current AI settings |
| `/help` | Lists all available commands |

---

## ❓ Troubleshooting

**Bot isn't responding?**
- Run `/setup-ai` to configure an AI channel.
- Ensure the bot has **"Message Content Intent"** enabled in Discord Developer Portal.
- Check if the bot has **"Read Messages" & "Send Messages"** in the AI channel.

**Slash commands not appearing?**
- Re-run command deployment: `node deploy-commands.js`.
- Ensure the bot is added to the server **with the correct permissions**.

---

## 💡 Contributing

Want to improve this bot? Fork the repo and submit a pull request! 🚀

---

## 📜 License

MIT License – Feel free to use and modify this project. 🔥

---

### **🎉 Enjoy your AI-powered Discord bot!**
