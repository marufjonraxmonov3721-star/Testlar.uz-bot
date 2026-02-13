const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const BOT_TOKEN = '7116176622:AAHyywSzvoxdeoC4OzxZs_jRDqQdzVvOyDI';
const ADMIN_ID = 7385372033;
const FIREBASE_URL = "https://gen-lang-client-0228947349-default-rtdb.firebaseio.com/promos";

const bot = new Telegraf(BOT_TOKEN);

// 1. SHIRIN SO'ZLAR BILAN KUTIB OLISH
bot.start((ctx) => {
    const ism = ctx.from.first_name;
    return ctx.replyWithMarkdown(
        `🌟 **Assalomu alaykum, aziz ${ism}!**\n\n` +
        `Sizni ko'rib turganimizdan juda mamnunmiz. 😊\n\n` +
        `📖 **Fanni ochish uchun:**\n` +
        `1. Ilovada ko'rsatilgan kartaga to'lov qiling.\n` +
        `2. To'lov chekini (rasmini) shu yerga yuboring.\n` +
        `3. Admin tasdiqlagach, promo-kodingizni olasiz! ✨`,
        Markup.inlineKeyboard([[Markup.button.url("🚀 Ilovaga kirish", "https://testlar-uz.vercel.app/")]])
    );
});

// 2. RASM KELGANDA ISHLAYDIGAN QISM
bot.on('photo', async (ctx) => {
    try {
        const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
        await ctx.reply("Ushbu to‘lov qaysi fan uchun? Iltimos tanlang:", 
            Markup.inlineKeyboard([
                [Markup.button.callback("Dinshunoslik", `sel_${photoId}_dinshunoslik`)],
                [Markup.button.callback("Fizika", `sel_${photoId}_fizika`)],
                [Markup.button.callback("Matematika", `sel_${photoId}_oliy matematika`)],
                [Markup.button.callback("AKT", `sel_${photoId}_texnik_tizimlarda_akt`)],
                [Markup.button.callback("Yo'nalish", `sel_${photoId}_yo'nalishga kirish`)]
            ])
        );
    } catch (e) { console.error(e); }
});

// 3. FAN TANLANGANDA ADMINGA YUBORISH
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

// 4. ADMIN TASDIQLASA (FIREBASE BILAN)
bot.action(/app_(\d+)_(.+)/, async (ctx) => {
    if (ctx.from.id != ADMIN_ID) return ctx.answerCbQuery("Ruxsat yo'q!");
    const userId = ctx.match[1];
    const subject = ctx.match[2];

    try {
        const res = await axios.get(`${FIREBASE_URL}/${subject}.json`);
        const promos = res.data;
        if (promos) {
            const code = Object.keys(promos).find(c => promos[c] === false);
            if (code) {
                await axios.patch(`${FIREBASE_URL}/${subject}.json`, { [code]: true });
                await ctx.telegram.sendMessage(userId, `🎉 To‘lovingiz tasdiqlandi!\n📚 Fan: ${subject.toUpperCase()}\n🔑 Promo-kod: ${code}`);
                return ctx.editMessageCaption(`✅ TASDIQLANDI. Kod: ${code}`);
            }
        }
        await ctx.reply("❌ Bazada bo'sh kod qolmagan!");
    } catch (e) { await ctx.reply("❌ Baza xatosi!"); }
});

// 5. RAD ETISH
bot.action(/rej_(\d+)/, async (ctx) => {
    await ctx.telegram.sendMessage(ctx.match[1], "❌ Kechirasiz, chekingiz tasdiqlanmadi.");
    await ctx.editMessageCaption("❌ TO'LOV RAD ETILDI.");
});

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try { await bot.handleUpdate(req.body); res.status(200).send('OK'); }
        catch (e) { res.status(200).send('Error'); }
    } else { res.status(200).send('Bot ishlayapti... 🚀'); }
};
