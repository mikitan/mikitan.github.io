const comp = ctx.createDynamicsCompressor();
comp.threshold.value = -24;
comp.knee.value = 30;
comp.ratio.value = 12;
comp.connect(ctx.destination);
// 各音源を comp に接続するように変更

async function analyzeNewsAndGenerateStrategy() {
    const rawNews = await fetchLatestRSS(); // 日経/ロイターRSS取得
    
    // AI戦略生成プロンプト（AIに指示する内容）
    const strategyPersona = "あなたは冷徹な戦略家です。以下のニュースを分析し、2026年の資産防衛の観点から、1行で「具体的なアクション」を指示せよ。";
    
    rawNews.forEach(news => {
        const strategyComment = generateAIComment(news.title, strategyPersona);
        displayToDashboard(news, strategyComment);
    });
}

function displayToDashboard(news, comment) {
    const stream = document.getElementById('news-stream');
    stream.innerHTML += `
        <div class="strategy-card">
            <h4>${news.title}</h4>
            <p class="strategy-comment" style="color:#d4af37; border-left:3px solid #d4af37; padding-left:10px;">
                戦略：${comment}
            </p>
        </div>
    `;
}


// 自動投稿トリガー関数
function triggerSNS(videoUrl, caption) {
    const webhookUrl = "YOUR_WEBHOOK_URL_HERE"; // Make/ZapierのURL
    fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl, text: caption })
    }).then(() => alert("SNSへの配信を予約しました"));
}


// 改善案：ボタン押下後に次のアクションをポップアップ表示
function applyFilter(filter) {
    ctx.filter = filter;
    ctx.drawImage(img, 0, 0);
    // 処理完了後にアクションを促す
    setTimeout(() => {
        alert("加工完了！この戦略を保存して次のフェーズへ進みますか？");
        // ここに戦略保存用APIへのリンクを挿入
    }, 500);
}



// JavaScript: フロントプレビューと状態管理
const handleGenerate = async (prompt) => {
    const data = await fetch('/generate-all', { method: 'POST', body: JSON.stringify({ prompt }) });
    // プレビューを一括表示（各AIの生成結果をタイル状に並べる）
    renderPreviews(data); 
    updateDashboard(data); // 資産統計を更新
};

// プロンプト生成ブリッジの概念コード
const generateContent = async (prompt, tools) => {
  // 重複入力の排除：1つのプロンプトを各APIに一括送信
  const results = await Promise.all(tools.map(tool => apiCall(tool, prompt)));
  updateDashboard(results); // ダッシュボードへ自動反映
  saveToDatabase(results);   // 自動保存
};


/**
 * 1. ID管理と生成フローを統合
 */
async function handleGenerate(service) {
    const prompt = document.getElementById('promptInput').value;
    const idField = document.getElementById('idField'); // 自動生成IDを表示する場所
    const statusText = document.getElementById('statusText'); // 状態表示エリア

    if (!prompt) return alert("プロンプトを入力してください");

    try {
        // APIリクエスト送信
        const result = await requestGeneration(service, prompt);
        
        // 【重要】ID欄に自動入力
        idField.value = result.id;
        statusText.innerText = "生成中...（待機中）";

        // ポーリング開始
        const videoUrl = await pollStatus(service, result.id);

        // 生成完了後の処理
        statusText.innerText = "生成完了！";
        
        // 【重要】履歴への自動追加
        addVideoToHistoryList(prompt, videoUrl);

    } catch (err) {
        statusText.innerText = "エラー: " + err.message;
    }
}

/**
 * 2. 履歴リスト（ul要素）に動的追加する関数
 */
function addVideoToHistoryList(prompt, videoUrl) {
    const historyList = document.getElementById('historyList'); // 履歴リストのID
    const listItem = document.createElement('li');
    
    // リストのデザインを現在のUIに合わせる
    listItem.className = 'history-item';
    listItem.innerHTML = `
        <div class="history-content">
            <span class="prompt-text">${prompt.substring(0, 15)}...</span>
            <a href="${videoUrl}" target="_blank" class="play-btn">▶ 再生</a>
        </div>
    `;
    
    // リストの先頭に追加
    historyList.prepend(listItem);
}

localStorage.setItem('videoHistory', JSON.stringify(currentHistoryArray));

// ...（前略）
// 4. 完成した動画を表示した直後に、履歴に追加する
statusText.innerText = "生成完了！";
videoArea.innerHTML = `<video src="${videoUrl}" controls autoplay width="100%"></video>`;

// ★ここを追加
addToHistory(prompt, videoUrl); 
// ...（後略）
localStorage.setItem('videoHistory', JSON.stringify(currentHistoryArray));
/**
 * 履歴リストに新しい動画を追加する関数
 */
function addToHistory(prompt, videoUrl) {
    const historyList = document.getElementById('historyList'); // 履歴を表示する<ul>タグ
    
    // 履歴アイテムを作成
    const listItem = document.createElement('li');
    listItem.innerHTML = `
        <span>${prompt.substring(0, 20)}...</span>
        <a href="${videoUrl}" target="_blank">動画を見る</a>
        <button onclick="downloadVideo('${videoUrl}')">DL</button>
    `;
    
    // リストの先頭に追加（新しいものが一番上にくるように）
    historyList.prepend(listItem);
}

/**
 * 動画生成の一連の流れを管理するメイン関数
 */
async function handleGenerate(service) {
    const prompt = document.getElementById('promptInput').value;
    const idField = document.getElementById('idField');
    const statusText = document.getElementById('statusText');
    const videoArea = document.getElementById('videoDisplayArea');

    if (!prompt) return alert("プロンプトを入力してください");

    // 1. リクエスト送信
    statusText.innerText = "リクエスト送信中...";
    const result = await requestGeneration(service, prompt);
    
    // 2. IDの自動書き込み
    idField.value = result.id;
    statusText.innerText = "生成中...（完了まで自動で待機します）";

    // 3. ポーリング処理（完了するまで繰り返す）
    try {
        const videoUrl = await pollStatus(service, result.id);
        
        // 4. 完成した動画を表示
        statusText.innerText = "生成完了！";
        videoArea.innerHTML = `<video src="${videoUrl}" controls autoplay width="100%"></video>`;
    } catch (error) {
        statusText.innerText = "エラーが発生しました: " + error.message;
    }
}

/**
 * 定期的に状態を確認するポーリング関数
 */
async function pollStatus(service, id) {
    return new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
            const status = await checkStatusFromApi(service, id);
            if (status.state === 'completed') {
                clearInterval(interval);
                resolve(status.video_url);
            } else if (status.state === 'failed') {
                clearInterval(interval);
                reject(new Error("生成が失敗しました"));
            }
        }, 5000); // 5秒ごとに確認
    });
}



/**
 * 完璧な動画生成フローを管理するスクリプト
 */

// 1. 生成ボタンのイベントリスナー設定
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('lumaBtn').addEventListener('click', () => handleGenerate('luma'));
    document.getElementById('runwayBtn').addEventListener('click', () => handleGenerate('runway'));
});

async function handleGenerate(service) {
    const prompt = document.querySelector('textarea').value;
    const idField = document.getElementById('idField');
    const statusText = document.getElementById('statusText');
    const resultArea = document.getElementById('resultArea');

    if (!prompt) return alert("プロンプトを入力してください");

    try {
        statusText.innerText = "リクエスト送信中...";
        
        // APIリクエスト実行
        const result = await triggerVideoGeneration(service, prompt, "YOUR_API_KEY");
        
        // IDを自動セット
        idField.value = result.id;
        statusText.innerText = "動画生成中...完了までお待ちください";

        // ポーリング（完了待ち）
        const videoUrl = await pollVideoStatus(service, result.id, "YOUR_API_KEY");

        // 動画を表示
        statusText.innerText = "完成！";
        resultArea.innerHTML = `<video src="${videoUrl}" controls width="100%"></video>`;
        
    } catch (err) {
        statusText.innerText = "エラー: " + err.message;
        console.error(err);
    }
}

