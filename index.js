const { Telegraf, Markup } = require('telegraf');

// TOKEN VA LINKLAR
const BOT_TOKEN = '7116176622:AAGodJadxD5bmEegTB4TsjDOEng8r6s3uY4';
const APP_LINK = 'https://t.me/Yakuniyga_tayyorlovchi_bot/start';

const bot = new Telegraf(BOT_TOKEN);

// 1. FOYDALANUVCHI /start BOSGANDA
bot.start((ctx) => {
    const welcomeText = `
👋 **Assalomu alaykum, ${ctx.from.first_name}!**

📚 **Yakuniy Test** ilovasiga xush kelibsiz.

Ushbu ilova orqali siz testlar yechishingiz va yakuniy imtihonlarga tayyorlanishingiz mumkin.

👇 **Ilovani ochish uchun pastdagi tugmani bosing:**
    `;

    return ctx.replyWithMarkdown(welcomeText, 
        Markup.inlineKeyboard([
            [Markup.button.url("🚀 Ilovani ochish", APP_LINK)]
        ])
    );
});

// 2. VERCEL SERVER QISMI
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } catch (err) {
            console.error(err);
            res.status(500).send('Error');
        }
    } else {
        res.status(200).send('Bot ishlamoqda... 🚀');
    }
};
