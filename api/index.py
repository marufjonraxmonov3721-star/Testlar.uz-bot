from flask import Flask, request
import telebot

# Botingiz tokeni
TOKEN = '8562563007:AAGmU2nPXKKQ3HhnymKzPve53WJGYXAp3y4' 
bot = telebot.TeleBot(TOKEN, threaded=False)
app = Flask(__name__)

# Ilovalar manzillari (Siz bergan oxirgi manzillar)
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
    
    # 1. ESKI MENYUNI MAJBURIY O'CHIRISH (Bu muhim!)
    bot.send_message(message.chat.id, "Tizim yangilanmoqda...", reply_markup=telebot.types.ReplyKeyboardRemove())
    
    # 2. YANGI 2 TA TUGMALI MENYUNI YARATISH
    markup = telebot.types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    
    btn_test = telebot.types.KeyboardButton("📚 Testlar", web_app=telebot.types.WebAppInfo(url=TEST_APP_URL))
    btn_turnir = telebot.types.KeyboardButton("🏆 Turnirlar", web_app=telebot.types.WebAppInfo(url=TURNIR_APP_URL))
    
    markup.add(btn_test, btn_turnir)
    
    # 3. YANGI MENYU BILAN XABAR YUBORISH
    bot.send_message(
        message.chat.id, 
        f"Assalomu alaykum, hurmatli {name}! 😊\n\n"
        "Yangi menyuga xush kelibsiz! Marhamat, bo'limni tanlang:",
        reply_markup=markup,
        parse_mode="Markdown"
    )

@app.route('/')
def index():
    return "Bot ishlamoqda..."
