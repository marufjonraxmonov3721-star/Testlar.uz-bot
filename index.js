const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

// MA'LUMOTLAR
const BOT_TOKEN = '7116176622:AAHyywSzvoxdeoC4OzxZs_jRDqQdzVvOyDI';
const ADMIN_ID = 7385372033;
const FIREBASE_URL = "https://gen-lang-client-0228947349-default-rtdb.firebaseio.com/promos";

const bot = new Telegraf(BOT_TOKEN);

// 1. START BUYRUG'I
bot.start((ctx) => {
    return ctx.reply("Assalomu alaykum! To‘lov chekini rasm ko‘rinishida yuboring. 🚀");
});

// 2. FOYDALANUVCHI RASM YUBORGANDA FANLARNI CHIQARISH
bot.on('photo', async (ctx) => {
    try {
        const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
        await ctx.reply("Ushbu to‘lov qaysi fan uchun? Iltimos tanlang:", 
            Markup.inlineKeyboard([
                [Markup.button.callback("Dinshunoslik", `sel_${photoId}_dinshunoslik`)],
                [Markup.button.callback("Fizika", `sel_${photoId}_fizika`)],
                [Markup.button.callback("Matematika", `sel_${photoId}_oliy matematika`)],
                [Markup.button.callback("AKT", `sel_${photoId}_texnik_tizimlarda_akt`)],
                [Markup.button.callback("Yo'nalish", `sel_${photoId}_yo'nalishga kirish`)]
            ])
        );
    } catch (e) {
        console.error("Rasm qabul qilishda xato:", e);
    }
});

// 3. FAN TANLANGANDA ADMINGA YUBORISH
bot.action(/sel_(.+)_(.+)/, async (ctx) => {
    try {
        const photoId = ctx.match[1];
        const subject = ctx.match[2];
        
        await ctx.editMessageText(`Siz ${subject.toUpperCase()} fanini tanladingiz. Admin tasdiqlashini kuting... ⏳`);
        
        // Adminga (Sizga) xabar yuborish
        await ctx.telegram.sendPhoto(ADMIN_ID, photoId, {
            caption: `🔔 YANGI TO'LOV!\n👤 Kimdan: ${ctx.from.first_name}\n📚 Fan: ${subject.toUpperCase()}\n🆔 ID: ${ctx.from.id}`,
            ...Markup.inlineKeyboard([
                [Markup.button.callback("Tasdiqlash ✅", `app_${ctx.from.id}_${subject}`)],
                [Markup.button.callback("Rad etish ❌", `rej_${ctx.from.id}`)]
            ])
        });
        await ctx.answerCbQuery();
    } catch (e) {
        console.error("Fan tanlashda xato:", e);
    }
});

// 4. ADMIN TASDIQLASA ✅
bot.action(/app_(\d+)_(.+)/, async (ctx) => {
    if (ctx.from.id != ADMIN_ID) return ctx.answerCbQuery("Siz admin emassiz!");
    
    const userId = ctx.match[1];
    const subject = ctx.match[2];

    try {
        // Firebase-dan kod qidirish
        const res = await axios.get(`${FIREBASE_URL}/${subject}.json`);
        const promos = res.data;
        
        if (promos) {
            // "false" (ishlatilmagan) bo'lgan birinchi kodni topish
            const code = Object.keys(promos).find(c => promos[c] === false);
            
            if (code) {
                // Firebase-da kodni ishlatilgan (true) deb belgilash
                await axios.patch(`${FIREBASE_URL}/${subject}.json`, { [code]: true });
                
                // Foydalanuvchiga promo-kodni yuborish
                await ctx.telegram.sendMessage(userId, `🎉 To‘lovingiz tasdiqlandi!\n📚 Fan: ${subject.toUpperCase()}\n🔑 Promo-kod: ${code}`);
                
                await ctx.editMessageCaption(`✅ TASDIQLANDI\n📚 Fan: ${subject.toUpperCase()}\n🔑 Kod: ${code} yuborildi.`);
            } else {
                await ctx.reply(`❌ "${subject}" uchun bazada bo'sh kod qolmagan!`);
            }
        } else {
            await ctx.reply(`❌ Firebase-da "${subject}" bo'limi topilmadi.`);
        }
    } catch (e) {
        console.error("Firebase xatosi:", e);
        await ctx.reply("❌ Baza bilan bog'lanishda xato yuz berdi.");
    }
    await ctx.answerCbQuery();
});

// 5. ADMIN RAD ETSA ❌
bot.action(/rej_(\d+)/, async (ctx) => {
    if (ctx.from.id != ADMIN_ID) return ctx.answerCbQuery("Siz admin emassiz!");
    
    const userId = ctx.match[1];
    try {
        await ctx.telegram.sendMessage(userId, "❌ Kechirasiz, yuborgan chekingiz tasdiqlanmadi.");
        await ctx.editMessageCaption("❌ TO'LOV RAD ETILDI.");
    } catch (e) {
        console.error("Rad etishda xato:", e);
    }
    await ctx.answerCbQuery();
});

// VERCEL INTEGRATSIYASI
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } catch (err) {
            console.error("Update xatosi:", err);
            res.status(200).send('Error');
        }
    } else {
        res.status(200).send('Bot admin nazoratida ishlamoqda... 🚀');
    }
};
