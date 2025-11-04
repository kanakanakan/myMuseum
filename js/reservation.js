// js/reservation.js
import { auth, db, doc, getDoc } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// --- 要素取得 ---
const titleElement = document.querySelector("title");
const heading = document.querySelector(".reservation__heading");
const museumDetails = document.querySelector(".js-details");
const reservationForm = document.querySelector(".js-form");

// --- URLパラメータ ---
const urlParams = new URLSearchParams(window.location.search);
const museumId = urlParams.get("museumId");

// --- 戻るボタンのリンクを設定 ---
const backBtn = document.querySelector(".reservation__btn");
if (backBtn) {
  backBtn.href = museumId ? `./museum.html?museumId=${museumId}` : "./museums.html";
}

// --- ログイン状態の確認 ---
let currentUser = null;
onAuthStateChanged(auth, (user) => {
  currentUser = user || null;
});

// --- ページタイトル・見出し設定 ---
if (museumId) {
  titleElement.textContent = "予約 / チケット購入 - わたしの博物館";
  heading.textContent = "予約 / チケット購入";
  loadMuseumDetails(museumId);
} else {
  museumDetails.innerHTML = "<p>博物館が選択されていません。</p>";
}

// --- Firestoreから博物館情報を取得 ---
async function loadMuseumDetails(museumId) {
  try {
    const museumRef = doc(db, "museums", museumId);
    const museumSnap = await getDoc(museumRef);

    if (!museumSnap.exists()) {
      museumDetails.innerHTML = "<p>該当する博物館が見つかりません。</p>";
      return;
    }

    const museum = museumSnap.data();
    displayMuseumDetails(museum);
  } catch (error) {
    console.error("Error loading museum:", error);
    museumDetails.innerHTML = "<p>情報の読み込み中にエラーが発生しました。</p>";
  }
}

// --- 博物館情報を表示 ---
function displayMuseumDetails(museum) {
  museumDetails.innerHTML = `
    <div class="museum-card">
      <h3 class="museum-title">${museum.title || "名称未設定"}</h3>
      <p class="museum-date detail"><strong>会期</strong>${museum.date || "未定"}</p>
      <p class="museum-price detail"><strong>料金</strong>${museum.priceYen ? museum.priceYen + "円" : "無料"}</p>
    </div>
  `;
}

// --- フォーム送信 ---
reservationForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser) return alert("予約にはログインが必要です。");

  const name = reservationForm.name.value.trim();
  const email = reservationForm.email.value.trim();
  const contact = reservationForm.contact.value.trim();
  const date = reservationForm.date.value;
  const payment = reservationForm.payment.value;
  const remarks = reservationForm.remarks.value.trim();

  if (!name || !email || !contact || !date || !payment) {
    return alert("すべての項目を入力してください。");
  }

  const reservationData = {
    userId: currentUser.uid,
    museumId,
    name,
    email,
    contact,
    date,
    payment,
    remarks,
    createdAt: Date.now(),
    category: "ticket_buyer",
  };

  sessionStorage.setItem("reservationData", JSON.stringify(reservationData));
  window.location.href = "./reservationConfirm.html";
});
