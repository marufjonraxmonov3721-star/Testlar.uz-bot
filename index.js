const { Telegraf, Markup } = require('telegraf');

// YANGI TOKENINGIZ
const BOT_TOKEN = '7116176622:AAGodJadxD5bmEegTB4TsjDOEng8r6s3uY4';
const APP_LINK = 'https://t.me/Yakuniyga_tayyorlovchi_bot/start';

const bot = new Telegraf(BOT_TOKEN);

// 1. Foydalanuvchi /start bosganda
bot.start((ctx) => {
    return ctx.replyWithMarkdown(
        `👋 **Assalomu alaykum, ${ctx.from.first_name}!**\n\n` +
        `📚 **Yakuniy Test** ilovasiga xush kelibsiz.\n\n` +
        `Testlarni yechishni boshlash uchun pastdagi tugmani bosing:`,
        Markup.inlineKeyboard([
            [Markup.button.url("🚀 Ilovani ochish", APP_LINK)]
        ])
    );
});

// 2. Vercel integratsiyasi
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } catch (err) {
            res.status(500).send('Error');
        }
    } else {
        // Bu matn Vercel brauzerda ochilganda ko'rinadi
        res.status(200).send('Bot noldan tozalandi va ishga tayyor... 🚀');
    }
};
