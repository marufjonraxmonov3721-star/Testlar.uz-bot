const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const BOT_TOKEN = '7116176622:AAGodJadxD5bmEegTB4TsjDOEng8r6s3uY4';
const ADMIN_ID = 7385372033;
const FIREBASE_URL = "https://gen-lang-client-0228947349-default-rtdb.firebaseio.com/promos";

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => ctx.reply("Assalomu alaykum! Chekni rasm ko'rinishida yuboring."));

bot.on('photo', async (ctx) => {
    const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    const userId = ctx.from.id;

    await ctx.telegram.sendPhoto(ADMIN_ID, photoId, {
        caption: `🔔 YANGI TO'LOV!\n👤 Kimdan: ${ctx.from.first_name}\n🆔 ID: ${userId}\n\nFanni tanlang:`,
        ...Markup.inlineKeyboard([
            [Markup.button.callback("Dinshunoslik", `approve_${userId}_dinshunoslik`)],
            [Markup.button.callback("Fizika", `approve_${userId}_fizika`)],
            [Markup.button.callback("Matematika", `approve_${userId}_oliy matematika`)],
            [Markup.button.callback("AKT", `approve_${userId}_texnik_tizimlarda_akt`)],
            [Markup.button.callback("Yo'nalish", `approve_${userId}_yo'nalishga kirish`)]
        ])
    });
    return ctx.reply("Chek qabul qilindi! Admin tasdiqlashini kuting. ✅");
});

bot.action(/approve_(\d+)_(.+)/, async (ctx) => {
    const userId = ctx.match[1];
    const subject = ctx.match[2];

    try {
        // Firebase-dan ma'lumotni o'qish
        const res = await axios.get(`${FIREBASE_URL}/${subject}.json`);
        const promos = res.data;

        if (promos) {
            const availableCode = Object.keys(promos).find(code => promos[code] === false);

            if (availableCode) {
                // Kodni ishlatilgan deb belgilash (PATCH)
                await axios.patch(`${FIREBASE_URL}/${subject}.json`, {
                    [availableCode]: true
                });

                // Foydalanuvchiga yuborish
                await ctx.telegram.sendMessage(userId, `🎉 To'lovingiz tasdiqlandi!\n📚 Fan: ${subject.toUpperCase()}\n🔑 Promo-kod: ${availableCode}`);
                
                // Adminga xabar
                await ctx.editMessageCaption(`✅ TASDIQLANDI\n📚 Fan: ${subject}\n🔑 Kod: ${availableCode}`);
                return ctx.answerCbQuery("Kod yuborildi! ✅");
            } else {
                await ctx.reply(`❌ "${subject}" uchun bazada bo'sh kod qolmagan!`);
            }
        } else {
            await ctx.reply(`❌ Bazada "${subject}" bo'limi topilmadi!`);
        }
    } catch (e) {
        console.error("Firebase Error:", e.message);
        await ctx.reply("❌ Bazaga ulanishda xatolik.");
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
