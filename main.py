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



import os
import requests
import base64
from datetime import datetime

# Renderの金庫から鍵を取り出す
GEMINI_KEY = os.environ.get("GEMINI_API_KEY")
GH_TOKEN = os.environ.get("GITHUB_TOKEN")
REPO = "あなたのユーザー名/mikitan.github.io" # ←ここだけ自分の名前に書き換えてください

def generate_article():
    """Geminiに未来予測の記事を書かせる"""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_KEY}"
    prompt = "最新のITトレンドに基づいた、3ヶ月後の未来予測をMarkdown形式で詳しく書いてください。タイトルは『2026年予測：〇〇』としてください。"
    
    res = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]})
    return res.json()['candidates'][0]['content']['parts'][0]['text']

def post_to_github(content):
    """GitHubに記事を保存する"""
    now = datetime.now().strftime("%Y%m%d_%H%M")
    path = f"posts/report_{now}.md" # postsフォルダの中に保存
    url = f"https://api.github.com/repos/{REPO}/contents/{path}"
    
    headers = {"Authorization": f"token {GH_TOKEN}", "Accept": "application/vnd.github.v3+json"}
    data = {
        "message": f"Auto update {now}",
        "content": base64.b64encode(content.encode()).decode()
    }
    
    r = requests.put(url, headers=headers, json=data)
    if r.status_code == 201:
        print("成功！記事が投稿されました。")
    else:
        print(f"失敗：{r.text}")

if __name__ == "__main__":
    article = generate_article()
    post_to_github(article)






