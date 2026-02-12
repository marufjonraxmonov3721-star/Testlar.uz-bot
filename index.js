const { Telegraf, Markup } = require('telegraf');
const admin = require('firebase-admin');

if (!admin.apps.length) {
    admin.initializeApp({
        databaseURL: "https://gen-lang-client-0228947349-default-rtdb.firebaseio.com"
    });
}
const db = admin.database();

const BOT_TOKEN = '7116176622:AAHc0S8SdaJXU6T4tJsXCaMUldZaiTOAOZM';
const ADMIN_ID = 7385372033; 
const bot = new Telegraf(BOT_TOKEN);

// Har bir fan uchun prefixlar
const subjectPrefixes = {
    "dinshunoslik": "DIN",
    "fizika": "FIZ",
    "oliy matematika": "MAT",
    "texnik_tizimlarda_akt": "AKT",
    "yo'nalishga kirish": "YON"
};

bot.start((ctx) => ctx.reply("Assalomu alaykum! To'lov chekini (rasm) yuboring."));

bot.on('photo', async (ctx) => {
    const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    const userId = ctx.from.id;

    // Adminga (Sizga) chekni tanlash tugmalari bilan yuboramiz
    await ctx.telegram.sendPhoto(ADMIN_ID, photoId, {
        caption: `🔔 YANGI TO'LOV KELDI!\n👤 Kimdan: ${ctx.from.first_name}\n🆔 ID: ${userId}\n\nIltimos, fanni tanlang va tasdiqlang:`,
        ...Markup.inlineKeyboard([
            [Markup.button.callback("Dinshunoslik", `approve_${userId}_dinshunoslik`)],
            [Markup.button.callback("Fizika", `approve_${userId}_fizika`)],
            [Markup.button.callback("Oliy matematika", `approve_${userId}_oliy matematika`)],
            [Markup.button.callback("AKT", `approve_${userId}_texnik_tizimlarda_akt`)],
            [Markup.button.callback("Yo'nalishga kirish", `approve_${userId}_yo'nalishga kirish`)]
        ])
    });

    return ctx.reply("Chekingiz qabul qilindi! Admin tasdiqlashi bilan promo-kod olasiz. ✅");
});

bot.action(/approve_(\d+)_(.+)/, async (ctx) => {
    const userId = ctx.match[1];
    const subject = ctx.match[2];

    try {
        const promoRef = db.ref(`promos/${subject}`);
        const snapshot = await promoRef.once('value');

        if (snapshot.exists()) {
            const allPromos = snapshot.val();
            const availableCode = Object.keys(allPromos).find(code => allPromos[code] === false);

            if (availableCode) {
                await promoRef.update({ [availableCode]: true });
                await ctx.telegram.sendMessage(userId, `🎉 To'lovingiz tasdiqlandi!\n📚 Fan: ${subject.toUpperCase()}\n🔑 Promo-kod: ${availableCode}\n\nUshbu kodni ilovaga kiriting!`);
                await ctx.editMessageCaption(`✅ TASDIQLANDI\n👤 Kimdan: ID ${userId}\n📚 Fan: ${subject}\n🔑 Kod: ${availableCode}`);
            } else {
                await ctx.answerCbQuery("❌ Bazada bo'sh kod qolmagan!", { show_alert: true });
            }
        } else {
            await ctx.answerCbQuery("❌ Bazada bu fan topilmadi!", { show_alert: true });
        }
    } catch (e) {
        await ctx.answerCbQuery("❌ Xatolik yuz berdi!");
    }
});

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        await bot.handleUpdate(req.body);
        res.status(200).send('OK');
    } else {
        res.status(200).send('Bot ishlamoqda...');
    }
};
