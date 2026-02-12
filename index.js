const { Telegraf, Markup } = require('telegraf');

const BOT_TOKEN = '7116176622:AAHc0S8SdaJXU6T4tJsXCaMUldZaiTOAOZM';
const ADMIN_ID = 7385372033; 

const bot = new Telegraf(BOT_TOKEN);

// Tasodifiy promo-kod yaratish funksiyasi
function generatePromo() {
    return 'YK' + Math.floor(1000 + Math.random() * 9000); // Masalan: YK5432
}

bot.start((ctx) => {
    ctx.reply(`Salom ${ctx.from.first_name}! 🚀\n\nFanni ochish uchun to'lov qiling va chekni (rasmni) shu yerga yuboring. Tasdiqlangach, bot sizga avtomatik promo-kod beradi.`);
});

// Foydalanuvchi rasm yuborganda
bot.on('photo', async (ctx) => {
    const userId = ctx.from.id;
    const firstName = ctx.from.first_name;

    try {
        // Adminga (Sizga) xabar va tugma yuborish
        await ctx.telegram.sendPhoto(ADMIN_ID, ctx.message.photo[ctx.message.photo.length - 1].file_id, {
            caption: `🔔 YANGI CHEK!\n👤 Kimdan: ${firstName}\n🆔 User ID: ${userId}`,
            ...Markup.inlineKeyboard([
                [Markup.button.callback('Tasdiqlash ✅', `approve_${userId}`)]
            ])
        });

        ctx.reply("Chekingiz qabul qilindi! Admin tekshirgandan so'ng kod keladi. ✅");
    } catch (e) {
        ctx.reply("Xatolik! Qaytadan urinib ko'ring.");
    }
});

// Tugma bosilganda (Admin tasdiqlaganda)
bot.action(/approve_(\d+)/, async (ctx) => {
    const userId = ctx.match[1];
    const newPromo = generatePromo();

    try {
        // 1. Foydalanuvchiga promo-kodni yuborish
        await ctx.telegram.sendMessage(userId, `Tabriklaymiz! To'lovingiz tasdiqlandi. 🎉\n\nSizning promo-kodingiz: ${newPromo}\n\nUshbu kodni ilovaga kiriting va fanni oching!`);
        
        // 2. Adminga xabarni yangilash
        await ctx.editMessageCaption(`✅ TASDIQLANDI\n👤 ID: ${userId}\n🔑 Kod: ${newPromo}`);
        
        await ctx.answerCbQuery("Foydalanuvchiga kod yuborildi! ✅");
    } catch (e) {
        await ctx.answerCbQuery("Xatolik yuz berdi! ❌");
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
        res.status(200).send('Bot xizmati yoqilgan...');
    }
};
