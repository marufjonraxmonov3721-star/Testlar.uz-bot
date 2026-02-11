from flask import Flask, request
import telebot

# Botingiz tokeni
TOKEN = '8562563007:AAGmU2nPXKKQ3HhnymKzPve53WJGYXAp3y4' 
bot = telebot.TeleBot(TOKEN, threaded=False)
app = Flask(__name__)

# Ilovalar manzillari
TEST_APP_URL = 'https://davomad.vercel.app/' 
TURNIR_APP_URL = 'https://testlar-uz-bot.vercel.app/' 

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
    
    # Keshni tozalash uchun avval eski menyuni o'chirib yuboramiz
    bot.send_message(message.chat.id, "Menyu yangilanmoqda...", reply_markup=telebot.types.ReplyKeyboardRemove())
    
    # Yangi 2 ta tugmali menyu yaratish
    markup = telebot.types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    
    btn_test = telebot.types.KeyboardButton("📚 Testlar", web_app=telebot.types.WebAppInfo(url=TEST_APP_URL))
    btn_turnir = telebot.types.KeyboardButton("🏆 Turnirlar", web_app=telebot.types.WebAppInfo(url=TURNIR_APP_URL))
    
    markup.add(btn_test, btn_turnir)
    
    # Yangi menyu bilan xabar yuborish
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

@app.route('/')
def index():
    return "Bot serveri ishlamoqda!"
