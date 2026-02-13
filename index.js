const { Telegraf, Markup } = require('telegraf');

// BOT TOKENI
const BOT_TOKEN = '7116176622:AAHyywSzvoxdeoC4OzxZs_jRDqQdzVvOyDI';
const bot = new Telegraf(BOT_TOKEN);

// START BUYRUG'I
bot.start((ctx) => {
    return ctx.reply(
        `Assalomu alaykum! Yakuniy test markazi botiga xush kelibsiz. ✨\n\n` +
        `Tayyorlanishni boshlash uchun pastdagi tugmani bosing:`,
        Markup.inlineKeyboard([
            [Markup.button.url("🚀 Tayyorlanishni boshlash", "https://testlar-uz.vercel.app/")]
        ])
    );
});

// VERCEL INTEGRATSIYASI
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } catch (e) {
            res.status(200).send('Error');
        }
    } else {
        res.status(200).send('Bot faol va foydalanuvchilarni kutmoqda... 🚀');
    }
};
