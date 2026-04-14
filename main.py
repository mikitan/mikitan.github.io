from flask import Flask, render_template
import os

app = Flask(__name__)

@app.route('/')
def index():
    # templatesフォルダ内のindex.htmlを表示します
    return render_template('index.html')

if __name__ == "__main__":
    # ポート番号は環境変数から取得（デプロイ先に対応するため）
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)