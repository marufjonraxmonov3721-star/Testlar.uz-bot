from flask import Flask, request
import telebot

# Botingizning tokeni
TOKEN = '8562563007:AAGmU2nPXKKQ3HhnymKzPve53WJGYXAp3y4' 
bot = telebot.TeleBot(TOKEN, threaded=False)
app = Flask(__name__)

# Ilovalarning manzillari
TEST_APP_URL = 'https://davomad.vercel.app/'  # 1-ilova (Asosiy testlar)
TURNIR_APP_URL = 'https://telegram-bot-eight-rose.vercel.app/' # 2-ilova (Turnirlar)

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
    
    # Klaviatura yaratish
    markup = telebot.types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    
    # Testlar ilovasi uchun ma'lumot
    web_app_test = telebot.types.WebAppInfo(url=TEST_APP_URL)
    btn_test = telebot.types.KeyboardButton("📚 Testlar", web_app=web_app_test)
    
    # Turnirlar ilovasi uchun ma'lumot
    web_app_turnir = telebot.types.WebAppInfo(url=TURNIR_APP_URL)
    btn_turnir = telebot.types.KeyboardButton("🏆 Turnirlar", web_app=web_app_turnir)
    
    # Tugmalarni qo'shish (bir qatorda ikkita tugma)
    markup.add(btn_test, btn_turnir)
    
    bot.send_message(
        message.chat.id, 
        f"Assalomu alaykum, hurmatli {name}! 😊\n\n"
        "**Testlar Rasmiy** botiga xush kelibsiz! \n\n"
        "Quyidagi menyudan foydalanib o'z yo'nalishingizni tanlang:\n\n"
        "📖 **Testlar** — bilimingizni oshirish uchun.\n"
        "🏆 **Turnirlar** — boshqalar bilan bellashish va sovrin yutish uchun.",
        reply_markup=markup,
        parse_mode="Markdown"
    )

# Har qanday boshqa xabar yozilsa ham menyuni qayta ko'rsatishga yordam beradi
@bot.message_handler(func=lambda message: True)
def echo_all(message):
    bot.reply_to(message, "Iltimos, ilovalardan foydalanish uchun pastdagi tugmalardan birini tanlang! 😊")

@app.route('/')
def index():
    return "Bot serveri Testlar va Turnirlar uchun sozlandi!"

# Vercel uchun serverni ishga tushirish qismi (kerak bo'lsa)
if __name__ == "__main__":
    app.run()
