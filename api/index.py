from flask import Flask, request
import telebot

TOKEN = '8562563007:AAGmU2nPXKKQ3HhnymKzPve53WJGYXAp3y4'
bot = telebot.TeleBot(TOKEN, threaded=False)
app = Flask(__name__)

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
    markup = telebot.types.ReplyKeyboardMarkup(resize_keyboard=True)
    # WEB_APP_URLni o'zingizning haqiqiy ilova manzilingizga almashtiring
    web_app = telebot.types.WebAppInfo(url="https://davomad.vercel.app/") 
    item = telebot.types.KeyboardButton("🚀 Testni boshlash", web_app=web_app)
    markup.add(item)
    bot.reply_to(message, f"Salom {message.from_user.first_name}! Testlar.uz botiga xush kelibsiz.", reply_markup=markup)

@app.route('/')
def index():
    return "Bot server is running..."
