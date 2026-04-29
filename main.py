import os
import requests
import ftplib
from io import BytesIO
from flask import Flask  # Flaskを追加

# Flaskアプリの初期化（Renderはこれを探しています）
app = Flask(__name__)

# 環境変数の取得
GEMINI_KEY = os.environ.get("GEMINI_API_KEY")
FC2_ID = os.environ.get("FC2_USER")
FC2_PW = os.environ.get("FC2_PASS")
FC2_SERVER = "ftp.fc2.com"

def generate_article():
    """Geminiに記事を書かせる"""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_KEY}"
    prompt = "最新のITトレンドに基づいた未来予測を、HTML形式のブログ記事（日本語）で書いてください。見出しタグを使い、1000文字程度で。"
    
    res = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]})
    return res.json()['candidates'][0]['content']['parts'][0]['text']

def upload_to_fc2(content):
    """FC2へアップロード"""
    try:
        ftp = ftplib.FTP(FC2_SERVER)
        ftp.login(user=FC2_ID, passwd=FC2_PW)
        bio = BytesIO(content.encode('utf-8'))
        ftp.storbinary('STOR index.html', bio)
        ftp.quit()
        return "成功：FC2ホームページを更新しました！"
    except Exception as e:
        return f"接続エラー：{e}"

# Renderがアクセスしてきた時に実行されるルート
@app.route('/')
def home():
    if not GEMINI_KEY or not FC2_PW:
        return "エラー：RenderのEnvironment設定が足りません", 500
    
    article = generate_article()
    result = upload_to_fc2(article)
    return f"プログラム実行結果: {result}"

if __name__ == "__main__":
    # ローカル実行用
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
