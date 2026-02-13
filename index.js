const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

// YANGI TOKEN VA MA'LUMOTLAR
const BOT_TOKEN = '7116176622:AAHyywSzvoxdeoC4OzxZs_jRDqQdzVvOyDI';
const ADMIN_ID = 7385372033; // Sizning Telegram ID raqamingiz
const FIREBASE_URL = "https://gen-lang-client-0228947349-default-rtdb.firebaseio.com/promos";

const bot = new Telegraf(BOT_TOKEN);

// 1. START BUYRUG'I
bot.start((ctx) => {
    return ctx.reply("Assalomu alaykum! To‘lov chekini rasm ko‘rinishida yuboring. 🚀");
});

// 2. FOYDALANUVCHI RASM YUBORGANDA
bot.on('photo', async (ctx) => {
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
});

// 3. FAN TANLANGANDA (FOYDALANUVCHIGA JAVOB VA ADMINGA SO'ROV)
bot.action(/sel_(.+)_(.+)/, async (ctx) => {
    const photoId = ctx.match[1];
    const subject = ctx.match[2];
    
    await ctx.editMessageText(`Siz ${subject.toUpperCase()} fanini tanladingiz. Admin tasdiqlashini kuting... ⏳`);
    
    // Adminga yuborish
    await ctx.telegram.sendPhoto(ADMIN_ID, photoId, {
        caption: `🔔 YANGI TO'LOV!\n👤 Foydalanuvchi: ${ctx.from.first_name}\n📚 Fan: ${subject.toUpperCase()}\n🆔 ID: ${ctx.from.id}`,
        ...Markup.inlineKeyboard([
            [Markup.button.callback("Tasdiqlash ✅", `app_${ctx.from.id}_${subject}`)],
            [Markup.button.callback("Rad etish ❌", `rej_${ctx.from.id}`)]
        ])
    });
});

// 4. ADMIN TASDIQLASA ✅
bot.action(/app_(\d+)_(.+)/, async (ctx) => {
    if (ctx.from.id != ADMIN_ID) return ctx.answerCbQuery("Siz admin emassiz!");
    const userId = ctx.match[1];
    const subject = ctx.match[2];

    try {
        const res = await axios.get(`${FIREBASE_URL}/${subject}.json`);
        const promos = res.data;
        
        if (promos) {
            const code = Object.keys(promos).find(c => promos[c] === false);
            if (code) {
                // Firebase'da kodni ishlatilgan qilish
                await axios.patch(`${FIREBASE_URL}/${subject}.json`, { [code]: true });
                
                // Foydalanuvchiga yuborish
                await ctx.telegram.sendMessage(userId, `🎉 To‘lovingiz tasdiqlandi!\n📚 Fan: ${subject.toUpperCase()}\n🔑 Promo-kod: ${code}`);
                return ctx.editMessageCaption(`✅ TASDIQLANDI\n📚 Fan: ${subject.toUpperCase()}\n🔑 Kod: ${code} yuborildi.`);
            }
        }
        await ctx.reply("❌ Xato: Bu fan uchun bazada bo'sh kod qolmagan!");
    } catch (e) {
        await ctx.reply("❌ Firebase bilan bog'lanishda xato yuz berdi.");
    }
});

// 5. ADMIN RAD ETSA ❌
bot.action(/rej_(\d+)/, async (ctx) => {
    if (ctx.from.id != ADMIN_ID) return ctx.answerCbQuery("Siz admin emassiz!");
    const userId = ctx.match[1];
    
    await ctx.telegram.sendMessage(userId, "❌ Kechirasiz, yuborgan chekingiz tasdiqlanmadi.");
    await ctx.editMessageCaption("❌ TO'LOV RAD ETILDI.");
});

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try { await bot.handleUpdate(req.body); res.status(200).send('OK'); }
        catch (e) { res.status(200).send('Error'); }
    } else {
        res.status(200).send('Admin nazoratidagi bot faol... 🚀');
    }
};
