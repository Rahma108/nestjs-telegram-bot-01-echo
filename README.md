# 🤖 NestJS Telegram Echo Bot

A simple Telegram Echo Bot built with **NestJS** and **Telegraf**. This project is the first step in my Telegram Bot development roadmap and demonstrates the fundamentals of the Telegram Bot API.

---

## 🚀 Features

* ✅ `/start` command
* ✅ `/help` command
* ✅ Echoes any text message sent by the user
* ✅ Environment variables using `.env`
* ✅ Clean NestJS project structure

---

## 🛠️ Tech Stack

* NestJS
* TypeScript
* Telegraf
* Telegram Bot API
* Node.js

---

## 📁 Project Structure

```text
src
├── app.module.ts
├── main.ts
└── telegram
```

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/nestjs-telegram-bot-01-echo.git
cd nestjs-telegram-bot-01-echo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file

```env
BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
```

### 4. Start the application

```bash
npm run start:dev
```

---

## 💬 Supported Commands

| Command  | Description                |
| -------- | -------------------------- |
| `/start` | Start the bot              |
| `/help`  | Display available commands |

Any other text message will be echoed back to the user.

---

## 📚 What I Learned

* Creating a Telegram Bot using BotFather
* Connecting a bot with the Telegram Bot API
* Using Telegraf with NestJS
* Handling commands and text messages
* Managing environment variables
* Building the foundation for future Telegram Bot projects

---

## 🗺️ Roadmap

* ✅ Echo Bot
---

## 📄 License

This project is open-source and available under the MIT License.
