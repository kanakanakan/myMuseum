// js/auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore,
  setDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// =========================
// Firebase設定
// =========================
const firebaseConfig = {
  apiKey: "AIzaSyA8WauCKutQwzK2kkBPprzwWoy7p9cAXVE",
  authDomain: "akiya-app-e7a9b.firebaseapp.com",
  projectId: "akiya-app-e7a9b",
  storageBucket: "akiya-app-e7a9b.firebasestorage.app",
  messagingSenderId: "665091929996",
  appId: "1:665091929996:web:720cedd79b1ba1e4c748a9",
  measurementId: "G-JV28SYR2NL",
};

// =========================
// Firebase初期化
// =========================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// =========================
// サインアップフォーム
// =========================
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // フォーム値を取得
      const name = document.getElementById("name").value.trim();
      const furigana = document.getElementById("furigana").value.trim();
      const postalCode = document.getElementById("postalCode").value.trim();
      const prefecture = document.getElementById("prefecture").value.trim();
      const city = document.getElementById("city").value.trim();
      const address = document.getElementById("address").value.trim();
      const building = document.getElementById("building").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const adminCode = document.getElementById("adminCode").value.trim();

      try {
        // Firebase Authentication でユーザー作成
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // 表示名（name）を登録
        await updateProfile(userCredential.user, { displayName: name });

        // Firestore にユーザーデータ保存
        await setDoc(doc(db, "users", userCredential.user.uid), {
          createdAt: new Date(),
          email: email,
          name: name,
          furigana: furigana,
          postalCode: postalCode,
          prefecture: prefecture,
          city: city,
          address: address,
          building: building || "",
          isAdmin: adminCode === "1234ADMIN",
        });

        // 🔹 登録完了の alert を削除して、ホーム画面に直接遷移
        window.location.href = "index.html";

      } catch (error) {
        console.error(error);
        alert("登録に失敗しました: " + error.message);
      }
    });
  }



// =========================
// ログインフォーム
// =========================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("login__password").value.trim();

    try {
      await signInWithEmailAndPassword(auth, email, password);

      // ✅ alertは削除してスムーズにホーム画面へ遷移
      window.location.href = "index.html";
    } catch (error) {
      console.error(error);
      alert("ログインに失敗しました: " + error.message);
    }
  });
}

// =========================
// 認証状態の監視（デバッグ用）
// =========================
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("✅ ログイン中:", user.displayName || user.email);
  } else {
    console.log("🚪 ログアウト状態");
  }
});
