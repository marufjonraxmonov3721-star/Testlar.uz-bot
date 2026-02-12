const { Telegraf, Markup } = require('telegraf');

const BOT_TOKEN = '7116176622:AAHc0S8SdaJXU6T4tJsXCaMUldZaiTOAOZM';
const ADMIN_ID = 7385372033; 

const bot = new Telegraf(BOT_TOKEN);

// Promo-kod yaratish: Fan nomining birinchi 3 harfini qo'shadi
function generatePromo(subject) {
    const subPrefix = subject.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${subPrefix}_YK${randomNum}`; 
}

bot.start((ctx) => {
    return ctx.reply(`Salom ${ctx.from.first_name}! 🚀\n\nFanni ochish uchun ilovadan "Chekni Botga yuborish" tugmasini bosing.`);
});

bot.on('photo', async (ctx) => {
    const caption = ctx.message.caption || "";
    // Fan nomini qidirish, topilmasa "FAN" deb olish (Xatolikni oldini oladi)
    const subjectMatch = caption.match(/"([^"]+)"/);
    const subject = subjectMatch ? subjectMatch[1] : "FAN";

    try {
        await ctx.telegram.sendPhoto(ADMIN_ID, ctx.message.photo[ctx.message.photo.length - 1].file_id, {
            caption: `🔔 YANGI CHEK!\n👤 Kimdan: ${ctx.from.first_name}\n📚 Fan: ${subject}\n🆔 ID: ${ctx.from.id}`,
            ...Markup.inlineKeyboard([
                [Markup.button.callback('Tasdiqlash ✅', `approve_${ctx.from.id}_${subject.substring(0,10)}`)]
            ])
        });
        return ctx.reply("Chek qabul qilindi! Admin tekshirib tasdiqlagach, ushbu fan uchun maxsus promo-kod keladi. ✅");
    } catch (e) {
        console.error(e);
    }
});

bot.action(/approve_(\d+)_(.+)/, async (ctx) => {
    const userId = ctx.match[1];
    const subject = ctx.match[2];
    const newPromo = generatePromo(subject);

    try {
        await ctx.telegram.sendMessage(userId, `🎉 To'lovingiz tasdiqlandi!\n\n📚 Fan: ${subject}\n🔑 Promo-kod: ${newPromo}\n\n⚠️ Bu kod faqat shu fan uchun ishlaydi!`);
        await ctx.editMessageCaption(`✅ TASDIQLANDI\n📚 Fan: ${subject}\n🔑 Kod: ${newPromo}`);
        return ctx.answerCbQuery("Kod yuborildi!");
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
