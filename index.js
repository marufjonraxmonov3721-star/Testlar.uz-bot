const { Telegraf } = require('telegraf');
const axios = require('axios');

const BOT_TOKEN = '7116176622:AAGodJadxD5bmEegTB4TsjDOEng8r6s3uY4';
const CLICK_TOKEN = '398062629:TEST:999999999_F91D8F69C042267444B74CC0B3C747757EB0E065';
const FIREBASE_URL = "https://gen-lang-client-0228947349-default-rtdb.firebaseio.com/promos";

const bot = new Telegraf(BOT_TOKEN);

// 1. START BUYRUG'I
bot.start((ctx) => {
    return ctx.reply("Assalomu alaykum! Yakuniy testlar uchun promo-kod sotib olishingiz mumkin.\n\nSotib olish uchun /sotib_olish buyrug'ini yuboring. 🚀");
});

// 2. TO'LOV INVOICE (Sotib olish tugmasi)
bot.command('sotib_olish', (ctx) => {
    return ctx.replyWithInvoice({
        title: 'Test Promo-kodi',
        description: 'Imtihon tayyorgarligi uchun 1 oylik promo-kod',
        payload: 'test_promo_payment',
        provider_token: CLICK_TOKEN,
        currency: 'UZS',
        prices: [{ label: 'Promo-kod narxi', amount: 500000 }], // 5000 so'm
        start_parameter: 'get-test-access'
    });
});

// 3. TO'LOVDAN OLDINGI TASDIQ (500 xatoligini oldini oladi)
bot.on('pre_checkout_query', (ctx) => {
    return ctx.answerPreCheckoutQuery(true).catch((err) => console.error("Checkout xatosi:", err));
});

// 4. TO'LOV MUVAFFAQIYATLI BO'LGANDA (Avtomatik kod berish)
bot.on('successful_payment', async (ctx) => {
    try {
        // Firebase bazasidan birinchi bo'sh kodni olish
        const res = await axios.get(`${FIREBASE_URL}/fizika.json`); // Misol uchun fizika fani
        const promos = res.data;
        
        if (promos) {
            const code = Object.keys(promos).find(c => promos[c] === false);
            if (code) {
                // Kodni ishlatilgan deb belgilash
                await axios.patch(`${FIREBASE_URL}/fizika.json`, { [code]: true });
                return ctx.reply(`🎉 To'lov muvaffaqiyatli! \n\n🔑 Sizning promo-kodingiz: ${code}\n\nUshbu kodni ilovada ishlating.`);
            }
        }
        await ctx.reply("🎉 To'lov qabul qilindi! Lekin bazada bo'sh kod qolmagan ekan, adminga murojaat qiling.");
    } catch (error) {
        console.error("Firebase yoki To'lov xatosi:", error);
        await ctx.reply("🎉 To'lov muvaffaqiyatli o'tdi, lekin kodni yuborishda xatolik yuz berdi. Admin sizga kodni qo'lda yuboradi.");
    }
});

// VERCEL SERVER QISMI
module.exports = async (req, res) => {
    try {
        if (req.method === 'POST') {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } else {
            res.status(200).send('To\'lov tizimi faol! 🚀');
        }
    } catch (err) {
        console.error("Vercel Error:", err);
        res.status(200).send('Error Handled'); // Crash bo'lmasligi uchun har doim OK qaytaramiz
    }
};