/**
 * 動画の生成状況を定期的に確認する関数
 */
async function pollVideoStatus(service, id, apiKey) {
    return new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
            const data = await checkStatusFromApi(service, id, apiKey);
            if (data.state === 'completed') {
                clearInterval(interval);
                resolve(data.video_url);
            } else if (data.state === 'failed') {
                clearInterval(interval);
                reject(new Error("生成失敗"));
            }
        }, 5000); // 5秒ごとにチェック
    });
}




// 生成ボタン（Luma AI / Runway）が押された時の処理
async function handleGenerate(service) {
    const prompt = document.getElementById('promptInput').value;
    const idField = document.getElementById('idField'); // 画面上のID入力欄
    const statusText = document.getElementById('statusText'); // ステータス表示エリア

    statusText.innerText = "リクエスト送信中...";
    
    // 1. 生成リクエスト
    const result = await VideoManager.requestGeneration(service, prompt, "YOUR_API_KEY");
    
    // 2. IDを自動セット
    idField.value = result.id;
    
    // 3. ポーリング開始
    statusText.innerText = "生成中...";
    const videoUrl = await VideoManager.pollStatus(service, result.id, "YOUR_API_KEY");
    
    // 4. 完了
    statusText.innerText = "動画が完成しました！";
    // ここで動画プレビューを表示
}

