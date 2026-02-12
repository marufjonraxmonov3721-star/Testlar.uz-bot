const axios = require('axios');

const BOT_TOKEN = '7116176622:AAGodJadxD5bmEegTB4TsjDOEng8r6s3uY4';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { message } = req.body;

        if (message && message.text === '/start') {
            const chatId = message.chat.id;
            const text = "👋 Assalomu alaykum! Bot noldan tozalandi va hozir 100% ishlamoqda. \n\n🚀 Ilovani ochish: https://t.me/Yakuniyga_tayyorlovchi_bot/start";

            try {
                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                    chat_id: chatId,
                    text: text
                });
            } catch (e) {
                console.error("Xabar yuborishda xato:", e);
            }
        }
        return res.status(200).send('OK');
    } else {
        return res.status(200).send('Bot uyg\'oq va sizni kutmoqda... 🚀');
    }
};
