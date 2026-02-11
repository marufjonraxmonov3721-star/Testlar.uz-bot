
from flask import Flask, request
import telebot

# Botingizning tokeni
TOKEN = '8562563007:AAGmU2nPXKKQ3HhnymKzPve53WJGYXAp3y4' 
bot = telebot.TeleBot(TOKEN, threaded=False)
app = Flask(__name__)

# Yangilangan ilova manzillari
TEST_APP_URL = 'https://davomad.vercel.app/' 
TURNIR_APP_URL = 'https://testlar-uz-bot.vercel.app/' # Yangi manzil shu yerga qo'yildi

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
    
    # Klaviatura (Tugmalarni yonma-yon chiqarish uchun)
    markup = telebot.types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    
    # 1. Testlar tugmasi (Asosiy ilova)
    web_app_test = telebot.types.WebAppInfo(url=TEST_APP_URL)
    btn_test = telebot.types.KeyboardButton("📚 Testlar", web_app=web_app_test)
    
    # 2. Turnirlar tugmasi (Yangi ilova)
    web_app_turnir = telebot.types.WebAppInfo(url=TURNIR_APP_URL)
    btn_turnir = telebot.types.KeyboardButton("🏆 Turnirlar", web_app=web_app_turnir)
    
    # Tugmalarni menyuga qo'shish
    markup.add(btn_test, btn_turnir)
    
    bot.send_message(
        message.chat.id, 
        f"Assalomu alaykum, hurmatli {name}! 😊\n\n"
        "**Testlar Rasmiy** botining yangilangan menyusiga xush kelibsiz! \n\n"
        "Quyidagi bo'limlardan birini tanlang: \n\n"
        "📖 **Testlar** — bilimingizni oshirish uchun.\n"
        "🏆 **Turnirlar** — sovrinli musobaqalarda qatnashish uchun.",
        reply_markup=markup,
        parse_mode="Markdown"
    )

@bot.message_handler(func=lambda message: True)
def echo_all(message):
    bot.reply_to(message, "Iltimos, pastdagi menyu tugmalaridan foydalaning! 😊")

@app.route('/')
def index():
    return "Bot yangi manzillar bilan ishlamoqda!"
