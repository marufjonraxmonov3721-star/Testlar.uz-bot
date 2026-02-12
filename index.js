const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const BOT_TOKEN = '7116176622:AAHc0S8SdaJXU6T4tJsXCaMUldZaiTOAOZM';
const ADMIN_ID = 7385372033;
const FIREBASE_URL = "https://gen-lang-client-0228947349-default-rtdb.firebaseio.com/promos";

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => ctx.reply("Assalomu alaykum! To'lov chekini rasm ko'rinishida yuboring. Admin tasdiqlagach promo-kod olasiz."));

bot.on('photo', async (ctx) => {
    const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    const userId = ctx.from.id;
    const userName = ctx.from.first_name;

    // 1. Foydalanuvchiga tugmasiz oddiy xabar yuboramiz
    await ctx.reply("Chekingiz qabul qilindi! Admin tekshirib tasdiqlagach promo-kod yuboriladi. ✅");

    // 2. Tugmalarni FAQAT ADMINGA (sizga) yuboramiz
    await ctx.telegram.sendPhoto(ADMIN_ID, photoId, {
        caption: `🔔 YANGI TO'LOV KELDI!\n👤 Kimdan: ${userName}\n🆔 ID: ${userId}\n\nUshbu chek qaysi fan uchun? Tasdiqlash uchun fanni tanlang:`,
        ...Markup.inlineKeyboard([
            [Markup.button.callback("Dinshunoslik", `approve_${userId}_dinshunoslik`)],
            [Markup.button.callback("Fizika", `approve_${userId}_fizika`)],
            [Markup.button.callback("Matematika", `approve_${userId}_oliy matematika`)],
            [Markup.button.callback("AKT", `approve_${userId}_texnik_tizimlarda_akt`)],
            [Markup.button.callback("Yo'nalish", `approve_${userId}_yo'nalishga kirish`)]
        ])
    });
});

bot.action(/approve_(\d+)_(.+)/, async (ctx) => {
    // FAQAT ADMIN tugmalarni bosa oladi
    if (ctx.from.id !== ADMIN_ID) {
        return ctx.answerCbQuery("Sizda bu tugmani bosish ruxsati yo'q! ❌");
    }

    const userId = ctx.match[1];
    const subject = ctx.match[2];

    try {
        const res = await axios.get(`${FIREBASE_URL}/${subject}.json`);
        const promos = res.data;

        if (promos) {
            const availableCode = Object.keys(promos).find(code => promos[code] === false);

            if (availableCode) {
                // Bazada kodni ishlatilgan deb belgilash
                await axios.patch(`${FIREBASE_URL}/${subject}.json`, {
                    [availableCode]: true
                });

                // FOYDALANUVCHIGA kodni yuborish
                await ctx.telegram.sendMessage(userId, `🎉 To'lovingiz tasdiqlandi!\n📚 Fan: ${subject.toUpperCase()}\n🔑 Promo-kod: ${availableCode}\n\nUshbu kodni ilovada ishlating!`);
                
                // ADMINGA (sizga) xabarni yangilab qo'yamiz
                await ctx.editMessageCaption(`✅ TASDIQLANDI\n📚 Fan: ${subject}\n🔑 Kod: ${availableCode}\n👤 Foydalanuvchi: ${userId}`);
                return ctx.answerCbQuery("Kod foydalanuvchiga yuborildi! ✅");
            } else {
                await ctx.reply(`❌ Xatolik: "${subject}" fani uchun bazada bo'sh kod qolmagan!`);
            }
        } else {
            await ctx.reply(`❌ Xatolik: Bazada "${subject}" bo'limi topilmadi!`);
        }
    } catch (e) {
        console.error("Firebase Error:", e.message);
        await ctx.reply("❌ Bazaga ulanishda xatolik yuz berdi.");
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
        res.status(200).send('Bot ishlamoqda...');
    }
};
