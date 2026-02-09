from flask import Flask, request
import telebot
import firebase_admin
from firebase_admin import credentials, db

# Botingiz va Firebase ma'lumotlari
TOKEN = '8562563007:AAGmU2nPXKKQ3HhnymKzPve53WJGYXAp3y4'
ADMIN_ID = 6363297750 # Maruf, bu sizning Telegram ID raqamingiz bo'lishi kerak

bot = telebot.TeleBot(TOKEN, threaded=False)
app = Flask(__name__)

# Firebase-ni tekshirib ulash (agar hali ulanmagan bo'lsa)
if not firebase_admin._apps:
    cred = credentials.Certificate("firebase-key.json") # Fayl nomi to'g'riligini tekshiring
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'SIZNING_FIREBASE_DATABASE_URL'
    })

WEB_APP_URL = 'https://davomad.vercel.app/'

@app.route('/api/index', methods=['POST'])
def webhook():
    if request.headers.get('content-type') == 'application/json':
        json_string = request.get_data().decode('utf-8')
        update = telebot.types.Update.de_json(json_string)
        bot.process_new_updates([update])
        return ''
    return 'OK', 200

# /stat buyrug'i - faqat admin uchun
@bot.message_handler(commands=['stat'])
def get_statistics(message):
    if message.from_user.id == ADMIN_ID:
        users_ref = db.reference('users') # Firebase-dagi foydalanuvchilar papkasi
        users_data = users_ref.get()
        
        if users_data:
            count = len(users_data)
            bot.send_message(message.chat.id, f"📊 **Bot statistikasi:**\n\nJami foydalanuvchilar soni: {count} nafar. ✨", parse_mode="Markdown")
        else:
            bot.send_message(message.chat.id, "Hozircha foydalanuvchilar mavjud emas. 🤔")
    else:
        bot.send_message(message.chat.id, "Kechirasiz, bu buyruq faqat bot admini uchun! ❌")

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
        "**Testlar Rasmiy** botiga xush kelibsiz!",
        reply_markup=markup,
        parse_mode="Markdown"
    )

@app.route('/')
def index():
    return "Statistika tizimi ishga tushirildi!"
