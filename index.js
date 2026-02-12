const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

// YANGI KONFIGURATSIYA
const BOT_TOKEN = '7116176622:AAGodJadxD5bmEegTB4TsjDOEng8r6s3uY4';
const ADMIN_ID = 7385372033;
const FIREBASE_URL = "https://gen-lang-client-0228947349-default-rtdb.firebaseio.com/promos";

const bot = new Telegraf(BOT_TOKEN);

// 1. BOTNI BOSHLASH
bot.start((ctx) => ctx.reply("Assalomu alaykum! Yangi token bilan bot ishga tushdi. To'lov chekini rasm ko'rinishida yuboring. 🚀"));

// 2. FOYDALANUVCHI RASM YUBORGANDA
bot.on('photo', async (ctx) => {
    try {
        const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
        
        await ctx.reply("Ushbu to'lov qaysi fan uchun? Iltimos tanlang:", 
        Markup.inlineKeyboard([
            [Markup.button.callback("Dinshunoslik", `select_${photoId}_dinshunoslik`)],
            [Markup.button.callback("Fizika", `select_${photoId}_fizika`)],
            [Markup.button.callback("Matematika", `select_${photoId}_oliy matematika`)],
            [Markup.button.callback("AKT", `select_${photoId}_texnik_tizimlarda_akt`)],
            [Markup.button.callback("Yo'nalish", `select_${photoId}_yo'nalishga kirish`)]
        ]));
    } catch (err) {
        console.error("Rasm qabul qilishda xato:", err);
    }
});

// 3. FOYDALANUVCHI FANNI TANLAGANDA
bot.action(/select_(.+)_(.+)/, async (ctx) => {
    const photoId = ctx.match[1];
    const subject = ctx.match[2];
    const userId = ctx.from.id;

    await ctx.editMessageText(`Siz "${subject.toUpperCase()}" fanini tanladingiz. Admin tasdiqlashini kuting... ⏳`);

    await ctx.telegram.sendPhoto(ADMIN_ID, photoId, {
        caption: `🔔 YANGI TO'LOV KELDI!\n👤 Kimdan: ${ctx.from.first_name}\n📚 Fan: ${subject.toUpperCase()}\n🆔 ID: ${userId}`,
        ...Markup.inlineKeyboard([
            [Markup.button.callback("Tasdiqlash ✅", `approve_${userId}_${subject}`)],
            [Markup.button.callback("Rad etish ❌", `reject_${userId}`)]
        ])
    });
});

// 4. ADMIN TASDIQLASHNI BOSGANDA
bot.action(/approve_(\d+)_(.+)/, async (ctx) => {
    if (ctx.from.id != ADMIN_ID) return ctx.answerCbQuery("Sizda ruxsat yo'q! ❌");

    const userId = ctx.match[1];
    const subject = ctx.match[2];

    try {
        const res = await axios.get(`${FIREBASE_URL}/${subject}.json`);
        const promos = res.data;

        if (promos) {
            const availableCode = Object.keys(promos).find(code => promos[code] === false);
            if (availableCode) {
                await axios.patch(`${FIREBASE_URL}/${subject}.json`, { [availableCode]: true });
                await ctx.telegram.sendMessage(userId, `🎉 To'lovingiz tasdiqlandi!\n📚 Fan: ${subject.toUpperCase()}\n🔑 Promo-kod: ${availableCode}\n\nUshbu kodni ilovada ishlating!`);
                await ctx.editMessageCaption(`✅ TASDIQLANDI\n📚 Fan: ${subject}\n🔑 Kod: ${availableCode}\n👤 Foydalanuvchi: ID ${userId}`);
            } else {
                await ctx.reply(`❌ "${subject}" uchun bazada bo'sh kod qolmagan!`);
            }
        }
    } catch (e) {
        await ctx.reply("❌ Bazaga ulanishda xatolik yuz berdi.");
    }
});

// 5. RAD ETISH
bot.action(/reject_(\d+)/, async (ctx) => {
    if (ctx.from.id != ADMIN_ID) return ctx.answerCbQuery("Ruxsat yo'q!");
    await ctx.telegram.sendMessage(ctx.match[1], "❌ Kechirasiz, yuborgan chekingiz tasdiqlanmadi.");
    await ctx.editMessageCaption("❌ Rad etildi.");
});

// 6. VERCEL INTEGRATSIYASI
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } catch (err) {
            res.status(500).send('Error');
        }
    } else {
        res.status(200).send('Bot uyg\'oq va ishlamoqda... 🚀');
    }
};
