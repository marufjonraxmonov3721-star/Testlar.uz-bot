const { Telegraf, Markup } = require('telegraf');
const admin = require('firebase-admin');

// Firebase init - Agar xato bo'lsa darhol to'xtatadi
if (!admin.apps.length) {
    admin.initializeApp({
        databaseURL: "https://gen-lang-client-0228947349-default-rtdb.firebaseio.com"
    });
}
const db = admin.database();

const BOT_TOKEN = '7116176622:AAHc0S8SdaJXU6T4tJsXCaMUldZaiTOAOZM';
const ADMIN_ID = 7385372033; 
const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => ctx.reply("Assalomu alaykum! To'lov chekini rasm ko'rinishida yuboring."));

bot.on('photo', async (ctx) => {
    const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    const userId = ctx.from.id;

    await ctx.telegram.sendPhoto(ADMIN_ID, photoId, {
        caption: `🔔 YANGI TO'LOV KELDI!\n👤 Kimdan: ${ctx.from.first_name}\n🆔 ID: ${userId}\n\nFanni tanlang:`,
        ...Markup.inlineKeyboard([
            [Markup.button.callback("Dinshunoslik", `approve_${userId}_dinshunoslik`)],
            [Markup.button.callback("Fizika", `approve_${userId}_fizika`)],
            [Markup.button.callback("Matematika", `approve_${userId}_oliy matematika`)],
            [Markup.button.callback("AKT", `approve_${userId}_texnik_tizimlarda_akt`)],
            [Markup.button.callback("Yo'nalish", `approve_${userId}_yo'nalishga kirish`)]
        ])
    });
    return ctx.reply("Chek qabul qilindi! Admin tasdiqlashi bilan kod olasiz. ✅");
});

bot.action(/approve_(\d+)_(.+)/, async (ctx) => {
    const userId = ctx.match[1];
    const subject = ctx.match[2]; // Bu yerda bazadagi kichik harfli nom keladi

    try {
        const promoRef = db.ref(`promos/${subject}`);
        const snapshot = await promoRef.once('value');

        if (snapshot.exists()) {
            const allPromos = snapshot.val();
            // Bazadagi kodlar ichidan false bo'lganini qidirish
            const availableCode = Object.keys(allPromos).find(code => allPromos[code] === false);

            if (availableCode) {
                // Kodni ishlatilgan qilish
                await promoRef.update({ [availableCode]: true });
                
                // Foydalanuvchiga yuborish
                await ctx.telegram.sendMessage(userId, `🎉 To'lovingiz tasdiqlandi!\n📚 Fan: ${subject.toUpperCase()}\n🔑 Promo-kod: ${availableCode}`);
                
                // Adminga xabarni yangilash
                await ctx.editMessageCaption(`✅ TASDIQLANDI\n📚 Fan: ${subject}\n🔑 Kod: ${availableCode}`);
                return ctx.answerCbQuery("Muvaffaqiyatli! ✅");
            } else {
                return ctx.reply(`❌ "${subject}" uchun bazada bo'sh kod qolmagan!`);
            }
        } else {
            return ctx.reply(`❌ Bazada "${subject}" degan bo'lim topilmadi! Admin panelda kod yarating.`);
        }
    } catch (e) {
        console.error("Firebase Error:", e);
        return ctx.reply("❌ Bazaga ulanishda xatolik yuz berdi.");
    }
});

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } catch (err) {
            console.error(err);
            res.status(500).send('Error');
        }
    } else {
        res.status(200).send('Bot ishlamoqda...');
    }
};
