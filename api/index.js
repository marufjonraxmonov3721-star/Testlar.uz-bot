const { Telegraf } = require('telegraf');
const bot = new Telegraf('7116176622:AAHc0S8SdaJXU6T4tJsXCaMUldZaiTOAOZM');
const ADMIN_ID = '7385372033'; 

bot.start((ctx) => ctx.reply('Bot ishlamoqda! Maruf aka uchun chekni yuboring.'));

bot.on('photo', async (ctx) => {
    try {
        await ctx.telegram.sendPhoto(ADMIN_ID, ctx.message.photo[ctx.message.photo.length - 1].file_id, {
            caption: `🔔 YANGI CHEK!\n👤 Kimdan: ${ctx.from.first_name}\n🆔 ID: ${ctx.from.id}`
        });
        await ctx.reply("Chek qabul qilindi! Admin tez orada sizga promo-kod yuboradi. ✅");
    } catch (e) {
        await ctx.reply("Xatolik! Qaytadan urinib ko'ring.");
    }
});

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } catch (err) {
            res.status(500).send('Error');
        }
    } else {
        res.status(200).send('Bot xizmati yoqilgan...');
    }
};
