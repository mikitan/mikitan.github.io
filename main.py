from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # これがないとサイトから接続できません

@app.route('/v1/predict')
def predict():
    return jsonify({
        "status": "success",
        "prediction": {
            "signal": "Strong Buy",
            "accuracy": "94.2%",
            "next_move": "上昇トレンド継続"
        }
    })

if __name__ == "__main__":
        app.run(host='0.0.0.0', port=5000)
