// js/applicationConfirm.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { collection, addDoc, serverTimestamp, Timestamp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const confirmationDiv = document.getElementById("confirmationDetails");
const finalConfirmBtn = document.getElementById("finalConfirmBtn");

// 支払い方法の日本語変換
function translatePayment(payment) {
  const paymentMap = {
    credit_card: "クレジットカード",
    paypal: "PayPal（ペイパル）",
    paypay: "PayPay（ペイペイ）",
    cash: "現金支払い",
  };
  return paymentMap[payment] || payment;
}

// sessionStorage から申し込みデータ取得
const applicationData = JSON.parse(sessionStorage.getItem("applicationData"));

if (!applicationData) {
  confirmationDiv.innerHTML = "<p>申し込み情報が見つかりません。</p>";
  finalConfirmBtn.style.display = "none";
} else {
  const paymentLabel = translatePayment(applicationData.payment);

  confirmationDiv.innerHTML = `
    <p class="application-item"><strong>お名前</strong> ${applicationData.name}</p>
    <p class="application-item"><strong>メールアドレス</strong> ${applicationData.email}</p>
    <p class="application-item"><strong>電話番号</strong> ${applicationData.contact}</p>
    <p class="application-item"><strong>お支払い方法</strong> ${paymentLabel}</p>
    <p class="application-item"><strong>備考</strong> ${applicationData.remarks || "なし"}</p>
  `;
}

// 認証チェック
let currentUser = null;
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("申し込みを確定するにはログインが必要です。");
    finalConfirmBtn.disabled = true;
    return;
  }
  currentUser = user;
});

// 申し込み確定
finalConfirmBtn.addEventListener("click", async () => {
  if (!currentUser || !applicationData) return;

  // 日付データがある場合は Timestamp に変換
  const applicationDate = applicationData.date ? Timestamp.fromDate(new Date(applicationData.date)) : null;

  const dataToSave = {
    ...applicationData,
    userId: currentUser.uid,
    date: applicationDate,
    status: "pending",
    createdAt: serverTimestamp(),
  };

  try {
    const resRef = await addDoc(collection(db, "applications"), dataToSave);
    const paymentLabel = translatePayment(applicationData.payment);

    // 完了画面を表示し、戻るボタンを追加
    confirmationDiv.innerHTML = `
      <div class="ticket-card">
        <h3 class="applicationConfirm-title">申し込みが完了しました！</h3>
        <p class="detail"><strong>申し込み番号</strong> ${resRef.id}</p>
        <p class="detail"><strong>お名前</strong> ${applicationData.name}</p>
        <p class="detail"><strong>メールアドレス</strong> ${applicationData.email}</p>
        <p class="detail"><strong>電話番号</strong> ${applicationData.contact}</p>
        ${applicationDate ? `<p><strong>申し込み日</strong> ${new Date(applicationData.date).toLocaleDateString("ja-JP")}</p>` : ""}
        <p class="detail"><strong>お支払い方法</strong> ${paymentLabel}</p>
        <p class="detail"><strong>備考</strong> ${applicationData.remarks || "なし"}</p>
        <button id="backBtn">トップページに戻る</button>
      </div>
    `;

    sessionStorage.removeItem("applicationData");
    finalConfirmBtn.style.display = "none";

    document.getElementById("backBtn").addEventListener("click", () => {
      window.location.href = "index.html";
    });

  } catch (err) {
    console.error(err);
    alert("申し込みの保存中にエラーが発生しました。");
  }
});
