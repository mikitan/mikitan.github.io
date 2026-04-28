import os
import requests
import ftplib
from io import BytesIO

# Renderの環境変数（金庫）から自動で読み込まれます
GEMINI_KEY = os.environ.get("GEMINI_API_KEY")
FC2_ID = os.environ.get("FC2_USER")
FC2_PW = os.environ.get("FC2_PASS")
FC2_SERVER = "ftp.fc2.com"

def generate_article():
    """Geminiに未来予測の記事を書かせる"""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_KEY}"
    # FC2用にHTML形式で出力させる
    prompt = "最新のITトレンドに基づいた未来予測を、読者がワクワクするようなHTML形式のブログ記事（日本語）で書いてください。<h3>などの見出しタグを使い、1000文字程度で出力してください。"
    
    res = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]})
    return res.json()['candidates'][0]['content']['parts'][0]['text']

def upload_to_fc2(content):
    """FC2のサーバーへFTPでアップロード"""
    try:
        ftp = ftplib.FTP(FC2_SERVER)
        ftp.login(user=FC2_ID, passwd=FC2_PW)
        
        # 記事をバイナリ変換
        bio = BytesIO(content.encode('utf-8'))
        
        # index.htmlとして保存
        ftp.storbinary('STOR index.html', bio)
        ftp.quit()
        print("成功：FC2ホームページを更新しました！")
    except Exception as e:
        print(f"接続エラー：{e}")

if __name__ == "__main__":
    if not GEMINI_KEY or not FC2_PW:
        print("エラー：RenderのEnvironment設定が足りません")
    else:
        article = generate_article()
        upload_to_fc2(article)