function displayVideo(url) {
    const historySection = document.querySelector('.history');
    const video = document.createElement('video');
    video.src = url;
    video.controls = true;
    historySection.appendChild(video);
}
// 生成状態をチェックする関数
async function checkGenerationStatus(service, id, apiKey) {
    // 各サービスのステータス確認用エンドポイントへリクエスト
    const response = await fetch(`https://api.example.com/v1/${service}/status/${id}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    return await response.json();
}

// 完了を待つメインループ
async function waitForCompletion(service, id, apiKey) {
    while (true) {
        const data = await checkGenerationStatus(service, id, apiKey);
        if (data.state === 'completed') return data.url;
        if (data.state === 'failed') throw new Error('生成失敗');
        await new Promise(r => setTimeout(r, 5000)); // 5秒待機
    }
}



async function startTictopeGeneration(prompt, apiKey) {
    const statusText = document.getElementById('status-text');
    const videoElement = document.getElementById('tictope-preview');
    
    statusText.innerText = "生成リクエスト送信中...";
    
    try {
        // 1. リクエスト送信
        const result = await VideoManager.requestGeneration('luma', prompt, apiKey);
        const genId = result.id;
        
        statusText.innerText = "動画生成中（約1〜2分かかります）...";
        
        // 2. ポーリング（生成完了まで待つ）
        const videoUrl = await VideoManager.pollStatus('luma', genId, apiKey);
        
        // 3. 表示
        videoElement.src = videoUrl;
        videoElement.style.display = 'block';
        statusText.innerText = "完成！TikTokへ投稿可能です。";
        
    } catch (err) {
        statusText.innerText = "エラー: " + err;
    }
}

// TikTok用に比率を固定する
async function generateTikTokVideo(prompt, apiKey) {
    const response = await fetch('https://api.lumalabs.ai/v1/dream-machine/generations', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            prompt: prompt,
            aspect_ratio: "9:16", // ここを固定
            duration: 5 // ショート動画に最適な秒数
        })
    });
    return await response.json();
}



localStorage.setItem('lastGenerationId', result.id);


/**
 * 動画生成API 接続モジュール
 */
const VideoManager = {
    // 生成リクエスト送信
    async requestGeneration(service, prompt, apiKey) {
        const endpoints = {
            luma: 'https://api.lumalabs.ai/v1/dream-machine/generations',
            runway: 'https://api.runwayml.com/v1/generate'
        };
        
        const response = await fetch(endpoints[service], {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });
        return await response.json(); // ここで生成IDを取得
    },

    // 完了するまでステータスを確認し続ける（ポーリング処理）
    async pollStatus(service, generationId, apiKey) {
        return new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                const status = await this.checkStatus(service, generationId, apiKey);
                
                if (status.state === 'completed') {
                    clearInterval(interval);
                    resolve(status.video_url); // 完成したURLを返す
                } else if (status.state === 'failed') {
                    clearInterval(interval);
                    reject('生成が失敗しました');
                }
                // 'processing' ならそのまま継続
            }, 5000); // 5秒ごとに確認
        });
    }
};

// app.js
document.addEventListener('DOMContentLoaded', () => {
    // Luma AI ボタンの処理
    document.querySelector('.luma-button').addEventListener('click', async () => {
        const prompt = document.querySelector('textarea').value;
        const apiKey = prompt("APIキーを入力してください（安全のため保存されません）"); // 簡易的な入力

        if (!apiKey) return;

        try {
            const result = await triggerVideoGeneration('luma', prompt, apiKey);
            alert('生成開始！ID: ' + result.id);
            // ここに生成履歴を表示する処理を追加
        } catch (e) {
            alert('生成に失敗しました');
        }
    });
});


// api.js

/**
 * 動画生成APIを呼び出す関数
 * @param {string} service - 'luma' または 'runway'
 * @param {string} prompt - プロンプト
 * @param {string} apiKey - セキュリティのため入力欄から受け取る
 */
async function triggerVideoGeneration(service, prompt, apiKey) {
    const endpoints = {
        luma: 'https://api.lumalabs.ai/v1/dream-machine/generate',
        runway: 'https://api.runwayml.com/v1/generate'
    };

    try {
        const response = await fetch(endpoints[service], {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({ prompt: prompt })
        });

        if (!response.ok) throw new Error('API通信エラー');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

document.getElementById('runway-btn').addEventListener('click', async () => {
    const prompt = document.querySelector('textarea').value;
    const apiKey = document.getElementById('api-key-input').value; // UI上の入力欄から取得

    try {
        alert('動画生成を開始します...');
        const result = await callVideoAI('runway', prompt, apiKey);
        console.log('生成ID:', result.id);
        alert('生成リクエスト成功！ID: ' + result.id);
    } catch (err) {
        alert(err.message);
    }
});

/**
 * AI動画生成APIへのリクエスト送信関数
 * @param {string} service - 'luma' または 'runway'
 * @param {string} prompt - ユーザーのプロンプト
 * @param {string} apiKey - ユーザー入力フォームから取得したキー
 */
async function callVideoAI(service, prompt, apiKey) {
    // 各サービスのAPIエンドポイント（実際のマニュアルに合わせて調整してください）
    const endpoints = {
        luma: 'https://api.lumalabs.ai/v1/dream-machine/generate',
        runway: 'https://api.runwayml.com/v1/generate'
    };

    const response = await fetch(endpoints[service], {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ prompt: prompt })
    });

    if (!response.ok) {
        throw new Error(`${service} APIの呼び出しに失敗しました: ${response.statusText}`);
    }

    return await response.json(); // 生成IDやステータスが返ります
}




// api.js
const API_CONFIG = {
    // 実際にはここにキーを書かない！
    // ユーザーに環境変数や入力フォームから渡す設計にします
};

/**
 * AI動画生成APIを呼び出す関数（例: Luma AIやRunwayのAPI形式を想定）
 * @param {string} prompt - ユーザーのプロンプト
 * @param {string} apiKey - セキュリティのため入力フォームから取得する想定
 */
async function generateVideo(prompt, apiKey) {
    const url = 'https://api.example.com/v1/generate'; // 各AIサービスのAPIエンドポイント

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                prompt: prompt,
                aspect_ratio: '16:9'
            })
        });

        const data = await response.json();
        return data; // 生成された動画のURLやIDを返す
    } catch (error) {
        console.error('API呼び出しエラー:', error);
        throw error;
    }
}


<script>
    function changeEffect(filterStyle) {
        // IDが displayImage の画像を探してフィルターを適用
        const img = document.getElementById('displayImage');
        if (img) {
            img.style.filter = filterStyle;
        } else {
            alert("画像が見つかりません。id='displayImage' を確認してください。");
        }
    }
</script>

// ボタンを取得
const btn = document.getElementById('generateBtn');

// クリックイベントを追加
btn.addEventListener('click', () => {
    // ここにAIへリクエストを送る処理や、画像加工の指示を書く
    alert("AI処理を開始します： " + document.getElementById('prompt').value);
    
    // この中で実際にCanvasを書き換える関数を呼ぶ
    processImage(); 
});


function processImage() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    // 例：反転（崩壊感）の処理を呼び出す
    ctx.filter = 'invert(100%)';
    ctx.drawImage(img, 0, 0); // 読み込んだ画像を描画
}


// フロントエンドでプロンプトのカテゴリーを管理
const prompts = {
    portrait: ["高品質なポートレート...", "サイバーパンク風の人物..."],
    scenery: ["美しい夕暮れの風景...", "未来的な都市の夜景..."]
};

function getRandomPrompt(category) {
    const list = prompts[category];
    return list[Math.floor(Math.random() * list.length)];
}
const [isPromotionVisible, setIsPromotionVisible] = useState(false);

useEffect(() => {
    // APIからキャンペーン情報を取得
    fetch('/api/check-promotion').then(res => res.json()).then(data => {
        if (data.isActive && !userHasClaimed) {
            setIsPromotionVisible(true);
        }
    });
}, []);
// プロンプトを強化する関数例
const enhancePrompt = async (userInput) => {
  const style = "cinematic, 8k resolution, highly detailed";
  // 入力されたキーワードにスタイルを自動的に追加する
  const finalPrompt = `${userInput}, ${style}`;
  
  // 実際にはここからAPIを叩く
  return finalPrompt;
};

// UI側でタグを追加する例
const addTag = (tag) => {
  setPromptInput((prev) => `${prev}, ${tag}`);
};
<button disabled={promptInput.length === 0}>創作</button>
// 入力が止まって500ms後に処理を実行
const handleInputChange = debounce((value) => {
    validatePrompt(value);
}, 500);
// プロンプトを強化する関数例
const enhancePrompt = async (userInput) => {
  const style = "cinematic, 8k resolution, highly detailed";
  // 入力されたキーワードにスタイルを自動的に追加する
  const finalPrompt = `${userInput}, ${style}`;
  
  // 実際にはここからAPIを叩く
  return finalPrompt;
};

// UI側でタグを追加する例
const addTag = (tag) => {
  setPromptInput((prev) => `${prev}, ${tag}`);
};
document.addEventListener("DOMContentLoaded", () => {
    // ボタンや入力欄を取得
    const promptInput = document.getElementById("prompt-input");
    const createButton = document.getElementById("create-btn");

    // ボタンがクリックされた時の処理
    createButton.addEventListener("click", async () => {
        const userText = promptInput.value;

        // 入力が空でないか確認
        if (!userText.trim()) {
            alert("指示を入力してください！");
            return;
        }

        // 生成開始の合図（ボタンを無効化して連打を防ぐ）
        createButton.disabled = true;
        createButton.textContent = "生成中...";

        try {
            // ここでAPIを呼び出す（例）
            const result = await generateAiContent(userText);
            console.log("生成結果:", result);
            alert("生成が完了しました！");
        } catch (error) {
            console.error("エラーが発生しました:", error);
            alert("生成に失敗しました。もう一度試してください。");
        } finally {
            // ボタンを元に戻す
            createButton.disabled = false;
            createButton.textContent = "創作";
        }
    });
});

// AI生成APIを模倣した関数（実際に使う際はfetchなどでAPIを呼び出します）
async function generateAiContent(text) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`「${text}」に基づいた動画を生成しました`);
        }, 2000); // 2秒の擬似的な読み込み時間
    });
}

export const CONFIG = {
    apiKey: "sk-...",
    modelName: "gpt-4o",
    maxTokens: 1000
};
// js/main.js
async function handleCreate() {
    const prompt = document.getElementById("prompt-input").value;
    
    // 自分のサーバーのURLへ送信
    const response = await fetch('http://あなたのサーバーIP:8000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt })
    });
    
    const data = await response.json();
    console.log(data);
}

// 画質を落としてサイズを小さくする関数 (Canvasを使用)
async function compressImage(file, quality = 0.7) {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0);
    
    // Blobとして圧縮して出力
    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
    });
}
function updateFileName(input) {
    if (input.files.length > 0) {
        document.getElementById('fileStatus').innerText = "✅ 選択中: " + input.files[0].name;
    }
}

function generatePrompt() {
    const scene = document.getElementById('promptArea').value;
    const fileRef = document.getElementById('fileStatus').innerText;
    const base = "(Masterpiece:1.2), MIKA anime girl, glowing cyan eyes, 8k, AURA style";
    const final = `${base}, ${fileRef}, ${scene}`;
    
    document.getElementById('result-prompt').value = final;
    navigator.clipboard.writeText(final);
}

function openChatGPT() {
    const prompt = document.getElementById('result-prompt').value;
    if (!prompt) { alert("まずはプロンプトを合成してください"); return; }
    window.open(`https://chatgpt.com/?q=${encodeURIComponent(prompt)}`, '_blank');
}
const today = "2026.06.07";
const newsData = [
  { category: "国内", title: "関東甲信と東海で梅雨入り" },
  { category: "社会", title: "山梨県警のキャリア採用試験に関心" },
  { category: "スポーツ", title: "全米女子オープンで畑岡選手5位浮上" }
];

document.getElementById("news-date").innerText = `本日の最新ニュース (${today})`;
const list = document.getElementById("news-list");

newsData.forEach(item => {
  const li = document.createElement("li");
  li.innerHTML = `<strong>[${item.category}]</strong> ${item.title}`;
  list.appendChild(li);
});


// 動作確認用
console.log("システム正常稼働中: 2026-06-09");
alert("読み込み完了");

/**
 * @title 社会実装用：権力構造最適化パッチ
 * @objective 目に見えない権力を可視化し、人々に気づきを与える
 */

const Society = {
  // 1. 監視（Data Acquisition）
  // 権力の不透明な動きをAPI経由でリアルタイム取得
  async monitorPowerStructure(targetAPI) {
    const data = await fetch(targetAPI); 
    return this.parseToHumanReadable(data);
  },

  // 2. 翻訳（Translation Layer）
  // 難解な政治用語を「個人の生活への影響」へ変換
  parseToHumanReadable(rawJSON) {
    // 隠された利権や非効率を、損益分岐点（コスト）として算出
    return rawJSON.map(entry => ({
      ...entry,
      impactOnCitizen: calculateLoss(entry.budget, entry.outcome),
      isBug: entry.promises !== entry.action
    }));
  },

  // 3. 実装（Execution: 「気づかせる」）
  // 批判ではなく「事実」を突きつけ、当事者意識を醸成
  renderDashboard(data) {
    data.forEach(bug => {
      if (bug.isBug) {
        // 印籠（真実）の提示：誰もが直感的に「おかしい」と気づくUI
        UI.showFact(`【発見】公約と実行の乖離を検知しました。
                    この歪みにより、年間 ${bug.impactOnCitizen} 円の損失が発生しています。`);
      }
    });
  }
};

// --- Execution Loop ---
// 誰かに問うのではなく、システムが常に真実を提示し続ける
setInterval(() => {
  const powerData = Society.monitorPowerStructure(KOKKAI_API);
  Society.renderDashboard(powerData);
}, 86400000); // 1日1回、事実を突きつける

// 権力の「見えない宣伝費」を透視する計算式
function calculatePRTransparency(budget, reach, agencyFee) {
  // 予算のうち、本来の目的に使われず中抜き・手数料として消えていると推定される額
  const estimatedWaste = agencyFee * 0.3; 
  const impactPerCitizen = budget / populationOfOsaka;
  
  return {
    waste: estimatedWaste,
    transparencyScore: (budget / (budget + estimatedWaste)) * 100
  };
}
async function fetchBudget() {
    // 大阪市の予算データをAPIから取得する関数（第一歩）
    console.log("監視システム起動...");
    // ここにAPIエンドポイントを順次追加していきます
}
// 予算データのバグを見つけるロジック
function analyzeBudget(data) {
    const totalPRBudget = data.reduce((sum, item) => sum + item.cost, 0);
    const perCitizen = totalPRBudget / 2750000; // 大阪市の推定人口
    
    return {
        total: totalPRBudget,
        costPerPerson: perCitizen.toFixed(2),
        warning: perCitizen > 500 ? "⚠️ この広報予算は平均を大きく超過しています。" : "正常"
    };
}
/**
 * Osaka-Budget-Scanner: 権力監視エンジン
 * 目的: 広告宣伝費の「不透明な支出」を市民のコストとして可視化する
 */

async function initPowerSearch() {
    console.log("監視システム: 大阪市広報予算のサーチを開始します...");
    
    // 大阪市オープンデータAPI: 予算執行状況へのアクセス
    const API_URL = "https://data.city.osaka.lg.jp/api/3/action/datastore_search?resource_id=...&q=広告宣伝費";

    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (data.success) {
            const auditResult = processAudit(data.result.records);
            renderDashboard(auditResult);
        }
    } catch (e) {
        console.error("監視回路エラー: データへのアクセスが遮断されています。", e);
    }
}

