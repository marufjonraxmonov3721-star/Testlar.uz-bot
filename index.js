const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const BOT_TOKEN = '7116176622:AAHc0S8SdaJXU6T4tJsXCaMUldZaiTOAOZM';
const ADMIN_ID = 7385372033;
const FIREBASE_URL = "https://gen-lang-client-0228947349-default-rtdb.firebaseio.com/promos";

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => ctx.reply("Assalomu alaykum! Bot ishga tushdi. To'lov chekini rasm ko'rinishida yuboring. 🚀"));

bot.on('photo', async (ctx) => {
    try {
        const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
        const userId = ctx.from.id;

        await ctx.reply("Ushbu to'lov qaysi fan uchun? Tanlang:", 
        Markup.inlineKeyboard([
            [Markup.button.callback("Dinshunoslik", `select_${photoId}_dinshunoslik`)],
            [Markup.button.callback("Fizika", `select_${photoId}_fizika`)],
            [Markup.button.callback("Matematika", `select_${photoId}_oliy matematika`)],
            [Markup.button.callback("AKT", `select_${photoId}_texnik_tizimlarda_akt`)],
            [Markup.button.callback("Yo'nalish", `select_${photoId}_yo'nalishga kirish`)]
        ]));
    } catch (err) { console.error(err); }
});

bot.action(/select_(.+)_(.+)/, async (ctx) => {
    const photoId = ctx.match[1];
    const subject = ctx.match[2];
    const userId = ctx.from.id;
    await ctx.editMessageText(`Siz "${subject.toUpperCase()}" fanini tanladingiz. Admin tasdiqlashini kuting... ⏳`);
    await ctx.telegram.sendPhoto(ADMIN_ID, photoId, {
        caption: `🔔 YANGI TO'LOV!\n👤 Kimdan: ${ctx.from.first_name}\n📚 Fan: ${subject.toUpperCase()}\n🆔 ID: ${userId}`,
        ...Markup.inlineKeyboard([
            [Markup.button.callback("Tasdiqlash ✅", `approve_${userId}_${subject}`)],
            [Markup.button.callback("Rad etish ❌", `reject_${userId}`)]
        ])
    });
});

bot.action(/approve_(\d+)_(.+)/, async (ctx) => {
    if (ctx.from.id != ADMIN_ID) return ctx.answerCbQuery("Ruxsat yo'q!");
    const userId = ctx.match[1];
    const subject = ctx.match[2];
    try {
        const res = await axios.get(`${FIREBASE_URL}/${subject}.json`);
        const promos = res.data;
        if (promos) {
            const availableCode = Object.keys(promos).find(code => promos[code] === false);
            if (availableCode) {
                await axios.patch(`${FIREBASE_URL}/${subject}.json`, { [availableCode]: true });
                await ctx.telegram.sendMessage(userId, `🎉 To'lovingiz tasdiqlandi!\n📚 Fan: ${subject.toUpperCase()}\n🔑 Promo-kod: ${availableCode}`);
                await ctx.editMessageCaption(`✅ TASDIQLANDI\n📚 Fan: ${subject}\n🔑 Kod: ${availableCode}`);
            } else { await ctx.reply("❌ Bazada bo'sh kod qolmagan!"); }
        }
    } catch (e) { await ctx.reply("❌ Bazaga ulanishda xatolik!"); }
});

bot.action(/reject_(\d+)/, async (ctx) => {
    if (ctx.from.id != ADMIN_ID) return ctx.answerCbQuery("Ruxsat yo'q!");
    await ctx.telegram.sendMessage(ctx.match[1], "❌ Chekingiz tasdiqlanmadi.");
    await ctx.editMessageCaption("❌ Rad etildi.");
});

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } catch (err) { res.status(500).send('Error'); }
    } else { res.status(200).send('Bot ishlamoqda... 🚀'); }
};
