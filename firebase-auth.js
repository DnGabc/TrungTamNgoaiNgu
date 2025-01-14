// Import Firebase Authentication và Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
import { getDatabase, ref, get, child, set, remove, update } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-database.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js";

// Cấu hình Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDd-fLNsiaxCSpY61QEedbwyY8Pz5hJ_bs",
    authDomain: "trungtamngoaingu-cd14a.firebaseapp.com",
    projectId: "trungtamngoaingu-cd14a",
    storageBucket: "trungtamngoaingu-cd14a.appspot.com",
    messagingSenderId: "723107120038",
    appId: "1:723107120038:web:e005fe2ae193c56fd60567",
    measurementId: "G-1VFSJP3QGN",
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Hàm tạo mã học viên ngẫu nhiên theo kiểu HV0000
function generateUserId() {
    const randomNum = Math.floor(10000 + Math.random() * 90000); // Tạo số ngẫu nhiên từ 10000 đến 99999
    return `ND${randomNum.toString().slice(-4)}`; // Trả về mã học viên
}

// Hàm kiểm tra mã học viên đã tồn tại
async function isUserIdExists(userId) {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, 'User'));
    if (snapshot.exists()) {
        const users = snapshot.val();
        return Object.values(users).some(user => user.MaNguoiDung === userId); // Kiểm tra mã học viên
    }
    return false;
}

// Xử lý đăng ký
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Ngăn việc submit form truyền thống

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        // Kiểm tra xem mật khẩu và xác nhận mật khẩu có khớp hay không
        if (password !== confirmPassword) {
            alert("Mật khẩu không khớp!");
            return;
        }

        let newUserId;

        do {
            newUserId = generateUserId(); // Tạo mã học viên mới
        } while (await isUserIdExists(newUserId)); // Kiểm tra mã học viên đã tồn tại chưa

        // Đăng ký người dùng bằng email và password
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("User registered:", user);

                // Gửi email xác thực
                sendEmailVerification(user)
                    .then(() => {
                        alert("Đăng ký thành công! Vui lòng kiểm tra email của bạn để xác thực.");

                        // const userId = user.uid; // Lấy ID người dùng
                        set(ref(database, 'User/' + newUserId), {
                            MaNguoiDung: newUserId,
                            Email: email,
                            Password: password,
                            Role: 'Quản trị viên',
                        })
                    })
                    .catch((error) => {
                        console.error("Lỗi khi gửi email xác thực:", error);
                        alert("Có lỗi xảy ra khi gửi email xác thực: " + error.message);
                    });
            })
            .catch((error) => {
                console.error("Lỗi trong quá trình đăng ký:", error);
                alert("Đăng ký thất bại: " + error.message);
            });
    });
}

// Xử lý đăng nhập
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Ngăn việc submit form truyền thống

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        // Đăng nhập người dùng
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("User logged in:", user);

                // Kiểm tra xác thực email
                if (!user.emailVerified) {
                    alert("Vui lòng xác thực email trước khi đăng nhập.");
                } else {
                    // Lưu email vào localStorage
                    localStorage.setItem("userEmail", user.email);
                    // Chuyển sang trang chủ
                    window.location.href = "index.html"; // Thay "index.html" bằng trang chủ của bạn
                }
            })
            .catch((error) => {
                console.error("Lỗi trong quá trình đăng nhập:", error);
                alert("Đăng nhập thất bại: " + error.message);
            });
    });
}



// Xử lý quên mật khẩu
const resetPasswordForm = document.getElementById("resetPasswordForm");
if (resetPasswordForm) {
    resetPasswordForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Ngăn việc submit form truyền thống

        const email = document.getElementById("resetEmail").value;

        // Gửi email đặt lại mật khẩu
        sendPasswordResetEmail(auth, email)
            .then(() => {
                alert("Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn.");
            })
            .catch((error) => {
                console.error("Lỗi trong quá trình gửi email đặt lại mật khẩu:", error);
                alert("Có lỗi xảy ra: " + error.message);
            });
    });
}

// Xử lý đăng xuất
const logoutButton = document.getElementById("logoutBtn");
if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        signOut(auth)
            .then(() => {
                // Đăng xuất thành công
                console.log("User logged out successfully.");

                // Chuyển hướng về trang đăng nhập
                window.location.href = "login.html";
            })
            .catch((error) => {
                // Xử lý lỗi nếu có
                console.error("Lỗi khi đăng xuất:", error);
                alert("Có lỗi xảy ra khi đăng xuất: " + error.message);
            });
    });
}



