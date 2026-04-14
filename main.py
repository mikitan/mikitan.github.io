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
import os  # 1行目あたりに追加してください

# ...（中略）...

if __name__ == "__main__":
    # サーバーから指定されたポート番号を読み取り、なければ5000を使います
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
