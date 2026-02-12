const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const BOT_TOKEN = '7116176622:AAGodJadxD5bmEegTB4TsjDOEng8r6s3uY4';
const ADMIN_ID = "7385372033"; // STRING !!!
const FIREBASE_URL = "https://gen-lang-client-0228947349-default-rtdb.firebaseio.com/promos";

const bot = new Telegraf(BOT_TOKEN);





// ================= START =================
bot.start((ctx) =>
  ctx.reply("Assalomu alaykum aka 😎\nTo'lov chekini rasm ko'rinishida yuboring.")
);





// ================= PHOTO =================
bot.on('photo', async (ctx) => {
  try {
    const photoId = ctx.message.photo.at(-1).file_id;

    await ctx.reply(
      "Qaysi fan uchun to'lov qilindi?",
      Markup.inlineKeyboard([
        [Markup.button.callback("Dinshunoslik", `select_${photoId}_dinshunoslik`)],
        [Markup.button.callback("Fizika", `select_${photoId}_fizika`)],
        [Markup.button.callback("Matematika", `select_${photoId}_oliy_matematika`)],
        [Markup.button.callback("AKT", `select_${photoId}_akt`)],
        [Markup.button.callback("Yo'nalish", `select_${photoId}_yonalish`)]
      ])
    );
  } catch (e) {
    console.log(e);
  }
});





// ================= FAN TANLASH =================
bot.action(/select_(.+)_(.+)/, async (ctx) => {
  const photoId = ctx.match[1];
  const subject = ctx.match[2];
  const userId = ctx.from.id;

  await ctx.editMessageText(`"${subject}" tanlandi. Admin tasdiqlaydi ⏳`);

  await ctx.telegram.sendPhoto(ADMIN_ID, photoId, {
    caption:
      `🔔 Yangi to'lov\n` +
      `👤 ${ctx.from.first_name}\n` +
      `📚 ${subject}\n` +
      `🆔 ${userId}`,
    ...Markup.inlineKeyboard([
      [Markup.button.callback("Tasdiqlash ✅", `approve_${userId}_${subject}`)],
      [Markup.button.callback("Rad etish ❌", `reject_${userId}`)]
    ])
  });
});





// ================= TASDIQLASH =================
bot.action(/approve_(\d+)_(.+)/, async (ctx) => {
  if (ctx.from.id.toString() !== ADMIN_ID)
    return ctx.answerCbQuery("Ruxsat yo'q");

  const userId = ctx.match[1];
  const subject = ctx.match[2];

  try {
    const res = await axios.get(`${FIREBASE_URL}/${subject}.json`);
    const promos = res.data;

    if (!promos) return ctx.reply("Kodlar topilmadi");

    const freeCode = Object.keys(promos).find(k => promos[k] === false);

    if (!freeCode) return ctx.reply("Bo'sh kod qolmagan");

    await axios.patch(`${FIREBASE_URL}/${subject}.json`, {
      [freeCode]: true
    });

    await ctx.telegram.sendMessage(
      userId,
      `🎉 Tasdiqlandi!\nFan: ${subject}\nKod: ${freeCode}`
    );

    await ctx.editMessageCaption(`✅ Yuborildi: ${freeCode}`);

  } catch (e) {
    console.log(e);
    await ctx.reply("Xatolik yuz berdi");
  }
});





// ================= RAD =================
bot.action(/reject_(\d+)/, async (ctx) => {
  if (ctx.from.id.toString() !== ADMIN_ID) return;

  await ctx.telegram.sendMessage(
    ctx.match[1],
    "❌ Chek tasdiqlanmadi"
  );

  await ctx.editMessageCaption("Rad etildi");
});





// ================= VERCEL WEBHOOK =================
module.exports = async (req, res) => {
  if (req.method === 'POST') {
    await bot.handleUpdate(req.body);
    res.status(200).send('ok');
  } else {
    res.status(200).send('Bot ishlayapti 🚀');
  }
};
