import requests
import datetime
import os

# --- [設定] 自分の情報に書き換えてください ---
RAKUTEN_APP_ID = 'あなたのアプリID'      # 楽天ウェブサービスで取得
AFFILIATE_ID = 'あなたのアフィリエイトID'  # 楽天アフィリエイトID
SEARCH_KEYWORD = 'DTM セール'           # 稼ぎたいキーワード（例: DTM, ガジェット, 楽器）

def get_rakuten_items():
    """楽天APIから最新の商品データを取得する"""
    url = "https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706"
    params = {
        'format': 'json',
        'keyword': SEARCH_KEYWORD,
        'applicationId': RAKUTEN_APP_ID,
        'affiliateId': AFFILIATE_ID,
        'hits': 6, # 表示する商品数
        'sort': '-updateTimestamp', # 新着順
        'imageFlag': 1
    }
    try:
        res = requests.get(url, params=params)
        if res.status_code == 200:
            return res.json().get('Items', [])
    except Exception as e:
        print(f"Error fetching data: {e}")
    return []

def generate_html(items):
    """取得したデータを元にHTMLを生成する"""
    now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M')
    
    # 商品リストのHTML組み立て
    item_html = ""
    for i in items:
        item = i['Item']
        name = item['itemName'][:50] + "..." # 名前が長すぎるのでカット
        img = item['mediumImageUrls'][0]['imageUrl']
        url = item['affiliateUrl']
        price = "{:,}".format(item['itemPrice']) # カンマ区切り

        item_html += f'''
        <div class="card">
            <img src="{img}" alt="{name}">
            <div class="card-body">
                <h3 class="title">{name}</h3>
                <p class="price">¥{price}</p>
                <a href="{url}" target="_blank" class="btn">詳細を見る</a>
            </div>
        </div>'''

    # 全体のHTML構造（デザイン調整済み）
    html_template = f'''
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Micvictory - Auto Update Store</title>
        <style>
            body {{ font-family: 'Helvetica Neue', Arial, sans-serif; background: #1a1a1a; color: #fff; margin: 0; padding: 20px; }}
            .container {{ max-width: 900px; margin: auto; text-align: center; }}
            .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 30px; }}
            .card {{ background: #2a2a2a; border-radius: 12px; overflow: hidden; transition: 0.3s; border: 1px solid #333; }}
            .card:hover {{ transform: translateY(-5px); border-color: #ff3366; }}
            .card img {{ width: 100%; height: 200px; object-fit: cover; background: #fff; }}
            .card-body {{ padding: 15px; }}
            .title {{ font-size: 14px; height: 40px; overflow: hidden; margin-bottom: 10px; }}
            .price {{ color: #ff3366; font-size: 18px; font-weight: bold; margin-bottom: 15px; }}
            .btn {{ background: #ff3366; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-block; font-size: 14px; }}
            .footer {{ margin-top: 50px; font-size: 12px; color: #666; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Micvictory <span style="color:#ff3366;">Selection</span></h1>
            <p>24時間自動更新中 - 最新の{SEARCH_KEYWORD}情報</p>
            <div class="grid">
                {item_html}
            </div>
            <div class="footer">
                <p>最終更新日時: {now}</p>
                <p>© Micvictory Auto-System with Render & GitHub</p>
            </div>
        </div>
    </body>
    </html>
    '''
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html_template)

if __name__ == "__main__":
    items = get_rakuten_items()
    if items:
        generate_html(items)
        print("Successfully updated index.html")
    else:
        print("No items found.")
