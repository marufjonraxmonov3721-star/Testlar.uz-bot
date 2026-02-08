from flask import Flask, request
import telebot

TOKEN = '8562563007:AAGmU2nPXKKQ3HhnymKzPve53WJGYXAp3y4' 
bot = telebot.TeleBot(TOKEN, threaded=False)
app = Flask(__name__)

# DIQQAT: Bu yerga Vercel-dagi TESTLAR ilovangizning haqiqiy linkini qo'ying
# Agar ilovangiz 'davomad.vercel.app' bo'lsa, shuni qoldiring. 
# Agar boshqa bo'lsa, o'shani yozing.
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
        "**Testlar.uz** rasmiy botiga xush kelibsiz! \n\n"
        "Bilimingizni sinab ko'rishga tayyormisiz? Unda pastdagi tugmani bosing va o'z cho'qqilaringizni zabt eting! 👇",
        reply_markup=markup,
        parse_mode="Markdown"
    )

@bot.message_handler(commands=['help'])
def help_command(message):
    bot.send_message(
        message.chat.id,
        "Sizga qanday yordam bera olaman? ✨\n\n"
        "🔹 **Testni boshlash**: Pastdagi ko'k tugmani bosing.\n"
        "🔹 **Muammo bo'lsa**: Bizga xabar qoldiring.\n\n"
        "O'qishlaringizda omad yor bo'lsin!",
        parse_mode="Markdown"
    )

@app.route('/')
def index():
    return "Bot serveri ishlayapti!"
