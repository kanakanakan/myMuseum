// ▼ 住所フィルタ用の変数
let currentPref = "";
let currentCity = "";

// ▼ 都道府県ごとの主要都市リスト
const prefToCities = {
  "東京都": ["新宿区", "八王子市", "町田市"],
  "大阪府": ["大阪市", "堺市", "東大阪市"],
  "愛知県": ["名古屋市", "豊田市", "岡崎市"],
  "北海道": ["札幌市", "函館市", "旭川市"],
  "福岡県": ["福岡市", "北九州市", "久留米市"],
};

// ▼ DOM要素を取得
const prefSelect = document.getElementById("pref-select");
const citySelect = document.getElementById("city-select");

// ▼ 都道府県が選ばれたとき
prefSelect.addEventListener("change", () => {
  currentPref = prefSelect.value;
  currentCity = "";

  citySelect.innerHTML = "";
  if (!currentPref) {
    citySelect.disabled = true;
    citySelect.innerHTML = "<option value=''>先に都道府県を選択してください</option>";
  } else {
    citySelect.disabled = false;
    prefToCities[currentPref].forEach((city) => {
      const opt = document.createElement("option");
      opt.value = city;
      opt.textContent = city;
      citySelect.appendChild(opt);
    });
  }
  updateList(); // ← 一覧を更新
});

// ▼ 市が選ばれたとき
citySelect.addEventListener("change", () => {
  currentCity = citySelect.value;
  updateList(); // ← 一覧を更新
});

// ▼ updateList の中に追加するフィルタ条件
// ※既存の updateList 内に以下を組み込んでください
/*
if (currentPref) {
  filtered = filtered.filter((h) => h.address?.prefecture === currentPref);
}
if (currentCity) {
  filtered = filtered.filter((h) => h.address?.city === currentCity);
}
*/