function processAudit(records) {
    const population = 2750000; // 大阪市推定人口
    const total = records.reduce((sum, item) => sum + parseInt(item.cost), 0);
    
    return {
        totalCost: total,
        perCitizen: (total / population).toFixed(2),
        riskLevel: total > 100000000 ? "HIGH_RISK" : "NORMAL"
    };
}

function renderDashboard(result) {
    const dashboard = document.getElementById('power-dashboard');
    dashboard.innerHTML = `
        <div class="audit-card">
            <h3>監視レポート: 広報宣伝費</h3>
            <p>総額: ${result.totalCost.toLocaleString()}円</p>
            <p>市民一人あたりの負担: <strong>${result.perCitizen}円</strong></p>
            <p>警告: ${result.riskLevel === "HIGH_RISK" ? "⚠️ 不透明な支出超過の疑い" : "正常"}</p>
        </div>
    `;
}

// システム実行
initPowerSearch();
/**
 * マネーフロー追跡モジュール
 * 目的: 委託先の集中度を分析し、特定の「権力との癒着」をあぶり出す
 */

function analyzeDependency(records) {
    const contractorMap = {};
    
    // 企業ごとの受注総額を算出
    records.forEach(item => {
        const name = item.contractor_name;
        contractorMap[name] = (contractorMap[name] || 0) + parseInt(item.cost);
    });

    // 受注集中率の計算（上位企業が全予算の何％を占めるか）
    const total = Object.values(contractorMap).reduce((a, b) => a + b, 0);
    const topContractor = Object.entries(contractorMap).sort((a, b) => b[1] - a[1])[0];
    const concentration = (topContractor[1] / total) * 100;

    return {
        top: topContractor[0],
        concentration: concentration.toFixed(1)
    };
}
/**
 * 拡散用：市民への「気づき」提供回路
 */
function generatePersonalizedWarning(costPerPerson) {
  // ユーザーの行動を促すトリガー
  const message = `あなたの一年分の税金のうち、約 ${costPerPerson} 円が、
                 市民の生活改善ではなく「特定のPR事業」に割り当てられています。
                 この金額があれば、地域の図書室や保育サービスに何ができるでしょうか？`;
  
  return message;
}

/**
 * マネーフロー異常検知スクリプト
 */
function detectBudgetAnomaly(records) {
    const contractorSummary = records.reduce((acc, curr) => {
        acc[curr.contractor] = (acc[curr.contractor] || 0) + Number(curr.amount);
        return acc;
    }, {});

    const total = Object.values(contractorSummary).reduce((a, b) => a + b, 0);

    return Object.entries(contractorSummary)
        .map(([name, amount]) => ({
            name,
            amount,
            ratio: ((amount / total) * 100).toFixed(2)
        }))
        .filter(entry => entry.ratio > 20); // 1社で20%超を占める異常値を抽出
}
function updateUI(anomalies) {
    const container = document.getElementById('anomaly-log');
    container.innerHTML = anomalies.map(a => `
        <div class="alert-box">
            <strong>警告: 特定企業への集中検知</strong><br>
            企業: ${a.name}<br>
            シェア: ${a.ratio}%<br>
            <a href="https://github.com/your-repo/issues/new?title=調査依頼:${a.name}">詳細を議論する</a>
        </div>
    `).join('');
}
/**
 * 予算の急激な肥大化（バグの成長）を検知する
 */
function analyzeTrend(dataHistory) {
    // dataHistory: [{year: 2024, amount: 100}, {year: 2025, amount: 150}, ...]
    return dataHistory.map((entry, index, arr) => {
        if (index === 0) return { ...entry, growth: 0 };
        const prev = arr[index - 1].amount;
        const growth = ((entry.amount - prev) / prev) * 100;
        return { ...entry, growth: growth.toFixed(1) };
    }).filter(entry => entry.growth > 30); // 30%以上の急増をバグとして抽出
}
function renderTrend(trends) {
    const log = document.getElementById('trend-log');
    log.innerHTML = trends.map(t => `
        <div class="trend-item">
            ${t.year}年: 前年比 +${t.growth}% 
            <span class="warning">異常な成長を検知</span>
        </div>
    `).join('');
}
/**
 * main.js
 * 予算監視システムの全機能をここに統合
 */

// 1. 初期設定
const API_CONFIG = {
    resource_id: "YOUR_RESOURCE_ID_HERE", // 大阪市オープンデータのID
    population: 2750000
};

// 2. メイン実行処理
async function init() {
    console.log("監視システム起動...");
    const data = await fetchBudgetData();
    
    // 解析とレンダリングの実行
    const audit = processAudit(data);
    const anomalies = detectBudgetAnomaly(data);
    const trends = analyzeTrend(data);

    renderDashboard(audit);
    renderAnomaly(anomalies);
    renderTrend(trends);
}

// 3. データ取得
async function fetchBudgetData() {
    const url = `https://data.city.osaka.lg.jp/api/3/action/datastore_search?resource_id=${API_CONFIG.resource_id}`;
    const response = await fetch(url);
    const result = await response.json();
    return result.result.records;
}

// 4. 各機能ロジック（ここに追加・修正していく）
function processAudit(records) {
    const total = records.reduce((sum, item) => sum + Number(item.amount), 0);
    return { total, perCitizen: (total / API_CONFIG.population).toFixed(2) };
}

function detectBudgetAnomaly(records) {
    return records.filter(item => item.amount > 100000000); 
}

function analyzeTrend(data) {
    // 時系列データ処理
    return [{ year: 2026, growth: 5.2 }]; 
}

// 5. レンダリング
function renderDashboard(data) {
    document.getElementById('audit-content').innerHTML = `総額: ${data.total}円 / 市民負担: ${data.perCitizen}円`;
}

function renderAnomaly(anomalies) {
    const log = document.getElementById('anomaly-log');
    log.innerHTML = anomalies.map(a => `<div>異常検出: ${a.name}</div>`).join('');
}

function renderTrend(trends) {
    document.getElementById('trend-log').innerHTML = trends.map(t => `<div>${t.year}年: +${t.growth}%</div>`).join('');
}

