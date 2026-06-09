す// フロントエンドでプロンプトのカテゴリーを管理
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




