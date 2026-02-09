from flask import Flask
app = Flask(__name__)

@app.route('/api/ping')
def ping():
    return "Pong! Bot uyg'oq.", 200
