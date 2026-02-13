const { Telegraf } = require('telegraf');
const axios = require('axios');

// YANGI TOKENLAR
const BOT_TOKEN = '7116176622:AAHyywSzvoxdeoC4OzxZs_jRDqQdzVvOyDI';
const CLICK_TOKEN = '371317599:TEST:1770940329855';
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
        description: 'Barcha fanlar uchun imtihon tayyorgarlik testlari',
        payload: 'promo_kod_payload',
        provider_token: CLICK_TOKEN,
        currency: 'UZS',
        prices: [{ label: 'Promo-kod', amount: 500000 }], // 5000 so'm (tiyinlarda)
        start_parameter: 'get-promo'
    });
});

// 3. TO'LOVDAN OLDINGI TEKSHIRUV (Shart!)
bot.on('pre_checkout_query', (ctx) => {
    return ctx.answerPreCheckoutQuery(true).catch((err) => console.error("Checkout xatosi:", err));
});

// 4. TO'LOV MUVAFFAQIYATLI BO'LGANDA AVTOMATIK PROMO-KOD BERISH
bot.on('successful_payment', async (ctx) => {
    try {
        // Firebase-dan "fizika" bo'limidan birinchi bo'sh kodni olish
        const res = await axios.get(`${FIREBASE_URL}/fizika.json`);
        const promos = res.data;
        
        if (promos) {
            const code = Object.keys(promos).find(c => promos[code] === false);
            if (code) {
                // Kodni ishlatilgan (true) deb belgilash
                await axios.patch(`${FIREBASE_URL}/fizika.json`, { [code]: true });
                return ctx.reply(`🎉 To'lov muvaffaqiyatli! \n\n🔑 Sizning promo-kodingiz: ${code}\n\nUshbu kodni ilovada ishlating!`);
            }
        }
        await ctx.reply("🎉 To'lov qabul qilindi! Lekin bazada bo'sh kod qolmagan ekan, adminga murojaat qiling.");
    } catch (error) {
        console.error("Firebase xatosi:", error);
        await ctx.reply("🎉 To'lov muvaffaqiyatli o'tdi, lekin kodni yuborishda xatolik yuz berdi. Admin sizga yordam beradi.");
    }
});

// VERCEL SERVER QISMI
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } catch (err) {
            res.status(200).send('Error Handled');
        }
    } else {
        res.status(200).send('Bot yangi token bilan ishlamoqda... 🚀');
    }
};
