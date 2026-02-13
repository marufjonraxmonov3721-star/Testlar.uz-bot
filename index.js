const { Telegraf, Markup } = require('telegraf');

const BOT_TOKEN = '7116176622:AAHyywSzvoxdeoC4OzxZs_jRDqQdzVvOyDI';
const bot = new Telegraf(BOT_TOKEN);

// START BUYRUG'I
bot.start((ctx) => {
    const ism = ctx.from.first_name;
    return ctx.replyWithMarkdown(
        `🌟 **Assalomu alaykum, aziz ${ism}!**\n\n` +
        `Sizni ko'rib turganimizdan juda mamnunmiz. Bilim cho'qqilarini zabt etishingizda ushbu ilova sizga eng yaqin ko'makchi bo'ladi deb umid qilamiz. ✨\n\n` +
        `🚀 **Tayyor bo'lsangiz, quyidagi tugmani bosing va o'rganishni boshlang:**`,
        Markup.inlineKeyboard([
            [Markup.button.url("🚀 Ilovaga kirish", "https://testlar-uz.vercel.app/")]
        ])
    );
});

// VERCEL INTEGRATSIYASI
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } catch (e) { res.status(200).send('Error'); }
    } else {
        res.status(200).send('Bot shirin so\'zlar bilan ishga tayyor! 😊');
    }
};
