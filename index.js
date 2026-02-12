const { Telegraf, Markup } = require('telegraf');

const BOT_TOKEN = '7116176622:AAHc0S8SdaJXU6T4tJsXCaMUldZaiTOAOZM';
const ADMIN_ID = 7385372033; 

const bot = new Telegraf(BOT_TOKEN);

// Har bir fan uchun maxsus bir martalik kod yaratish
function generatePromo(subject) {
    const subPrefix = subject.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${subPrefix}_YK${randomNum}`; 
}

bot.start((ctx) => {
    return ctx.reply(`Salom ${ctx.from.first_name}! 🚀\n\nFanni ochish uchun ilovadagi "Chekni Botga yuborish" tugmasini bosing.`);
});

bot.on('photo', async (ctx) => {
    const caption = ctx.message.caption || "";
    // Ilovadan yuborilgan matndagi qo'shtirnoq ichidagi fan nomini ajratib olish
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
        console.error(e);
    }
});

bot.action(/approve_(\d+)_(.+)/, async (ctx) => {
    const userId = ctx.match[1];
    const subject = ctx.match[2];
    const newPromo = generatePromo(subject);

    try {
        await ctx.telegram.sendMessage(userId, `🎉 To'lovingiz tasdiqlandi!\n\n📚 Fan: ${subject}\n🔑 Promo-kod: ${newPromo}\n\n⚠️ Bu kod faqat shu fan uchun 1 marta ishlaydi!`);
        await ctx.editMessageCaption(`✅ TASDIQLANDI\n👤 ID: ${userId}\n📚 Fan: ${subject}\n🔑 Kod: ${newPromo}`);
        return ctx.answerCbQuery("Kod foydalanuvchiga yuborildi!");
    } catch (e) {
        console.error(e);
        return ctx.answerCbQuery("Xatolik yuz berdi!");
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
