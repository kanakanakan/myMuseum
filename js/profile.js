import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  updateEmail,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyA8WauCKutQwzK2kkBPprzwWoy7p9cAXVE",
  authDomain: "akiya-app-e7a9b.firebaseapp.com",
  projectId: "akiya-app-e7a9b",
  storageBucket: "akiya-app-e7a9b.firebasestorage.app",
  messagingSenderId: "665091929996",
  appId: "1:665091929996:web:720cedd79b1ba1e4c748a9",
};

// 初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const profileForm = document.getElementById("profileForm");

// 認証状態を確認してフォームに初期値を入れる
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      document.getElementById("name").value = data.name || "";
      document.getElementById("kana").value = data.kana || "";
      document.getElementById("postal").value = data.postal || "";
      document.getElementById("prefecture").value = data.prefecture || "";
      document.getElementById("city").value = data.city || "";
      document.getElementById("address").value = data.address || "";
      document.getElementById("building").value = data.building || "";
      document.getElementById("email").value = user.email || "";
    }
  } else {
    // 未ログインの場合はログインページへ
    window.location.href = "login.html";
  }
});

// 保存ボタン押下時
profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;

  const updatedData = {
    name: document.getElementById("name").value,
    kana: document.getElementById("kana").value,
    postal: document.getElementById("postal").value,
    prefecture: document.getElementById("prefecture").value,
    city: document.getElementById("city").value,
    address: document.getElementById("address").value,
    building: document.getElementById("building").value,
  };

  try {
    // Firestore に保存
    await setDoc(doc(db, "users", user.uid), updatedData, { merge: true });

    // Firebase Authentication の表示名とメールも更新
    await updateProfile(user, { displayName: updatedData.name });
    await updateEmail(user, document.getElementById("email").value);

    alert("プロフィールを更新しました！");
  } catch (error) {
    console.error(error);
    alert("更新に失敗しました: " + error.message);
  }
});
