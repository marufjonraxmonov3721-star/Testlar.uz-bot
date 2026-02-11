from flask import Flask, request
import telebot

# Botingiz tokeni
TOKEN = '8562563007:AAGmU2nPXKKQ3HhnymKzPve53WJGYXAp3y4' 
bot = telebot.TeleBot(TOKEN, threaded=False)
app = Flask(__name__)

# Ilovalar manzillari
TEST_URL = 'https://davomad.vercel.app/'
TURNIR_URL = 'https://telegram-bot-eight-rose.vercel.app/'

@app.route('/api/index', methods=['POST'])
def webhook():
    if request.headers.get('content-type') == 'application/json':
        json_string = request.get_data().decode('utf-8')
        update = telebot.types.Update.de_json(json_string)
        bot.process_new_updates([update])
        return ''
    return 'OK', 200

@bot.message_handler(commands=['start'])
def start(message):
    # ESKI TUGMALARNI TOZALASH
    bot.send_message(message.chat.id, "Menyu yuklanmoqda...", reply_markup=telebot.types.ReplyKeyboardRemove())
    
    # YANGI 2 TA TUGMALI KLAVIATURA
    markup = telebot.types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    btn1 = telebot.types.KeyboardButton("📚 Testlar", web_app=telebot.types.WebAppInfo(url=TEST_URL))
    btn2 = telebot.types.KeyboardButton("🏆 Turnirlar", web_app=telebot.types.WebAppInfo(url=TURNIR_URL))
    markup.add(btn1, btn2)
    
    bot.send_message(
        message.chat.id, 
        f"Assalomu alaykum, hurmatli {message.from_user.first_name}! 😊\n\n**Testlar Rasmiy** botiga xush kelibsiz! Marhamat, bo'limni tanlang:",
        reply_markup=markup,
        parse_mode="Markdown"
    )

@app.route('/')
def index():
    return "Bot serveri ishlamoqda!"
