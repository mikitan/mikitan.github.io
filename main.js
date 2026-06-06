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
