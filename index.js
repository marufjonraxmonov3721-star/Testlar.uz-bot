const { Telegraf, Markup } = require('telegraf');
const bot = new Telegraf('7116176622:AAHc0S8SdaJXU6T4tJsXCaMUldZaiTOAOZM');
const ADMIN_ID = 7385372033; 

// Promo-kod yaratish: Fanning birinchi 3 ta harfini qo'shamiz
function generatePromo(subject) {
    const subPrefix = subject.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${subPrefix}_YK${randomNum}`; // Masalan: TAR_YK1234
}

bot.on('photo', async (ctx) => {
    // Xabar matnidan qaysi fan ekanligini ajratib olamiz
    const caption = ctx.message.caption || "";
    const subject = caption.split('"')[1] || "FAN"; 

    await ctx.telegram.sendPhoto(ADMIN_ID, ctx.message.photo[ctx.message.photo.length - 1].file_id, {
        caption: `🔔 YANGI CHEK!\n👤 Kimdan: ${ctx.from.first_name}\n📚 Fan: ${subject}\n🆔 ID: ${ctx.from.id}`,
        ...Markup.inlineKeyboard([
            [Markup.button.callback('Tasdiqlash ✅', `approve_${ctx.from.id}_${subject}`)]
        ])
    });
    ctx.reply("Chek qabul qilindi! Admin tasdiqlasa, ushbu fan uchun kod keladi. ✅");
});

bot.action(/approve_(\d+)_(.+)/, async (ctx) => {
    const userId = ctx.match[1];
    const subject = ctx.match[2];
    const newPromo = generatePromo(subject);

    try {
        await ctx.telegram.sendMessage(userId, `✅ To'lov tasdiqlandi!\n\n📚 Fan: ${subject}\n🔑 Promo-kod: ${newPromo}\n\n⚠️ Diqqat: Bu kod faqat ${subject} fani uchun ishlaydi!`);
        await ctx.editMessageCaption(`✅ TASDIQLANDI\n📚 Fan: ${subject}\n🔑 Kod: ${newPromo}`);
    } catch (e) {
        console.error(e);
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
