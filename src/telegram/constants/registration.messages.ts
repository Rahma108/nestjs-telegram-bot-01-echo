export const REGISTRATION_MESSAGES = {
  ASK_NAME: `
👤 What's your name?
`,

  ASK_AGE: `
🎉 Nice to meet you!

🎂 How old are you?
`,

  COMPLETED: (name: string, age: number) => `
🎉 Registration Completed

👤 Name: ${name}
🎂 Age: ${age}

Welcome aboard! 🚀
`,

   CANCELLED: `
❌ Registration cancelled successfully.
`,

STATUS: (step: string) => `
📌 Current Step

${step}
`,
ALREADY_REGISTERED : `⚠️ You already have an active registration.\nUse /cancel first `
};



