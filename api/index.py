from flask import Flask, request
import telebot

# Botingizning tokeni
TOKEN = '8562563007:AAGmU2nPXKKQ3HhnymKzPve53WJGYXAp3y4' 
bot = telebot.TeleBot(TOKEN, threaded=False)
app = Flask(__name__)

# Ilovalarning manzillari
TEST_APP_URL = 'https://davomad.vercel.app/'  # 1-ilova (Asosiy testlar)
TURNIR_APP_URL = 'https://telegram-bot-eight-rose.vercel.app/' # 2-ilova (Turnirlar)

@app.route('/api/index', methods=['POST'])
def webhook():
    if request.headers.get('content-type') == 'application/json':
        json_string = request.get_data().decode('utf-8')
        update = telebot.types.Update.de_json(json_string)
        bot.process_new_updates([update])
        return ''
    else:
        return 'Method Not Allowed', 405

@bot.message_handler(commands=['start'])
def start(message):
    name = message.from_user.first_name
    
    # 1. Klaviatura yaratish (row_width=2 yonma-yon chiqaradi)
    markup = telebot.types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    
    # 2. Testlar ilovasi tugmasi
    web_app_test = telebot.types.WebAppInfo(url=TEST_APP_URL)
    item1 = telebot.types.KeyboardButton("📚 Testlar", web_app=web_app_test)
    
    # 3. Turnirlar ilovasi tugmasi
    web_app_turnir = telebot.types.WebAppInfo(url=TURNIR_APP_URL)
    item2 = telebot.types.KeyboardButton("🏆 Turnirlar", web_app=web_app_turnir)
    
    # 4. Tugmalarni qo'shish
    markup.add(item1, item2)
    
    bot.send_message(
        message.chat.id, 
        f"Assalomu alaykum, hurmatli {name}! 😊\n\n"
        "**Testlar Rasmiy** botiga xush kelibsiz! \n\n"
        "Kerakli bo'limni tanlang: \n"
        "📖 **Testlar** — bilimingizni tekshirish uchun.\n"
        "🏆 **Turnirlar** — sovrinli musobaqalarda qatnashish uchun.",
        reply_markup=markup,
        parse_mode="Markdown"
    )

# Startdan tashqari xabarlar uchun
@bot.message_handler(func=lambda message: True)
def echo_all(message):
    bot.reply_to(message, "Iltimos, menyudagi tugmalardan foydalaning yoki /start buyrug'ini yuboring! 😊")

@app.route('/')
def index():
    return "Bot Testlar va Turnirlar uchun tayyor!"

if __name__ == "__main__":
    app.run()
