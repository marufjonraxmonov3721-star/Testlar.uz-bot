from flask import Flask, request
import telebot

# Botingizning yangi tokeni
TOKEN = '8562563007:AAGmU2nPXKKQ3HhnymKzPve53WJGYXAp3y4' 
bot = telebot.TeleBot(TOKEN)
app = Flask(__name__)

# Ilovangizning manzili
WEB_APP_URL = 'https://davomad.vercel.app/' 

@bot.message_handler(commands=['start'])
def start(message):
    markup = telebot.types.ReplyKeyboardMarkup(resize_keyboard=True)
    item = telebot.types.KeyboardButton("🚀 Testni boshlash", web_app=telebot.types.WebAppInfo(url=WEB_APP_URL))
    markup.add(item)
    bot.send_message(message.chat.id, f"Salom {message.from_user.first_name}! Testlar.uz botiga xush kelibsiz.", reply_markup=markup)

@bot.message_handler(commands=['help'])
def help(message):
    bot.send_message(message.chat.id, "Yordam: Testni boshlash uchun pastdagi ko'k tugmani bosing.")

@app.route('/api/index', methods=['POST'])
def webhook():
    if request.headers.get('content-type') == 'application/json':
        json_string = request.get_data().decode('utf-8')
        update = telebot.types.Update.de_json(json_string)
        bot.process_new_updates([update])
        return ''
    else:
        return '403', 403

@app.route('/')
def home():
    return "Bot serveri ishlayapti..."
