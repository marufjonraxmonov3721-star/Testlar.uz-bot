const { Telegraf, Markup } = require('telegraf');
const admin = require('firebase-admin');

// Firebase sozlamalari
if (!admin.apps.length) {
    admin.initializeApp({
        databaseURL: "https://gen-lang-client-0228947349-default-rtdb.firebaseio.com"
    });
}
const db = admin.database();

const BOT_TOKEN = '7116176622:AAHc0S8SdaJXU6T4tJsXCaMUldZaiTOAOZM';
const ADMIN_ID = 7385372033; 

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
    return ctx.reply(`Salom ${ctx.from.first_name}! 🚀\n\nFanni ochish uchun ilovadan "Chekni Botga yuborish" tugmasini bosing va rasmni yuboring.`);
});

bot.on('photo', async (ctx) => {
    const caption = ctx.message.caption || "";
    // Ilovadan kelgan xabardan fan nomini ajratib olish: "FAN_NOMI"
    const subjectMatch = caption.match(/"([^"]+)"/);
    const subject = subjectMatch ? subjectMatch[1] : "Noma'lum Fan";

    try {
        await ctx.telegram.sendPhoto(ADMIN_ID, ctx.message.photo[ctx.message.photo.length - 1].file_id, {
            caption: `🔔 YANGI TO'LOV!\n👤 Kimdan: ${ctx.from.first_name}\n📚 Fan: ${subject}\n🆔 ID: ${ctx.from.id}`,
            ...Markup.inlineKeyboard([
                [Markup.button.callback('Tasdiqlash ✅', `approve_${ctx.from.id}_${subject}`)]
            ])
        });
        return ctx.reply(`Chekingiz qabul qilindi! ✅\nAdmin "${subject}" fani uchun to'lovni tasdiqlasa, sizga maxsus promo-kod yuboriladi.`);
    } catch (e) {
        console.error("Xabarni yuborishda xatolik:", e);
    }
});

bot.action(/approve_(\d+)_(.+)/, async (ctx) => {
    const userId = ctx.match[1];
    const subject = ctx.match[2]; // Masalan: fizika

    try {
        // Firebase-dan ushbu fan uchun kodlarni olish
        const promoRef = db.ref(`promos/${subject}`);
        const snapshot = await promoRef.once('value');

        if (snapshot.exists()) {
            const allPromos = snapshot.val();
            // Birinchi ishlatilmagan (false) kodni topish
            const availableCode = Object.keys(allPromos).find(code => allPromos[code] === false);

            if (availableCode) {
                // 1. Bazada kodni ishlatilgan (true) deb belgilash
                await promoRef.update({ [availableCode]: true });

                // 2. Foydalanuvchiga kodni yuborish
                await ctx.telegram.sendMessage(userId, `🎉 To'lovingiz tasdiqlandi!\n\n📚 Fan: ${subject.toUpperCase()}\n🔑 Promo-kod: ${availableCode}\n\n⚠️ Bu kod faqat bir marta ishlaydi!`);
                
                // 3. Adminga xabarni yangilash
                await ctx.editMessageCaption(`✅ TASDIQLANDI\n👤 ID: ${userId}\n📚 Fan: ${subject}\n🔑 Kod: ${availableCode}`);
                return ctx.answerCbQuery("Kod foydalanuvchiga yuborildi! ✅");
            } else {
                await ctx.reply(`❌ Xatolik: "${subject}" fani uchun bazada bo'sh kod qolmagan! Admin paneldan kod qo'shing.`);
                return ctx.answerCbQuery("Bazada kod yo'q!");
            }
        } else {
            await ctx.reply(`❌ Xatolik: Bazada "${subject}" degan bo'lim topilmadi.`);
            return ctx.answerCbQuery("Bo'lim topilmadi!");
        }
    } catch (e) {
        console.error("Action xatoligi:", e);
        return ctx.answerCbQuery("Xatolik yuz berdi! ❌");
    }
});

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } catch (err) {
            res.status(500).send('Internal Error');
        }
    } else {
        res.status(200).send('Bot ishlamoqda...');
    }
};
