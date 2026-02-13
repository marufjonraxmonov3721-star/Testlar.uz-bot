const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const BOT_TOKEN = '7116176622:AAHyywSzvoxdeoC4OzxZs_jRDqQdzVvOyDI';
const ADMIN_ID = 7385372033;
const FIREBASE_URL = "https://gen-lang-client-0228947349-default-rtdb.firebaseio.com/promos";

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => ctx.reply("Assalomu alaykum! To‘lov chekini rasm ko‘rinishida yuboring. 🚀"));

// RASM KELGANDA ISHLAYDIGAN ASOSIY QISM
bot.on('photo', async (ctx) => {
    try {
        const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
        await ctx.reply("Ushbu to‘lov qaysi fan uchun?", 
            Markup.inlineKeyboard([
                [Markup.button.callback("Dinshunoslik", `sel_${photoId}_dinshunoslik`)],
                [Markup.button.callback("Fizika", `sel_${photoId}_fizika`)],
                [Markup.button.callback("Matematika", `sel_${photoId}_oliy matematika`)],
                [Markup.button.callback("AKT", `sel_${photoId}_texnik_tizimlarda_akt`)],
                [Markup.button.callback("Yo'nalish", `sel_${photoId}_yo'nalishga kirish`)]
            ])
        );
    } catch (e) {
        console.log("Xato:", e);
    }
});

// FAN TANLANGANDA ADMINGA YUBORISH
bot.action(/sel_(.+)_(.+)/, async (ctx) => {
    const photoId = ctx.match[1];
    const subject = ctx.match[2];
    await ctx.editMessageText(`Siz ${subject.toUpperCase()} tanladingiz. Admin tasdiqlashini kuting... ⏳`);
    
    await ctx.telegram.sendPhoto(ADMIN_ID, photoId, {
        caption: `🔔 YANGI TO'LOV!\n👤 Kimdan: ${ctx.from.first_name}\n📚 Fan: ${subject.toUpperCase()}\n🆔 ID: ${ctx.from.id}`,
        ...Markup.inlineKeyboard([
            [Markup.button.callback("✅ Tasdiqlash", `app_${ctx.from.id}_${subject}`)],
            [Markup.button.callback("❌ Rad etish", `rej_${ctx.from.id}`)]
        ])
    });
});

// ADMIN TASDIQLASA
bot.action(/app_(\d+)_(.+)/, async (ctx) => {
    const userId = ctx.match[1];
    const subject = ctx.match[2];
    try {
        const res = await axios.get(`${FIREBASE_URL}/${subject}.json`);
        const code = Object.keys(res.data).find(c => res.data[c] === false);
        if (code) {
            await axios.patch(`${FIREBASE_URL}/${subject}.json`, { [code]: true });
            await ctx.telegram.sendMessage(userId, `🎉 Tasdiqlandi! Fan: ${subject.toUpperCase()}\n🔑 Kod: ${code}`);
            await ctx.editMessageCaption(`✅ Tasdiqlandi! Kod: ${code}`);
        }
    } catch (e) { await ctx.reply("Bazada kod qolmagan yoki xato!"); }
});

// ADMIN RAD ETSA
bot.action(/rej_(\d+)/, async (ctx) => {
    await ctx.telegram.sendMessage(ctx.match[1], "❌ To'lovingiz rad etildi.");
    await ctx.editMessageCaption("❌ Rad etildi.");
});

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try { await bot.handleUpdate(req.body); res.status(200).send('OK'); }
        catch (e) { res.status(200).send('Error'); }
    } else { res.status(200).send('Bot ishlayapti...'); }
};
