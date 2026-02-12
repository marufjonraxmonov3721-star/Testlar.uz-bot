const { Telegraf } = require('telegraf');

// Siz bergan ma'lumotlar asosida
const BOT_TOKEN = '7116176622:AAHc0S8SdaJXU6T4tJsXCaMUldZaiTOAOZM';
const ADMIN_ID = '7385372033'; 

const bot = new Telegraf(BOT_TOKEN);

// Bot ishga tushganda ko'rinadigan xabar
bot.start((ctx) => {
    ctx.reply(`Salom ${ctx.from.first_name}!\n\n"Yakuniyga tayyorlovchi" ilovasining rasmiy botiga xush kelibsiz.\n\nFanni ochish uchun 10 000 so'm to'lov qiling va chekni (rasmni) shu yerga yuboring. To'lov tasdiqlangach, sizga promo-kod taqdim etiladi.`);
});

// Foydalanuvchi rasm (chek) yuborganida
bot.on('photo', async (ctx) => {
    const userId = ctx.from.id;
    const userName = ctx.from.username ? `@${ctx.from.username}` : "Username yo'q";
    const firstName = ctx.from.first_name;

    try {
        // Adminga (Sizga) chekni yuborish
        await ctx.telegram.sendPhoto(ADMIN_ID, ctx.message.photo[ctx.message.photo.length - 1].file_id, {
            caption: `🔔 YANGI TO'LOV CHEKI!\n\n👤 Kimdan: ${firstName} (${userName})\n🆔 User ID: ${userId}\n\nIltimos, chekni tekshiring va foydalanuvchiga promo-kod yuboring.`
        });

        // Foydalanuvchiga javob qaytarish
        ctx.reply("Chekingiz qabul qilindi! ✅\nAdmin tez orada uni tekshiradi va sizga promo-kodni shu yerga yuboradi.");
    } catch (error) {
        console.error("Xatolik yuz berdi:", error);
        ctx.reply("Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.");
    }
});

// Botni Vercel-da ishlashi uchun eksport qilish
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } catch (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.status(200).send('Bot ishlamoqda...');
    }
};
