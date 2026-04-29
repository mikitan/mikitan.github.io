from flask import Flask, jsonify
import os
import requests
import ftplib
import datetime

app = Flask(__name__)

# --- 設定情報（RenderのEnvironment Variablesに設定してください） ---
GEMINI_KEY = os.environ.get("GEMINI_API_KEY")
FC2_HOST = 'ftp.fc2.com'
FC2_USER = os.environ.get("FC2_USER", "mikivaluejapan")
FC2_PASS = os.environ.get("FC2_PASS", "mio3636")
RAKUTEN_APP_ID = os.environ.get("RAKUTEN_APP_ID")
AFFILIATE_ID = os.environ.get("RAKUTEN_AFFILIATE_ID")

def generate_full_html():
    """Geminiの記事と楽天の商品を組み合わせたHTMLを作る"""
    # 1. Geminiで記事生成
    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_KEY}"
    prompt = "最新のDTM機材トレンドについて、HTML形式（h3, pタグ使用）でブログ記事を書いてください。"
    res = requests.post(gemini_url, json={"contents": [{"parts": [{"text": prompt}]}]})
    article_body = res.json()['candidates'][0]['content']['parts'][0]['text']

    # 2. 楽天APIで商品取得
    rakuten_url = f"https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?format=json&keyword=DTM&applicationId={RAKUTEN_APP_ID}&affiliateId={AFFILIATE_ID}&hits=3"
    r_res = requests.get(rakuten_url).json()
    items_html = ""
    for i in r_res.get('Items', []):
        item = i['Item']
        items_html += f'<div><img src="{item["mediumImageUrls"][0]["imageUrl"]}"><br><a href="{item["affiliateUrl"]}">{item["itemName"]}</a></div>'

    # 3. 合体
    return f"<html><body>{article_body}<hr><h2>おすすめ機材</h2>{items_html}</body></html>"

def upload_to_fc2(html_content):
    """FTPでアップロード"""
    with ftplib.FTP(FC2_HOST, FC2_USER, FC2_PASS) as ftp:
        from io import BytesIO
        bio = BytesIO(html_content.encode('utf-8'))
        ftp.storbinary('STOR index.html', bio)

@app.route('/')
def index():
    return "<h1>AI Server is Live!</h1><p>Manual Update: /update-site</p>"

@app.route('/update-site')
def handle_update():
    try:
        content = generate_full_html()
        upload_to_fc2(content)
        return jsonify({"status": "success", "message": "FC2 site updated!"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    # Renderのポートに合わせて起動
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port)
