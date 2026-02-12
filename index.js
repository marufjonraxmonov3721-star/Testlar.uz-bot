const { Telegraf } = require('telegraf');

const BOT_TOKEN = '7116176622:AAGodJadxD5bmEegTB4TsjDOEng8r6s3uY4';
const CLICK_TEST_TOKEN = '398062629:TEST:999999999_F91D8F69C042267444B74CC0B3C747757EB0E065'; // Skrinshotingizdagi token

const bot = new Telegraf(BOT_TOKEN);

// 1. To'lov xabarini yuborish
bot.command('sotib_olish', (ctx) => {
    return ctx.replyWithInvoice({
        title: 'Yakuniy Test Promo-kodi',
        description: 'Barcha fanlar uchun imtihon tayyorgarlik testlari',
        payload: 'promo_kod_payload',
        provider_token: CLICK_TEST_TOKEN,
        currency: 'UZS',
        prices: [{ label: 'Promo-kod', amount: 500000 }], // 5000.00 so'm (tiyinlarda yoziladi)
        start_parameter: 'get_promo'
    });
});

// 2. To'lovdan oldingi tekshiruv (Shart!)
bot.on('pre_checkout_query', (ctx) => ctx.answerPreCheckoutQuery(true));

// 3. To'lov muvaffaqiyatli bo'lganda avtomatik promo-kod berish
bot.on('successful_payment', async (ctx) => {
    // BU YERDA FIREBASE-DAN KODNI OLIB YUBORAMIZ
    await ctx.reply("🎉 To'lov muvaffaqiyatli! Sizning promo-kodingiz: YAKUNIY_2026_TEST");
});

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try { await bot.handleUpdate(req.body); res.status(200).send('OK'); }
        catch (e) { res.status(500).send('Error'); }
    } else { res.status(200).send('To'lov tizimi faol! 🚀'); }
};
