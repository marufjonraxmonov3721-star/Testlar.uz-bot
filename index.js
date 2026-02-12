const { Telegraf } = require('telegraf');

const BOT_TOKEN = '7116176622:AAGodJadxD5bmEegTB4TsjDOEng8r6s3uY4';
// BOTFATHER BERGAN CLICK TEST TOKENINI SHU YERGA QO'YING
const CLICK_TOKEN = '398062629:TEST:999999999_F91D8F69C042267444B74CC0B3C747757EB0E065';

const bot = new Telegraf(BOT_TOKEN);

// 1. START BUYRUG'I
bot.start((ctx) => {
    return ctx.reply("Assalomu alaykum! Promo-kod sotib olish uchun /sotib_olish buyrug'ini yuboring.");
});

// 2. TO'LOV INVOICE YARATISH
bot.command('sotib_olish', (ctx) => {
    return ctx.replyWithInvoice({
        title: 'Yakuniy Test Promo-kodi',
        description: 'Imtihonlarga tayyorlanish uchun maxsus kod',
        payload: 'promo_kod_01', // Ichki identifikator
        provider_token: CLICK_TOKEN,
        currency: 'UZS',
        prices: [{ label: 'Promo-kod', amount: 500000 }], // 5000 so'm (tiyinlarda)
        start_parameter: 'test-payment'
    });
});

// 3. TO'LOVDAN OLDINGI TEKSHIRUV (BU SHART!)
bot.on('pre_checkout_query', (ctx) => {
    return ctx.answerPreCheckoutQuery(true);
});

// 4. TO'LOV MUVAFFAQIYATLI BO'LGANDA
bot.on('successful_payment', async (ctx) => {
    // To'lovdan keyin promo-kodni avtomatik berish
    await ctx.reply("🎉 To'lov muvaffaqiyatli! Sizning promo-kodingiz: YAKUNIY_2026_PRO");
});

// VERCEL UCHUN EXPORT
module.exports = async (req, res) => {
    try {
        if (req.method === 'POST') {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } else {
            res.status(200).send('Bot ishlamoqda... 🚀');
        }
    } catch (err) {
        console.error("Xatolik:", err);
        res.status(200).send('Xato bo\'lsa ham OK qaytaramiz'); // Vercel crash bo'lmasligi uchun
    }
};