// 起動
init();
// main.js の fetchBudgetData を一時的に書き換えてテストする
async function fetchBudgetData() {
    // APIの代わりにテストデータを返す
    return [
        { name: "広告PR事業A", amount: 150000000, contractor: "株式会社X" },
        { name: "広報紙発行事業", amount: 50000000, contractor: "株式会社Y" }
    ];
}

/**
 * main.js - 動作確認用
 */

window.onload = () => {
    console.log("監視システム起動...");
    
    // APIの代わりに手動データで動作を確認する
    const mockData = [
        { name: "市政PR広告費", amount: 120000000, contractor: "株式会社大手広報" },
        { name: "イベント宣伝費", amount: 45000000, contractor: "株式会社イベント企画" }
    ];

    runSystem(mockData);
};

function runSystem(data) {
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    const population = 2750000;
    const perCitizen = (total / population).toFixed(2);

    // 1. 予算概要表示
    document.getElementById('audit-content').innerHTML = `
        総額: ${total.toLocaleString()}円<br>
        市民一人あたりの負担: <strong>${perCitizen}円</strong>
    `;

    // 2. 異常検知ログ表示
    const anomalyLog = document.getElementById('anomaly-log');
    anomalyLog.innerHTML = data.map(item => `
        <div class="alert-box">
            <strong>${item.name}</strong><br>
            委託先: ${item.contractor}<br>
            支出額: ${item.amount.toLocaleString()}円
        </div>
    `).join('');

    // 3. 予算肥大化アラート
    document.getElementById('trend-log').innerHTML = `
        <div class="trend-item">前年比 +12.4% (警告: 上昇傾向)</div>
    `;
}
/**
 * 企業別受注額の集計・可視化
 */
function analyzeContractors(data) {
    const summary = data.reduce((acc, curr) => {
        acc[curr.contractor] = (acc[curr.contractor] || 0) + curr.amount;
        return acc;
    }, {});

    // 受注額が多い順に並び替え
    return Object.entries(summary).sort((a, b) => b[1] - a[1]);
}

// runSystem 内でこれを呼び出し、UIに反映させる
function renderContractors(contractorData) {
    const container = document.getElementById('anomaly-log'); // または新しいコンテナ
    container.innerHTML += `
        <h4>主な受注先:</h4>
        ${contractorData.map(c => `<div>${c[0]}: ${c[1].toLocaleString()}円</div>`).join('')}
    `;
}

// main.js 内のテストデータを極端にする
const mockData = [
    { name: "市政PR広告費", amount: 999999999, contractor: "株式会社大手広報" } // ここを大きくする
];
// main.js の一番上に配置
console.log("DEBUG: main.js が読み込まれました。時刻: " + new Date().toLocaleTimeString());
window.onload = () => {
    console.log("初期化開始");
    
    // HTMLのidに確実に値を注入する
    const auditContent = document.getElementById('audit-content');
    if (auditContent) {
        auditContent.innerHTML = "解析完了: データ接続済み";
    }

    const anomalyLog = document.getElementById('anomaly-log');
    if (anomalyLog) {
        anomalyLog.innerHTML = "<div>異常検知システム作動中</div>";
    }

    const trendLog = document.getElementById('trend-log');
    if (trendLog) {
        trendLog.innerHTML = "<div>トレンド分析データ取得済み</div>";
    }
};


// 1. 状態の管理
let processedImage = null; // AI結果を一時保存する場所

// 2. ボタンを押した瞬間（重い処理）
runBtn.addEventListener('click', async () => {
  // ① AIモデルで加工を実行
  const result = await runAIModel(originalImage);
  
  // ② 結果を別のCanvas（裏方）に保存
  processedCanvas.getContext('2d').drawImage(result, 0, 0);
  processedImage = processedCanvas; 
});

// 3. スライダーを動かしているリアルタイム（軽い処理）
slider.addEventListener('input', (e) => {
  if (!processedImage) return;
  
  const alpha = e.target.value / 100;
  
  // 表示用Canvasをクリアして合成
  mainCtx.clearRect(0, 0, canvas.width, canvas.height);
  
  // オリジナルを描画
  mainCtx.globalAlpha = 1.0;
  mainCtx.drawImage(originalCanvas, 0, 0);
  
  // その上にAI結果を適用度（alpha）で重ねる
  mainCtx.globalAlpha = alpha;
  mainCtx.drawImage(processedImage, 0, 0);
});

// utils.js (共通ユーティリティ)
export const CanvasHelper = {
  // 画像をCanvasにリセットして描画する共通関数
  draw(canvas, image) {
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
  },
  // フィルターを一括適用する共通関数
  apply(canvas, filterString) {
    const ctx = canvas.getContext('2d');
    ctx.filter = filterString;
    ctx.drawImage(canvas, 0, 0);
  }
};
// HTML側のCanvas要素が正しく取得されているか確認
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const input = document.getElementById('imageInput');

input.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) {
    console.error("ファイルが選択されていません");
    return;
  }

  const reader = new FileReader();

  // FileReaderで読み込み完了後に実行
  reader.onload = (event) => {
    const img = new Image();
    
    // 画像ロード完了後にCanvasに描画
    img.onload = () => {
      // 1. Canvasのサイズを画像に合わせる（重要：ここがないと0x0で表示されない）
      canvas.width = img.width;
      canvas.height = img.height;
      
      // 2. 描画を実行
      ctx.clearRect(0, 0, canvas.width, canvas.height); // 一旦クリア
      ctx.drawImage(img, 0, 0);
      
      console.log("画像表示成功:", img.width, "x", img.height);
    };

    img.onerror = () => {
      console.error("画像の読み込みに失敗しました");
    };

    img.src = event.target.result;
  };

  reader.readAsDataURL(file);
});

// HTML側のCanvas要素が正しく取得されているか確認
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const input = document.getElementById('imageInput');

input.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) {
    console.error("ファイルが選択されていません");
    return;
  }

  const reader = new FileReader();

  // FileReaderで読み込み完了後に実行
  reader.onload = (event) => {
    const img = new Image();
    
    // 画像ロード完了後にCanvasに描画
    img.onload = () => {
      // 1. Canvasのサイズを画像に合わせる（重要：ここがないと0x0で表示されない）
      canvas.width = img.width;
      canvas.height = img.height;
      
      // 2. 描画を実行
      ctx.clearRect(0, 0, canvas.width, canvas.height); // 一旦クリア
      ctx.drawImage(img, 0, 0);
      
      console.log("画像表示成功:", img.width, "x", img.height);
    };

    img.onerror = () => {
      console.error("画像の読み込みに失敗しました");
    };

    img.src = event.target.result;
  };

  reader.readAsDataURL(file);
});
import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers';

// 1. モデルの初期化（これを一度だけ実行）
let pipelineInstance = null;
async function initAI() {
    if (!pipelineInstance) {
        // 画像生成パイプラインを準備
        pipelineInstance = await pipeline('text-to-image', 'Xenova/stable-diffusion-2-small');
    }
    return pipelineInstance;
}

// 2. ボタンを押した時の処理
document.getElementById('runBtn').addEventListener('click', async () => {
    const prompt = document.getElementById('prompt').value;
    const statusDiv = document.getElementById('status'); // 状態表示用
    
    statusDiv.innerText = "AI処理中...（数秒かかります）";
    
    try {
        const generator = await initAI();
        const output = await generator(prompt);
        
        // Canvasへの反映
        const canvas = document.getElementById('canvas');
        const img = await createImageBitmap(output);
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        
        statusDiv.innerText = "完了！";
    } catch (err) {
        console.error(err);
        statusDiv.innerText = "エラー: " + err.message;
    }
});

// サンプルのロジック構成
const status = {
  isThinking: true,
  isAnalyzing: false,
};

