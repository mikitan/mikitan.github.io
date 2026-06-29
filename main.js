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


