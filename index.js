const { Telegraf, Markup } = require('telegraf');

const BOT_TOKEN = '7116176622:AAHyywSzvoxdeoC4OzxZs_jRDqQdzVvOyDI';
const bot = new Telegraf(BOT_TOKEN);

// 1. ASOSIY MENYU
const mainKeyboard = Markup.keyboard([
    ['📚 Ilova haqida ma\'lumot', '🚀 Ilovani ochish'],
    ['💳 To\'lov qilish tartibi', '🔑 Promo-kod olish'],
    ['👨‍💻 Admin bilan bog\'lanish']
]).resize();

// START BUYRUG'I
bot.start((ctx) => {
    return ctx.reply(
        `👋 Assalomu alaykum, ${ctx.from.first_name}!\n\n"Yakuniyga tayyorlovchi" botiga xush kelibsiz. Men sizga ilovadan foydalanish bo'yicha yo'riqnoma beraman.`,
        mainKeyboard
    );
});

// ILOVA HAQIDA
bot.hears('📚 Ilova haqida ma\'lumot', (ctx) => {
    ctx.reply(
        `📖 **Ilova haqida:**\n\nUshbu ilova talabalar uchun yakuniy nazorat testlariga tayyorlanishda yordam beradi. \n\n✅ **Imkoniyatlar:**\n- Fanlar bo'yicha mashq qilish\n- 35 talik imtihon rejimi (35 daqiqa)\n- Xatolar ustida ishlash bo'limi\n- Kunduzgi va tungi mavzular.`
    );
});

// TO'LOV TARTIBI
bot.hears('💳 To\'lov qilish tartibi', (ctx) => {
    ctx.reply(
        `💳 **To'lov qilish tartibi:**\n\n1. Ilovada fanni tanlang.\n2. "Fanni ochish" tugmasini bosing.\n3. Berilgan karta raqamiga (4073 4200 6816 5541) 10 000 so'm o'tkazing.\n4. To'lov chekini @raxmonov_maruf profiliga yuboring.`
    );
});

// PROMO KOD OLISH
bot.hears('🔑 Promo-kod olish', (ctx) => {
    ctx.reply(
        `🔑 **Promo-kod haqida:**\n\nPromo-kod to'lov tasdiqlangandan so'ng admin tomonidan beriladi. Ushbu kodni ilovadagi "PROMO KOD" maydoniga kiritish orqali fanni to'liq ochishingiz mumkin.`
    );
});

// ILOVANI OCHISH
bot.hears('🚀 Ilovani ochish', (ctx) => {
    ctx.reply(
        `🚀 Ilovani ochish uchun quyidagi tugmani bosing:`,
        Markup.inlineKeyboard([
            [Markup.button.url("🌐 Ilovaga kirish", "https://testlar-uz.vercel.app/")]
        ])
    );
});

// ADMIN BILAN BOG'LANISH
bot.hears('👨‍💻 Admin bilan bog\'lanish', (ctx) => {
    ctx.reply(`👨‍💻 Savollar va takliflar uchun: @raxmonov_maruf`);
});

// VERCEL INTEGRATSIYASI
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).send('OK');
        } catch (e) { res.status(200).send('Error'); }
    } else {
        res.status(200).send('Ma\'lumot beruvchi bot faol...');
    }
};
