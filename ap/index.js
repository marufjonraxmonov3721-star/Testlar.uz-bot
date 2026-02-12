const { Telegraf, Markup } = require("telegraf");
const axios = require("axios");

// ====== KONFIG ======
const BOT_TOKEN = "7116176622:AAGodJadxD5bmEegTB4TsjDOEng8r6s3uY4";
const ADMIN_ID = 7385372033;
const FIREBASE_URL = "https://gen-lang-client-0228947349-default-rtdb.firebaseio.com/promos";
// ====================

const bot = new Telegraf(BOT_TOKEN);



// ================= START =================
bot.start((ctx) => {
  ctx.reply("Assalomu alaykum aka 🚀\nChek rasmini yuboring.");
});



// ================= PHOTO =================
bot.on("photo", async (ctx) => {
  try {
    const photoId = ctx.message.photo.at(-1).file_id;

    await ctx.reply(
      "Qaysi fan uchun to'lov?",
      Markup.inlineKeyboard([
        [Markup.button.callback("Dinshunoslik", `sub_dinshunoslik_${photoId}`)],
        [Markup.button.callback("Fizika", `sub_fizika_${photoId}`)],
        [Markup.button.callback("Matematika", `sub_matematika_${photoId}`)],
        [Markup.button.callback("AKT", `sub_akt_${photoId}`)],
        [Markup.button.callback("Yo'nalish", `sub_yonalish_${photoId}`)],
      ])
    );
  } catch (e) {
    console.log(e);
  }
});



// ================= FAN TANLASH =================
bot.action(/sub_(.+)_(.+)/, async (ctx) => {
  const subject = ctx.match[1];
  const photoId = ctx.match[2];
  const userId = ctx.from.id;

  await ctx.editMessageText("Admin tasdiqlashini kuting ⏳");

  await ctx.telegram.sendPhoto(ADMIN_ID, photoId, {
    caption:
      `🆕 YANGI TO'LOV\n` +
      `👤 ${ctx.from.first_name}\n` +
      `📚 ${subject}\n` +
      `🆔 ${userId}`,
    ...Markup.inlineKeyboard([
      [
        Markup.button.callback("Tasdiqlash ✅", `ok_${userId}_${subject}`),
        Markup.button.callback("Rad ❌", `no_${userId}`),
      ],
    ]),
  });
});



// ================= TASDIQLASH =================
bot.action(/ok_(\d+)_(.+)/, async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  const userId = ctx.match[1];
  const subject = ctx.match[2];

  try {
    const res = await axios.get(`${FIREBASE_URL}/${subject}.json`);
    const promos = res.data;

    if (!promos) return ctx.reply("Kod topilmadi ❌");

    const code = Object.keys(promos).find((k) => promos[k] === false);

    if (!code) return ctx.reply("Bo'sh kod qolmagan ❌");

    await axios.patch(`${FIREBASE_URL}/${subject}.json`, { [code]: true });

    await ctx.telegram.sendMessage(
      userId,
      `🎉 Tasdiqlandi!\n📚 ${subject}\n🔑 Kod: ${code}`
    );

    await ctx.editMessageCaption("✅ Yuborildi");
  } catch (e) {
    console.log(e);
  }
});



// ================= RAD =================
bot.action(/no_(\d+)/, async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  await ctx.telegram.sendMessage(ctx.match[1], "❌ Chek rad etildi");
  await ctx.editMessageCaption("❌ Rad etildi");
});



// ================= VERCEL WEBHOOK =================
module.exports = async (req, res) => {
  if (req.method === "POST") {
    await bot.handleUpdate(req.body);
  }
  res.status(200).send("ok");
};
