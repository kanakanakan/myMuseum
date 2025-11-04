// js/application.js
import { auth, db, doc, getDoc, collection, getDocs } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// --- 要素取得 ---
const titleElement = document.querySelector("title");
const heading = document.querySelector(".application__heading");
const houseDetails = document.querySelector(".js-details");
const applicationForm = document.querySelector(".js-form");

// --- URLパラメータ ---
const urlParams = new URLSearchParams(window.location.search);
const houseId = urlParams.get("houseId");
const roomId = urlParams.get("roomId");

// --- 戻るボタンのリンクを設定 ---
const backBtn = document.querySelector(".application__btn");
if (backBtn) {
  backBtn.href = houseId ? `./house.html?houseId=${houseId}` : "./houses.html";
}

// --- ログイン状態の確認 ---
let currentUser = null;
onAuthStateChanged(auth, (user) => {
  currentUser = user || null;
});

// --- ページタイトル・見出し設定 ---
if (houseId && roomId) {
  titleElement.textContent = "申し込み - わたしの博物館";
  heading.textContent = "申し込み";
  loadHouseDetails(houseId, roomId);
} else {
  houseDetails.innerHTML = "<p>空き家または部屋が選択されていません。</p>";
}

// --- Firestoreから空き家情報と部屋情報を取得 ---
async function loadHouseDetails(houseId, roomId) {
  try {
    const houseRef = doc(db, "houses", houseId);
    const houseSnap = await getDoc(houseRef);

    if (!houseSnap.exists()) {
      houseDetails.innerHTML = "<p>該当する空き家が見つかりません。</p>";
      return;
    }

    const house = houseSnap.data();
    const roomsRef = collection(db, "houses", houseId, "rooms");
    const roomsSnap = await getDocs(roomsRef);
    const rooms = roomsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const selectedRoom = rooms.find((r) => r.id === roomId);

    if (!selectedRoom) {
      houseDetails.innerHTML = "<p>該当する部屋が見つかりません。</p>";
      return;
    }

    displayHouseDetails(house, selectedRoom);
  } catch (error) {
    console.error("Error loading house:", error);
    houseDetails.innerHTML = "<p>情報の読み込み中にエラーが発生しました。</p>";
  }
}

// --- 空き家＋部屋情報を表示 ---
function displayHouseDetails(house, room) {
  houseDetails.innerHTML = `
    <div class="house-card">
      <h3 class="house-title">${house.title || "名称未設定"}</h3>
      <div class="house-room-card">
        <p class="detail"><strong>部屋名</strong> ${room.name || "-"}</p>
        <p class="detail"><strong>料金</strong> ${room.priceYen ? room.priceYen + "円" : "無料"}</p>
        <p class="detail"><strong>面積</strong> ${room.area || "-"}</p>
        <p class="detail"><strong>階数</strong> ${room.floor || "-"}</p>
      </div>
    </div>
  `;
}

// --- フォーム送信（確認画面へ遷移）---
applicationForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!currentUser) {
    alert("申し込みにはログインが必要です。");
    return;
  }

  const name = applicationForm.name.value.trim();
  const email = applicationForm.email.value.trim();
  const contact = applicationForm.contact.value.trim();
  const payment = applicationForm.payment.value;
  const remarks = applicationForm.remarks.value.trim();

  if (!name || !email || !contact || !payment) {
    alert("必須項目をすべて入力してください。");
    return;
  }

  const applicationData = {
    userId: currentUser.uid,
    houseId,
    roomId,
    name,
    email,
    contact,
    payment,
    remarks,
    createdAt: Date.now(),
    category: "renter",
  };

  sessionStorage.setItem("applicationData", JSON.stringify(applicationData));
  window.location.href = "./applicationConfirm.html";
});
