from flask import Flask, request
import telebot

# Botingizning tokeni
TOKEN = '8562563007:AAGmU2nPXKKQ3HhnymKzPve53WJGYXAp3y4' 
bot = telebot.TeleBot(TOKEN, threaded=False)
app = Flask(__name__)

# To'g'ri ilova manzili
WEB_APP_URL = 'https://davomad.vercel.app/' 

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
    markup = telebot.types.ReplyKeyboardMarkup(resize_keyboard=True)
    web_app = telebot.types.WebAppInfo(url=WEB_APP_URL)
    item = telebot.types.KeyboardButton("🚀 Testni boshlash", web_app=web_app)
    markup.add(item)
    
    bot.send_message(
        message.chat.id, 
        f"Assalomu alaykum, hurmatli {name}! 😊\n\n"
        "**Testlar Rasmiy** botiga xush kelibsiz! \n\n"
        "Bilimingizni sinab ko'rish va yangi natijalarga erishish uchun tayyormisiz? "
        "Unda pastdagi tugmani bosing va ilovaga kiring! 👇",
        reply_markup=markup,
        parse_mode="Markdown"
    )

# Har qanday boshqa xabar yozilsa ham faqat start haqida eslatadi
@bot.message_handler(func=lambda message: True)
def echo_all(message):
    bot.reply_to(message, "Iltimos, testni boshlash uchun /start buyrug'ini yuboring yoki pastdagi tugmani bosing! 😊")

@app.route('/')
def index():
    return "Bot serveri faqat start uchun sozlandi!"
