const { Telegraf } = require('telegraf');

const BOT_TOKEN = '7116176622:AAHc0S8SdaJXU6T4tJsXCaMUldZaiTOAOZM';
const ADMIN_ID = '7385372033'; 

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
    return ctx.reply(`Salom Marufning botiga xush kelibsiz! ✅\nTo'lov chekini (rasm) yuboring.`);
});

bot.on('photo', async (ctx) => {
    try {
        await ctx.telegram.sendPhoto(ADMIN_ID, ctx.message.photo[ctx.message.photo.length - 1].file_id, {
            caption: `🔔 YANGI CHEK!\n👤 Kimdan: ${ctx.from.first_name}\n🆔 ID: ${ctx.from.id}`
        });
        return ctx.reply("Chek qabul qilindi! Admin tez orada sizga promo-kod yuboradi. ✅");
    } catch (e) {
        return ctx.reply("Xatolik yuz berdi.");
    }
});

// Vercel uchun eksport - bu qism juda muhim!
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } catch (err) {
            res.status(500).send('Bot Error');
        }
    } else {
        res.status(200).send('Bot is active!');
    }
};
