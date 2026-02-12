const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const BOT_TOKEN = '7116176622:AAGodJadxD5bmEegTB4TsjDOEng8r6s3uY4';
const ADMIN_ID = 7385372033;
const FIREBASE_URL = "https://gen-lang-client-0228947349-default-rtdb.firebaseio.com/promos";

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => ctx.reply("Assalomu alaykum! To'lov chekini rasm ko'rinishida yuboring. 🚀"));

bot.on('photo', async (ctx) => {
    try {
        const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
        await ctx.reply("Ushbu to'lov qaysi fan uchun?", 
        Markup.inlineKeyboard([
            [Markup.button.callback("Dinshunoslik", `select_${photoId}_dinshunoslik`)],
            [Markup.button.callback("Fizika", `select_${photoId}_fizika`)],
            [Markup.button.callback("Matematika", `select_${photoId}_oliy matematika`)],
            [Markup.button.callback("AKT", `select_${photoId}_texnik_tizimlarda_akt`)],
            [Markup.button.callback("Yo'nalish", `select_${photoId}_yo'nalishga kirish`)]
        ]));
    } catch (e) { console.error(e); }
});

bot.action(/select_(.+)_(.+)/, async (ctx) => {
    const photoId = ctx.match[1];
    const subject = ctx.match[2];
    await ctx.editMessageText(`Siz ${subject.toUpperCase()}ni tanladingiz. Admin tasdiqlashini kuting...`);
    await ctx.telegram.sendPhoto(ADMIN_ID, photoId, {
        caption: `🔔 YANGI TO'LOV!\n📚 Fan: ${subject}\n👤 Kimdan: ${ctx.from.first_name}\n🆔 ID: ${ctx.from.id}`,
        ...Markup.inlineKeyboard([
            [Markup.button.callback("Tasdiqlash ✅", `approve_${ctx.from.id}_${subject}`)],
            [Markup.button.callback("Rad etish ❌", `reject_${ctx.from.id}`)]
        ])
    });
});

bot.action(/approve_(\d+)_(.+)/, async (ctx) => {
    if (ctx.from.id != ADMIN_ID) return;
    const userId = ctx.match[1];
    const subject = ctx.match[2];
    try {
        const res = await axios.get(`${FIREBASE_URL}/${subject}.json`);
        const promos = res.data;
        const code = Object.keys(promos).find(c => promos[c] === false);
        if (code) {
            await axios.patch(`${FIREBASE_URL}/${subject}.json`, { [code]: true });
            await ctx.telegram.sendMessage(userId, `🎉 Tasdiqlandi!\n📚 Fan: ${subject.toUpperCase()}\n🔑 Kod: ${code}`);
            await ctx.editMessageCaption(`✅ Tasdiqlandi. Kod: ${code}`);
        } else { await ctx.reply("Bo'sh kod qolmagan!"); }
    } catch (e) { await ctx.reply("Bazaga ulanishda xato!"); }
});

bot.action(/reject_(\d+)/, async (ctx) => {
    if (ctx.from.id != ADMIN_ID) return;
    await ctx.telegram.sendMessage(ctx.match[1], "❌ Chekingiz rad etildi.");
    await ctx.editMessageCaption("❌ Rad etildi.");
});

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try { await bot.handleUpdate(req.body); res.status(200).send('OK'); }
        catch (e) { res.status(500).send('Error'); }
    } else { res.status(200).send('Bot uyg\'oq... 🚀'); }
};
