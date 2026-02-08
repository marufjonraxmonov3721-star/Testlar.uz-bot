from flask import Flask, request
import telebot

# Botingizning tokeni
TOKEN = '8562563007:AAGmU2nPXKKQ3HhnymKzPve53WJGYXAp3y4' 
bot = telebot.TeleBot(TOKEN, threaded=False)
app = Flask(__name__)

# Ilovangiz manzili
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

# /start buyrug'i uchun chiroyli javob
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
        "**Testlar.uz** rasmiy botiga xush kelibsiz! Sizni ko'rib turganimizdan juda xursandmiz. \n\n"
        "Bu yerda siz o'z bilimingizni sinab ko'rishingiz va yangi cho'qqilarni zabt etishingiz mumkin. "
        "Testni boshlashga tayyormisiz? Unda pastdagi tugmani bosing! 👇",
        reply_markup=markup,
        parse_mode="Markdown"
    )

# /help buyrug'i uchun yordam xabari
@bot.message_handler(commands=['help'])
def help_command(message):
    bot.send_message(
        message.chat.id,
        "Sizga qanday yordam bera olaman? ✨\n\n"
        "🔹 **Testni boshlash**: Pastdagi ko'k tugmani bosing.\n"
        "🔹 **Reyting**: Ilova ichida o'z o'rningizni ko'rishingiz mumkin.\n"
        "🔹 **Muammo bo'lsa**: Bizga xabar qoldiring, albatta yordam beramiz.\n\n"
        "O'qishlaringizda omad yor bo'lsin! 📚",
        parse_mode="Markdown"
    )

# /profile buyrug'i uchun javob
@bot.message_handler(commands=['profile'])
def profile(message):
    name = message.from_user.first_name
    bot.send_message(
        message.chat.id,
        f"Hurmatli {name}, sizning shaxsiy natijalaringizni ko'rish uchun "
        "ilovamizga kiring. U yerda siz yechgan testlar va to'plagan ballaringiz "
        "juda chiroyli tartibda saqlanmoqda! 🏆",
        parse_mode="Markdown"
    )

# Har qanday boshqa matn yozilsa
@bot.message_handler(func=lambda message: True)
def echo_all(message):
    bot.reply_to(
        message, 
        "Sizning xabaringizni qabul qildim! 📝 \n"
        "Hozircha faqat menyudagi buyruqlar orqali ishlay olaman. "
        "Keling, yaxshisi test yechib bilimimizni oshiramiz! 😊"
    )

@app.route('/')
def index():
    return "Bot serveri a'lo darajada ishlayapti!"
