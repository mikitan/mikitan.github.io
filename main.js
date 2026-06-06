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



