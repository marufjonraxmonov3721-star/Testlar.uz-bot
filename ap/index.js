// /api/index.js

const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

// ================== KONFIGURATSIYA ==================
const BOT_TOKEN = '7116176622:AAGodJadxD5bmEegTB4TsjDOEng8r6s3uY4';
const ADMIN_ID = 7385372033;
const FIREBASE_URL = "https://gen-lang-client-0228947349-default-rtdb.firebaseio.com/promos";

const bot = new Telegraf(BOT_TOKEN);

// ================== BODY PARSER VERCEL ==================
export const config = {
  api: {
    bodyParser: true, // JSON parse qilinadi
  },
};

// ================== START ==================
bot.start((ctx) => ctx.reply(
  "Assalomu alaykum! To'lov chekini rasm ko'rinishida yuboring. 🚀"
));

// ================== FOYDALANUVCHI RASM YUBORGANDA ==================
bot.on('photo', async (ctx) => {
  try {
    const photoId = ctx.message.photo[ctx.message.photo.length - 1].file_id;

    await ctx.reply(
      "Ushbu to'lov qaysi fan uchun? Iltimos tanlang:",
      Markup.inlineKeyboard([
        [Markup.button.callback("Dinshunoslik", `select_${photoId}_dinshunoslik`)],
        [Markup.button.callback("Fizika", `select_${photoId}_fizika`)],
        [Markup.button.callback("Matematika", `select_${photoId}_oliy_matematika`)],
        [Markup.button.callback("AKT", `select_${photoId}_texnik_tizimlarda_akt`)],
        [Markup.button.callback("Yo'nalish", `select_${photoId}_yonalishga_kirish`)]
      ])
    );
  } catch (err) {
    console.error("Rasm qabul qilishda xato:", err);
  }
});

// ================== FOYDALANUVCHI FANNI TANLAGANDA ==================
bot.action(/^select_(.+)_(.+)$/, async (ctx) => {
  const photoId = ctx.match[1];
  const subject = ctx.match[2];
  const userId = ctx.from.id;

  try {
    await ctx.editMessageText(
      `Siz "${subject.replace(/_/g, ' ').toUpperCase()}" fanini tanladingiz. Admin tasdiqlashini kuting... ⏳`
    );

    await ctx.telegram.sendPhoto(ADMIN_ID, photoId, {
      caption: `🔔 YANGI TO'LOV KELDI!\n👤 Kimdan: ${ctx.from.first_name}\n📚 Fan: ${subject.replace(/_/g, ' ').toUpperCase()}\n🆔 ID: ${userId}`,
      ...Markup.inlineKeyboard([
        [Markup.button.callback("Tasdiqlash ✅", `approve_${userId}_${subject}`)],
        [Markup.button.callback("Rad etish ❌", `reject_${userId}`)]
      ])
    });

  } catch (err) {
    console.error("Fan tanlashda xato:", err);
  }
});

// ================== ADMIN TASDIQLASH ==================
bot.action(/^approve_(\d+)_(.+)$/, async (ctx) => {
  if (ctx.from.id != ADMIN_ID) return ctx.answerCbQuery("Sizda ruxsat yo'q! ❌");

  const userId = ctx.match[1];
  const subject = ctx.match[2];

  try {
    const res = await axios.get(`${FIREBASE_URL}/${subject}.json`);
    const promos = res.data;

    if (!promos) return ctx.reply(`❌ "${subject}" uchun kodlar bazada yo'q!`);

    const availableCode = Object.keys(promos).find(code => promos[code] === false);

    if (!availableCode) {
      return ctx.reply(`❌ "${subject}" uchun bo'sh kod qolmagan!`);
    }

    await axios.patch(`${FIREBASE_URL}/${subject}.json`, { [availableCode]: true });

    await ctx.telegram.sendMessage(userId,
      `🎉 To'lovingiz tasdiqlandi!\n📚 Fan: ${subject.replace(/_/g, ' ').toUpperCase()}\n🔑 Promo-kod: ${availableCode}\n\nUshbu kodni ilovada ishlating!`
    );

    await ctx.editMessageCaption(
      `✅ TASDIQLANDI\n📚 Fan: ${subject.replace(/_/g, ' ')}\n🔑 Kod: ${availableCode}\n👤 Foydalanuvchi: ID ${userId}`
    );

  } catch (err) {
    console.error("Admin tasdiqlashda xato:", err);
    await ctx.reply("❌ Bazaga ulanishda xatolik yuz berdi.");
  }
});

// ================== ADMIN RAD ETISH ==================
bot.action(/^reject_(\d+)$/, async (ctx) => {
  if (ctx.from.id != ADMIN_ID) return ctx.answerCbQuery("Ruxsat yo'q!");

  const userId = ctx.match[1];

  try {
    await ctx.telegram.sendMessage(userId, "❌ Kechirasiz, yuborgan chekingiz tasdiqlanmadi.");
    await ctx.editMessageCaption("❌ Rad etildi.");
  } catch (err) {
    console.error("Admin rad etishda xato:", err);
  }
});

// ================== VERCEL SERVERLESS ==================
module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      await bot.handleUpdate(req.body);
      return res.status(200).send('OK');
    } catch (err) {
      console.error("Bot handleUpdate xato:", err);
      return res.status(500).send('Error');
    }
  } else {
    return res.status(200).send("Bot uyg‘oq va ishlamoqda... 🚀");
  }
};
