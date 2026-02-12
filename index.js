const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const BOT_TOKEN = '7116176622:AAGodJadxD5bmEegTB4TsjDOEng8r6s3uY4';
const ADMIN_ID = 7385372033;
const FIREBASE_URL = "https://gen-lang-client-0228947349-default-rtdb.firebaseio.com/promos";

const bot = new Telegraf(BOT_TOKEN);

// 1. START KOMANDASI
bot.start((ctx) => {
    return ctx.reply("Assalomu alaykum! To'lov chekini rasm ko'rinishida yuboring. 🚀");
});

// 2. RASM (CHEK) KELGANDA
bot.on('photo', async (ctx) => {
    try {
        // Rasm ID sini olish
        const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
        const userId = ctx.from.id;

        console.log(`Rasm keldi. User: ${userId}`);

        // Foydalanuvchiga darhol javob qaytarish
        await ctx.reply("Chek qabul qilindi. Qaysi fan uchun to'lov qildingiz?", 
            Markup.inlineKeyboard([
                [Markup.button.callback("Dinshunoslik", `select_${photoId}_dinshunoslik`)],
                [Markup.button.callback("Fizika", `select_${photoId}_fizika`)],
                [Markup.button.callback("Matematika", `select_${photoId}_oliy matematika`)],
                [Markup.button.callback("AKT", `select_${photoId}_texnik_tizimlarda_akt`)],
                [Markup.button.callback("Yo'nalish", `select_${photoId}_yo'nalishga kirish`)]
            ])
        );
    } catch (err) {
        console.error("Rasm qabul qilishda xato:", err);
        await ctx.reply("Xatolik yuz berdi. Iltimos, rasmni qayta yuboring.");
    }
});

// 3. FAN TANLANGANDA (ADMINGA YUBORISH)
bot.action(/select_(.+)_(.+)/, async (ctx) => {
    try {
        const photoId = ctx.match[1];
        const subject = ctx.match[2];
        const userId = ctx.from.id;

        await ctx.editMessageText(`Siz "${subject.toUpperCase()}" fanini tanladingiz. Admin tasdiqlashini kuting... ⏳`);

        // Adminga yuborish
        await ctx.telegram.sendPhoto(ADMIN_ID, photoId, {
            caption: `🔔 YANGI TO'LOV!\n👤 Kimdan: ${ctx.from.first_name}\n📚 Fan: ${subject.toUpperCase()}\n🆔 ID: ${userId}`,
            ...Markup.inlineKeyboard([
                [Markup.button.callback("Tasdiqlash ✅", `approve_${userId}_${subject}`)],
                [Markup.button.callback("Rad etish ❌", `reject_${userId}`)]
            ])
        });
    } catch (err) {
        console.error("Tanlovda xato:", err);
    }
});

// 4. ADMIN TASDIQLASHI
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
                await ctx.telegram.sendMessage(userId, `🎉 Tasdiqlandi!\n📚 Fan: ${subject.toUpperCase()}\n🔑 Kod: ${availableCode}`);
                await ctx.editMessageCaption(`✅ Tasdiqlandi. Kod: ${availableCode}`);
            } else {
                await ctx.reply("Bo'sh kod qolmagan!");
            }
        }
    } catch (e) {
        await ctx.reply("Bazaga ulanishda xato!");
    }
});

// 5. RAD ETISH
bot.action(/reject_(\d+)/, async (ctx) => {
    if (ctx.from.id != ADMIN_ID) return;
    await ctx.telegram.sendMessage(ctx.match[1], "❌ Chekingiz rad etildi.");
    await ctx.editMessageCaption("❌ Rad etildi.");
});

// VERCEL INTEGRATSIYASI
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } catch (err) {
            res.status(500).send('Error');
        }
    } else {
        res.status(200).send('Bot ishlamoqda... 🚀');
    }
};
