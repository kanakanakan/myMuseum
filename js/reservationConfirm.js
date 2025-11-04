// js/reservationConfirm.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { collection, addDoc, serverTimestamp, Timestamp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const confirmationDiv = document.getElementById("confirmationDetails");
const finalConfirmBtn = document.getElementById("finalConfirmBtn");

// 支払い方法の日本語変換
function translatePayment(payment) {
  const paymentMap = {
    'credit_card': 'クレジットカード',
    'bank_transfer': '銀行振込',
    'cash': '現金',
    'convenience_store': 'コンビニ支払い'
  };
  return paymentMap[payment] || payment;
}

// sessionStorage から予約データ取得
const reservationData = JSON.parse(sessionStorage.getItem("reservationData"));

if (!reservationData) {
  confirmationDiv.innerHTML = "<p>予約情報が見つかりません。</p>";
  finalConfirmBtn.style.display = "none";
} else {
  const dateObj = new Date(reservationData.date);
  const formattedDate = dateObj.toLocaleDateString("ja-JP", {
    year: "numeric", month: "long", day: "numeric", weekday: "short"
  });

  confirmationDiv.innerHTML = `
    <p class="reservation-item"><strong>お名前</strong> ${reservationData.name}</p>
    <p class="reservation-item"><strong>メールアドレス</strong> ${reservationData.email}</p>
    <p class="reservation-item"><strong>電話番号</strong> ${reservationData.contact}</p>
    <p class="reservation-item"><strong>予約日</strong> ${formattedDate}</p>
    <p class="reservation-item"><strong>お支払い方法</strong> ${translatePayment(reservationData.payment)}</p>
    <p class="reservation-item"><strong>備考</strong> ${reservationData.remarks || "なし"}</p>
  `;
}

// 認証チェック
let currentUser = null;
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("予約を確定するにはログインが必要です。");
    finalConfirmBtn.disabled = true;
    return;
  }
  currentUser = user;
});

// 予約確定
finalConfirmBtn.addEventListener("click", async () => {
  if (!currentUser || !reservationData) return;

  const dateObj = new Date(reservationData.date);
  const dataToSave = {
    ...reservationData,
    userId: currentUser.uid,
    date: Timestamp.fromDate(dateObj),
    status: "pending",
    createdAt: serverTimestamp(),
  };

  try {
    const resRef = await addDoc(collection(db, "reservations"), dataToSave);

    confirmationDiv.innerHTML = `
      <div class="ticket-card">
        <h3 class="reservationConfirm-title">予約が完了しました！</h3>
        <p class="detail"><strong>予約番号</strong> ${resRef.id}</p>
        <p class="detail"><strong>お名前</strong> ${reservationData.name}</p>
        <p class="detail"><strong>メールアドレス</strong> ${reservationData.email}</p>
        <p class="detail"><strong>電話番号</strong> ${reservationData.contact}</p>
        <p class="detail"><strong>予約日</strong> ${dateObj.toLocaleDateString("ja-JP", {
          year: "numeric", month: "long", day: "numeric", weekday: "short"
        })}</p>
        <p class="detail"><strong>お支払い方法</strong> ${translatePayment(reservationData.payment)}</p>
        <p class="detail"><strong>備考</strong> ${reservationData.remarks || "なし"}</p>
      </div>
      <button id="backBtn">トップページに戻る</button>
    `;

    sessionStorage.removeItem("reservationData");
    finalConfirmBtn.style.display = "none";

    document.getElementById("backBtn").addEventListener("click", () => {
      window.location.href = "index.html";
    });
  } catch (err) {
    console.error(err);
    alert("予約の保存中にエラーが発生しました。");
  }
});
