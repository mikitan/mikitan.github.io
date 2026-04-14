from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route('/')
def index():
    return "AI Server is Live!"

@app.route('/v1/predict')
def predict():
    data = {
        "status": "success",
        "prediction": "Bullish",
        "accuracy": "89.4%"
    }
    return jsonify(data)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
