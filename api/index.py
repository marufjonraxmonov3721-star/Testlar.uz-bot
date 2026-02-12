const { Telegraf } = require('telegraf');

const BOT_TOKEN = '7116176622:AAHc0S8SdaJXU6T4tJsXCaMUldZaiTOAOZM';
const ADMIN_ID = '7385372033'; 

const bot = new Telegraf(BOT_TOKEN);

// Xatolarni tutish
bot.catch((err, ctx) => {
  console.log(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

bot.start((ctx) => ctx.reply('Bot ishlamoqda! Marhamat, chekni yuboring.'));

bot.on('photo', async (ctx) => {
    try {
        await ctx.telegram.sendPhoto(ADMIN_ID, ctx.message.photo[ctx.message.photo.length - 1].file_id, {
            caption: `🔔 YANGI CHEK!\n👤 Kimdan: ${ctx.from.first_name}\n🆔 ID: ${ctx.from.id}`
        });
        await ctx.reply("Chek qabul qilindi! Admin tez orada sizga promo-kod yuboradi. ✅");
    } catch (e) {
        console.error(e);
        await ctx.reply("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    }
});

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } catch (err) {
            console.error(err);
            res.status(500).send('Error in bot');
        }
    } else {
        res.status(200).send('Bot xizmati yoqilgan...');
    }
};
