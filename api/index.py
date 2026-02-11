from flask import Flask, request
import telebot

# Botingizning tokeni
TOKEN = '8562563007:AAGmU2nPXKKQ3HhnymKzPve53WJGYXAp3y4' 
bot = telebot.TeleBot(TOKEN, threaded=False)
app = Flask(__name__)

# Ilovalarning manzillari
TEST_APP_URL = 'https://davomad.vercel.app/' 
TURNIR_APP_URL = 'https://telegram-bot-eight-rose.vercel.app/' 

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
    
    # Klaviatura yaratish
    markup = telebot.types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    
    # 1. Testlar tugmasi
    web_app_test = telebot.types.WebAppInfo(url=TEST_APP_URL)
    btn_test = telebot.types.KeyboardButton("📚 Testlar", web_app=web_app_test)
    
    # 2. Turnirlar tugmasi
    web_app_turnir = telebot.types.WebAppInfo(url=TURNIR_APP_URL)
    btn_turnir = telebot.types.KeyboardButton("🏆 Turnirlar", web_app=web_app_turnir)
    
    # Tugmalarni qo'shish
    markup.add(btn_test, btn_turnir)
    
    bot.send_message(
        message.chat.id, 
        f"Assalomu alaykum, hurmatli {name}! 😊\n\n"
        "**Testlar Rasmiy** botiga xush kelibsiz! \n\n"
        "Bilimingizni sinab ko'rish uchun **Testlar** bo'limiga, sovrinli o'yinlar uchun **Turnirlar** bo'limiga kiring! 👇",
        reply_markup=markup,
        parse_mode="Markdown"
    )

@bot.message_handler(func=lambda message: True)
def echo_all(message):
    bot.reply_to(message, "Iltimos, test yoki turnirni boshlash uchun menyudagi tugmalardan foydalaning! 😊")

@app.route('/')
def index():
    return "Bot ishlamoqda..."