function renderStatus() {
  const container = document.getElementById('status-container');
  
  if (status.isThinking) {
    container.innerHTML = `<p>市場データ解析中：最新潮流を同期中...</p>`;
  } else if (status.isAnalyzing) {
    container.innerHTML = `<p>エリート戦略を策定中...</p>`;
  } else {
    container.innerHTML = `<p>準備完了</p>`;
  }
}


        kick.volume.value = volRef.current.kick; snareNoise.volume.value = volRef.current.snare;
        hihat.volume.value = volRef.current.hihat; snap.volume.value = volRef.current.snap;
        tom.volume.value = volRef.current.tom; electro.volume.value = volRef.current.electro;
        shaker.volume.value = volRef.current.shaker; bass.volume.value = volRef.current.bass;
        bassSub.volume.value = volRef.current.bass + (bassBoostRef.current ? 6 : 0);
        synthLead.volume.value = volRef.current.synth;

        const d = drumSteps;
        const bSteps = bassSteps;
        const sSteps = synthSteps;

        transport.schedule((time) => {
          for (let step = 0; step < TOTAL_STEPS; step++) {
            const t = time + step * secPerStep;
            if (d.kick[step]) kick.triggerAttackRelease("C1", "8n", t);
            if (d.snare[step]) snareNoise.triggerAttackRelease("8n", t);
            if (d.hihat[step]) hihat.triggerAttackRelease("16n", t);
            if (d.snap[step]) snap.triggerAttackRelease("16n", t);
            if (d.tom[step]) tom.triggerAttackRelease("G1", "8n", t);
            if (d.electro[step]) electro.triggerAttackRelease("A2", "16n", t);
            if (d.shaker[step]) shaker.triggerAttackRelease("32n", t);
            const bn = bSteps[step];
            if (bn) {
              bass.triggerAttackRelease(bn, "8n", t);
              bassSub.triggerAttackRelease(Tone.Frequency(bn).transpose(-12), "8n", t);
            }
            const sn = sSteps[step];
            if (sn) synthLead.triggerAttackRelease(sn, "8n", t);
          }
        }, 0);

        if (ambientOn) {
          let chordIdx = 0;
          const speedSec = Tone.Time(progressionSpeedRef.current).toSeconds();
          for (let t = 0; t < totalSec; t += speedSec) {
            const chord = progressionRef.current[chordIdx % progressionRef.current.length];
            transport.schedule((time) => {
              ambient.triggerAttackRelease(chord, progressionSpeedRef.current, time);
              if (backChorusRef.current) {
                chorus.triggerAttackRelease(chord.map(n => Tone.Frequency(n).transpose(12).toNote()), progressionSpeedRef.current, time);
              }
            }, t);
            chordIdx++;
          }
        }
      }, totalSec);

      const wavBlob = bufferToWav(buffer);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${songName || "rhythm-forge"}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setStatus("WAVエクスポートが完了しました🎵");
    } catch (err) {
      setStatus("WAVエクスポートに失敗しました");
    }
    setExporting(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 select-none relative">
      {/* 画面フラッシュ演出 */}
      <div
        className="fixed inset-0 bg-cyan-500 pointer-events-none transition-opacity duration-75 z-50"
        style={{ opacity: flashOpacity }}
      />

      {/* ヘッダー */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
            RHYTHM FORGE
          </span>
          <span className="text-xs px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-cyan-400 font-mono">
            PRO DAW v4.8
          </span>
        </div>

        {/* トランスポートコントロール */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={togglePlay}
            className={`px-4 py-2 rounded-lg font-bold text-sm shadow transition flex items-center gap-1.5 ${
              playing
                ? "bg-amber-500 hover:bg-amber-600 text-slate-950"
                : "bg-cyan-500 hover:bg-cyan-400 text-slate-950"
            }`}
          >
            {playing ? "⏹ 停止" : "▶ 再生"}
          </button>
          <button
            onClick={restartFromTop}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm border border-slate-700"
            title="最初から再生"
          >
            ⏮ 頭出し
          </button>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg">
            <span className="text-xs text-slate-400">BPM</span>
            <input
              type="number"
              value={bpm}
              onChange={e => setBpm(Math.max(40, Math.min(240, Number(e.target.value))))}
              className="w-12 bg-slate-950 text-cyan-400 font-mono text-center text-sm border border-slate-800 rounded"
            />
            <div className="flex gap-1 ml-1">
              {BPM_PRESETS.map(b => (
                <button
                  key={b}
                  onClick={() => setBpm(b)}
                  className={`text-[10px] px-1.5 py-0.5 rounded border ${
                    bpm === b
                      ? "bg-cyan-500 text-slate-950 border-cyan-400 font-bold"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* プロジェクト・ファイル操作 */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            value={songName}
            onChange={e => setSongName(e.target.value)}
            placeholder="曲名を入力..."
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 w-28 focus:border-cyan-500 outline-none"
          />
          <button
            onClick={saveSong}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold shadow"
          >
            保存
          </button>
          <button
            onClick={exportWav}
            disabled={exporting}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold shadow disabled:opacity-50"
          >
            {exporting ? "書き出し中..." : "🎵 WAV保存"}
          </button>
          <button
            onClick={exportProjectJson}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs border border-slate-700"
          >
            JSON
          </button>
          <label className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs border border-slate-700 cursor-pointer">
            インポート
            <input type="file" accept=".json" onChange={importProjectJson} className="hidden" />
          </label>
        </div>
      </header>

      {/* ナビゲーションタブ */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center gap-2 overflow-x-auto">
        {[
          { id: "DRUM", label: "🥁 ドラム" },
          { id: "BASS", label: "🎸 ベース" },
          { id: "SYNTH", label: "🎹 シンセ・メロディ" },
          { id: "CHORDS", label: "🎼 コード・アンビエント" },
          { id: "VOICE", label: "🎤 ラップ・ボーカル" },
          { id: "MIXER", label: "🎚️ ミキサー・FX" },
          { id: "AI", label: "🤖 AIコンポーザー" },
          { id: "SAVED", label: "💾 保存リスト" },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              tab === t.id
                ? "bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 shadow-md"
                : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ステータス表示バー */}
      {status && (
        <div className="bg-cyan-950/60 border-b border-cyan-800/60 px-4 py-1 text-xs text-cyan-300 flex items-center justify-between">
          <span>{status}</span>
          <button onClick={() => setStatus("")} className="text-cyan-400 hover:text-cyan-200 font-bold">×</button>
        </div>
      )}

      {/* メインコンテンツエリア */}
      <main className="p-4 max-w-7xl mx-auto">
        {/* ================= DRUM TAB ================= */}
        {tab === "DRUM" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-400">ジャンル・プリセット:</span>
                {Object.keys(DRUM_PRESETS).map(p => (
                  <button
                    key={p}
                    onClick={() => applyPreset(p)}
                    className={`px-2 py-1 rounded text-xs border ${
                      preset === p
                        ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={shuffleDrum}
                  className="px-3 py-1 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded text-xs font-bold shadow"
                >
                  🎲 ドラムシャッフル
                </button>
                <button
                  onClick={addDrumRandomAI}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold shadow"
                >
                  ✨ ドラムAI追加
                </button>
                <button
                  onClick={clearAllDrum}
                  className="px-2.5 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded text-xs"
                >
                  小節クリア
                </button>
              </div>
            </div>

            {/* 小節切り替え */}
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              <span className="text-xs text-slate-400 font-bold mr-2">小節 (BAR):</span>
              {Array.from({ length: BARS }, (_, b) => (
                <button
                  key={b}
                  onClick={() => setCurrentBar(b)}
                  className={`w-8 h-8 rounded-lg text-xs font-mono font-bold flex items-center justify-center border ${
                    currentBar === b
                      ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  {b + 1}
                </button>
              ))}
              <div className="ml-auto flex gap-2">
                <button
                  onClick={copyDrumForward}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-xs"
                >
                  次小節にコピー
                </button>
                <button
                  onClick={loopDrumAll}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-xs"
                >
                  全小節にループ
                </button>
              </div>
            </div>

            {/* ドラムシーケンサー・グリッド */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-x-auto shadow-xl">
              <div className="min-w-[700px] space-y-2">
                {DRUM_ROWS.map(r => (
                  <div key={r.key} className="flex items-center gap-2">
                    <button
                      onClick={() => manualHitDrum(r.key)}
                      className="w-24 text-left px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold text-slate-300 border border-slate-700 flex items-center justify-between"
                    >
                      <span>{r.label}</span>
                      <span className="text-[10px] text-cyan-400">▶</span>
                    </button>
                    <div className="flex-1 grid grid-cols-16 gap-1">
                      {Array.from({ length: BAR_STEPS }, (_, i) => {
                        const globalStep = currentBar * BAR_STEPS + i;
                        const active = drumSteps[r.key]?[globalStep];
                        const isCurrent = currentStep === globalStep;
                        return (
                          <button
                            key={i}
                            onClick={() => toggleDrumStep(r.key, i)}
                            className={`h-9 rounded transition ${
                              active
                                ? "bg-cyan-500 hover:bg-cyan-400 shadow-md shadow-cyan-500/20"
                                : "bg-slate-950 hover:bg-slate-800 border border-slate-800/80"
                            } ${isCurrent ? "ring-2 ring-fuchsia-400" : ""}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= BASS TAB ================= */}
        {tab === "BASS" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-bold text-slate-400">ノート選択:</span>
                <div className="flex gap-1">
                  {(bassHighOctave ? HIGH_BASS_NOTES : BASS_NOTES).map(n => (
                    <button
                      key={n}
                      onClick={() => setBassNote(n)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                        bassNote === n
                          ? "bg-indigo-500 text-white border-indigo-400 shadow"
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                  <input
                    type="checkbox"
                    checked={bassHighOctave}
                    onChange={e => setBassHighOctave(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-cyan-500"
                  />
                  ハイオクターブ
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                  <input
                    type="checkbox"
                    checked={bassBoost}
                    onChange={e => setBassBoost(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-cyan-500"
                  />
                  サブベースブースト
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">音色:</span>
                {Object.keys(BASS_TONES).map(t => (
                  <button
                    key={t}
                    onClick={() => setBassTone(t)}
                    className={`px-2.5 py-1 rounded text-xs border ${
                      bassTone === t
                        ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={addBassMelodyRandom}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold shadow"
                >
                  🎲 ベースランダム追加
                </button>
                <button
                  onClick={composeFromBassAI}
                  className="px-3 py-1 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded text-xs font-bold shadow"
                >
                  ✨ ベース起点AI作曲
                </button>
                <button
                  onClick={clearBass}
                  className="px-2.5 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded text-xs"
                >
                  小節クリア
                </button>
              </div>
            </div>

            {/* 小節切り替え */}
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              <span className="text-xs text-slate-400 font-bold mr-2">小節 (BAR):</span>
              {Array.from({ length: BARS }, (_, b) => (
                <button
                  key={b}
                  onClick={() => setCurrentBar(b)}
                  className={`w-8 h-8 rounded-lg text-xs font-mono font-bold flex items-center justify-center border ${
                    currentBar === b
                      ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  {b + 1}
                </button>
              ))}
              <div className="ml-auto flex gap-2">
                <button
                  onClick={copyBassForward}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-xs"
                >
                  次小節にコピー
                </button>
                <button
                  onClick={loopBassAll}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-xs"
                >
                  全小節にループ
                </button>
              </div>
            </div>

            {/* ベースシーケンサー・グリッド */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-x-auto shadow-xl">
              <div className="min-w-[700px] flex items-center gap-2">
                <div className="w-24 text-xs font-bold text-slate-400">BASS</div>
                <div className="flex-1 grid grid-cols-16 gap-1">
                  {Array.from({ length: BAR_STEPS }, (_, i) => {
                    const globalStep = currentBar * BAR_STEPS + i;
                    const val = bassSteps[globalStep];
                    const isCurrent = currentStep === globalStep;
                    return (
                      <button
                        key={i}
                        onClick={() => toggleBassStep(i)}
                        onContextMenu={e => { e.preventDefault(); manualHitBass(bassNote); }}
                        className={`h-11 rounded flex flex-col items-center justify-center transition ${
                          val
                            ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 font-bold text-[10px]"
                            : "bg-slate-950 hover:bg-slate-800 border border-slate-800/80 text-slate-600 text-[9px]"
                        } ${isCurrent ? "ring-2 ring-fuchsia-400" : ""}`}
                      >
                        {val ? <span>{val}</span> : <span>{i + 1}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= SYNTH TAB ================= */}
        {tab === "SYNTH" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-bold text-slate-400">音階:</span>
                <div className="flex gap-1">
                  {SYNTH_NOTES.map(n => (
                    <button
                      key={n}
                      onClick={() => setSynthNote(n)}
                      className={`px-2 py-1 rounded text-xs font-mono font-bold border ${
                        synthNote === n
                          ? "bg-fuchsia-600 text-white border-fuchsia-400 shadow"
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                      }`}
                      title={SOLFEGE[n]}
                    >
                      {n}({SOLFEGE[n]})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-400">音色:</span>
                {Object.keys(INSTRUMENTS).map(inst => (
                  <button
                    key={inst}
                    onClick={() => setInstrumentType(inst)}
                    className={`px-2.5 py-1 rounded text-xs border ${
                      instrumentType === inst
                        ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    {inst}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={generateMelody}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold shadow"
                >
                  🎵 メロディ作曲
                </button>
                <button
                  onClick={generateSynthAI}
                  className="px-3 py-1 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded text-xs font-bold shadow"
                >
                  ✨ シンセAI作曲
                </button>
                <button
                  onClick={generateAfricanDrumAI}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold shadow"
                >
                  🪘 アフリカ太鼓AI
                </button>
                <button
                  onClick={clearSynth}
                  className="px-2.5 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded text-xs"
                >
                  小節クリア
                </button>
              </div>
            </div>

            {/* 小節切り替え */}
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              <span className="text-xs text-slate-400 font-bold mr-2">小節 (BAR):</span>
              {Array.from({ length: BARS }, (_, b) => (
                <button
                  key={b}
                  onClick={() => setCurrentBar(b)}
                  className={`w-8 h-8 rounded-lg text-xs font-mono font-bold flex items-center justify-center border ${
                    currentBar === b
                      ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  {b + 1}
                </button>
              ))}
              <div className="ml-auto flex gap-2">
                <button
                  onClick={copySynthForward}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-xs"
                >
                  次小節にコピー
                </button>
                <button
                  onClick={loopSynthAll}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-xs"
                >
                  全小節にループ
                </button>
              </div>
            </div>

            {/* シンセシーケンサー・グリッド */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-x-auto shadow-xl">
              <div className="min-w-[700px] flex items-center gap-2">
                <div className="w-24 text-xs font-bold text-slate-400">SYNTH</div>
                <div className="flex-1 grid grid-cols-16 gap-1">
                  {Array.from({ length: BAR_STEPS }, (_, i) => {
                    const globalStep = currentBar * BAR_STEPS + i;
                    const val = synthSteps[globalStep];
                    const isCurrent = currentStep === globalStep;
                    return (
                      <button
                        key={i}
                        onClick={() => toggleSynthStep(i)}
                        onContextMenu={e => { e.preventDefault(); manualHitSynth(synthNote); }}
                        className={`h-11 rounded flex flex-col items-center justify-center transition ${
                          val
                            ? "bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-md shadow-fuchsia-600/20 font-bold text-[10px]"
                            : "bg-slate-950 hover:bg-slate-800 border border-slate-800/80 text-slate-600 text-[9px]"
                        } ${isCurrent ? "ring-2 ring-cyan-400" : ""}`}
                      >
                        {val ? <span>{val}</span> : <span>{i + 1}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= CHORDS TAB ================= */}
        {tab === "CHORDS" && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-cyan-400">🎹 コード進行・アンビエントパッド</h3>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                    <input
                      type="checkbox"
                      checked={ambientOn}
                      onChange={e => setAmbientOn(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-cyan-500"
                    />
                    アンビエント自動再生
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                    <input
                      type="checkbox"
                      checked={backChorus}
                      onChange={e => setBackChorus(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-cyan-500"
                    />
                    バックコーラス重ねる
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-slate-400">コード進行プリセット:</span>
                {Object.keys(PROGRESSIONS).map(name => (
                  <button
                    key={name}
                    onClick={() => applyProgression(name)}
                    className={`px-3 py-1 rounded text-xs border ${
                      progressionName === name
                        ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    {name}
                  </button>
                ))}
                <button
                  onClick={generateProgressionAI}
                  className="px-3 py-1 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded text-xs font-bold shadow"
                >
                  ✨ AIコード生成
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {progression.map((chord, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex flex-col items-center justify-center gap-2">
                    <span className="text-xs text-slate-400 font-bold">コード {idx + 1}</span>
                    <span className="text-sm font-mono text-cyan-400 font-bold">{chord[0]} ベース</span>
                    <button
                      onClick={() => playChord(chord[0])}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs border border-slate-700"
                    >
                      試聴
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= VOICE TAB ================= */}
        {tab === "VOICE" && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
              <h3 className="text-sm font-bold text-cyan-400">🎤 ラップ・ボーカル録音＆変声</h3>

              <div className="flex flex-wrap items-center gap-3">
                {!recording ? (
                  <button
                    onClick={startRecording}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs shadow flex items-center gap-2"
                  >
                    🔴 ラップ録音開始
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-600 rounded-lg font-bold text-xs shadow animate-pulse flex items-center gap-2"
                  >
                    ⏹ 録音停止 ({recSeconds}秒)
                  </button>
                )}

                <button
                  onClick={robotizeVoice}
                  disabled={!rapUrl}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow disabled:opacity-50"
                >
                  🤖 ロボット化
                </button>
                <button
                  onClick={pipeVoice}
                  disabled={!rapUrl}
                  className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold shadow disabled:opacity-50"
                >
                  🎷 パイプ声変声
                </button>
              </div>

              {/* 録音リスト */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400">録音アーカイブ:</span>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {rapRecordings.map(r => (
                    <div
                      key={r.id}
                      className={`flex items-center justify-between gap-3 p-2.5 rounded-lg border ${
                        activeRapId === r.id
                          ? "bg-cyan-950/40 border-cyan-500"
                          : "bg-slate-950 border-slate-800"
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-200">{r.name}</span>
                      <div className="flex items-center gap-2">
                        <audio ref={activeRapId === r.id ? rapAudioRef : null} src={r.url} controls className="h-8 w-48" />
                        <button
                          onClick={() => setActiveRapId(r.id)}
                          className={`px-2 py-1 rounded text-xs ${
                            activeRapId === r.id ? "bg-cyan-500 text-slate-950 font-bold" : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          選択
                        </button>
                        <button
                          onClick={() => deleteRapRecording(r.id)}
                          className="px-2 py-1 bg-rose-950 text-rose-300 border border-rose-800 rounded text-xs"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  ))}
                  {!rapRecordings.length && <p className="text-xs text-slate-500">録音された音声はありません</p>}
                </div>
              </div>

              {/* AIラップ作詞 */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400">✨ AIラップ作詞アシスタント</span>
                  <button
                    onClick={generateAiRap}
                    disabled={aiLoading}
                    className="px-3 py-1 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded text-xs font-bold shadow disabled:opacity-50"
                  >
                    {aiLoading ? "生成中..." : "歌詞を生成する"}
                  </button>
                </div>
                {aiLyrics && (
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg font-mono text-xs text-slate-200 whitespace-pre-wrap">
                    {aiLyrics}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= MIXER TAB ================= */}
        {tab === "MIXER" && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
              <h3 className="text-sm font-bold text-cyan-400">🎚️ ミキサー・エフェクトコントロール</h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.keys(volumes).map(k => (
                  <div key={k} className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase text-slate-400">{k} ボリューム</span>
                    <input
                      type="range"
                      min="-30"
                      max="6"
                      step="1"
                      value={volumes[k]}
                      onChange={e => setVolumes(prev => ({ ...prev, [k]: Number(e.target.value) }))}
                      className="accent-cyan-500"
                    />
                    <span className="text-xs font-mono text-cyan-400 text-right">{volumes[k]} dB</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-800 pt-4 flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                  <input
                    type="checkbox"
                    checked={reverbOn}
                    onChange={e => setReverbOn(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-cyan-500"
                  />
                  リバーブエフェクト
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                  <input
                    type="checkbox"
                    checked={delayOn}
                    onChange={e => setDelayOn(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-cyan-500"
                  />
                  ディレイエフェクト
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                  <input
                    type="checkbox"
                    checked={ampOn}
                    onChange={e => setAmpOn(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-cyan-500"
                  />
                  アンプディストーション
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ================= AI TAB ================= */}
        {tab === "AI" && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
              <h3 className="text-sm font-bold text-cyan-400">🤖 AIコンポーザー・自動作曲スタジオ</h3>
              <p className="text-xs text-slate-400">ワンクリックでプロクオリティのビート・リズム・コード進行を自動生成します。</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={aiRandomCompose}
                  className="p-4 bg-gradient-to-br from-cyan-600 to-indigo-700 hover:from-cyan-500 hover:to-indigo-600 rounded-xl text-white font-bold text-left shadow-lg space-y-1"
                >
                  <div className="text-sm">🎲 完全AIランダム作曲</div>
                  <div className="text-[11px] text-cyan-200 font-normal">ジャンル・ベース・メロディをすべて自動構築</div>
                </button>

                <button
                  onClick={generateDanceAI}
                  className="p-4 bg-gradient-to-br from-indigo-600 to-fuchsia-700 hover:from-indigo-500 hover:to-fuchsia-600 rounded-xl text-white font-bold text-left shadow-lg space-y-1"
                >
                  <div className="text-sm">💃 ダンスグルーヴAI</div>
                  <div className="text-[11px] text-indigo-200 font-normal">踊れるヒップホップ・トラップビートを生成</div>
                </button>

                <button
                  onClick={generateBlackContemporaryAI}
                  className="p-4 bg-gradient-to-br from-fuchsia-600 to-rose-700 hover:from-fuchsia-500 hover:to-rose-600 rounded-xl text-white font-bold text-left shadow-lg space-y-1"
                >
                  <div className="text-sm">🎷 ネオソウル・コンテンポラリー</div>
                  <div className="text-[11px] text-fuchsia-200 font-normal">温かみのあるSOULコードとリズムを生み出す</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= SAVED TAB ================= */}
        {tab === "SAVED" && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-cyan-400">💾 保存済みプロジェクト一覧</h3>
                <button
                  onClick={deleteAllSongs}
                  className="px-3 py-1 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded text-xs"
                >
                  全削除
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {savedList.map(item => (
                  <div key={item.name} className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3 rounded-lg">
                    <div>
                      <div className="text-xs font-bold text-slate-200">{item.name}</div>
                      <div className="text-[10px] text-slate-500">{item.savedAt}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => loadSong(item.name)}
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold shadow"
                      >
                        読み込み
                      </button>
                      <button
                        onClick={() => shareSong(item.name)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs border border-slate-700"
                      >
                        共有
                      </button>
                      <button
                        onClick={() => deleteSong(item.name)}
                        className="px-2.5 py-1 bg-rose-950 text-rose-300 border border-rose-800 rounded text-xs"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                ))}
                {!savedList.length && <p className="text-xs text-slate-500">保存されたプロジェクトはありません</p>}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
