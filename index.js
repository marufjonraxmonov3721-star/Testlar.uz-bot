const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const BOT_TOKEN = process.env.7116176622:AAGodJadxD5bmEegTB4TsjDOEng8r6s3uY4; // github secret
const ADMIN_ID = "7385372033";

const FIREBASE_URL =
'https://gen-lang-client-0228947349-default-rtdb.firebaseio.com/promos';

const bot = new Telegraf(7116176622:AAGodJadxD5bmEegTB4TsjDOEng8r6s3uY4);



/* ================= START ================= */
bot.start((ctx) =>
    ctx.reply("Assalomu alaykum! To'lov chekini rasm yuboring 📸")
);



/* ================= PHOTO ================= */
bot.on('photo', async (ctx) => {

    const photoId = ctx.message.photo.at(-1).file_id;

    await ctx.reply(
        "Qaysi fan uchun to'lov?",
        Markup.inlineKeyboard([
            [Markup.button.callback("Dinshunoslik", `select_${photoId}_din`)],
            [Markup.button.callback("Fizika", `select_${photoId}_fizika`)],
            [Markup.button.callback("Matematika", `select_${photoId}_matematika`)],
            [Markup.button.callback("AKT", `select_${photoId}_akt`)],
            [Markup.button.callback("Yo'nalish", `select_${photoId}_yonalish`)]
        ])
    );
});



/* ================= SELECT ================= */
bot.action(/select_(.+)_(.+)/, async (ctx) => {

    const photoId = ctx.match[1];
    const subject = ctx.match[2];
    const userId = ctx.from.id.toString();

    await ctx.editMessageText("Admin tasdiqlashini kuting ⏳");

    await ctx.telegram.sendPhoto(ADMIN_ID, photoId, {
        caption:
            `🔔 Yangi to'lov\n👤 ${ctx.from.first_name}\n📚 ${subject}\n🆔 ${userId}`,
        ...Markup.inlineKeyboard([
            [Markup.button.callback("Tasdiqlash ✅", `approve_${userId}_${subject}`)],
            [Markup.button.callback("Rad ❌", `reject_${userId}`)]
        ])
    });
});



/* ================= APPROVE ================= */
bot.action(/approve_(\d+)_(.+)/, async (ctx) => {

    if (ctx.from.id.toString() !== ADMIN_ID)
        return ctx.answerCbQuery("Ruxsat yo'q");

    const userId = ctx.match[1];
    const subject = ctx.match[2];

    try {

        const res = await axios.get(`${FIREBASE_URL}/${subject}.json`);
        const promos = res.data || {};

        const code = Object.keys(promos).find(k => promos[k] === false);

        if (!code) return ctx.reply("Kod qolmagan ❌");

        await axios.patch(`${FIREBASE_URL}/${subject}.json`, { [code]: true });

        await ctx.telegram.sendMessage(userId, `🎉 Tasdiqlandi!\nPromo: ${code}`);

        await ctx.editMessageCaption("✅ Kod yuborildi");

    } catch {
        ctx.reply("Xatolik yuz berdi");
    }
});



/* ================= REJECT ================= */
bot.action(/reject_(\d+)/, async (ctx) => {

    if (ctx.from.id.toString() !== ADMIN_ID) return;

    const userId = ctx.match[1];

    await ctx.telegram.sendMessage(userId, "❌ Chek tasdiqlanmadi");
    await ctx.editMessageCaption("❌ Rad etildi");
});



/* ================= VERCEL HANDLER ================= */
module.exports = async (req, res) => {

    if (req.method === 'POST') {
        await bot.handleUpdate(req.body, res);
    } else {
        res.status(200).send('Bot ishlayapti');
    }
};
