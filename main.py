import os
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

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
    # ポート番号を環境変数から取得。なければ5000を使う。
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
