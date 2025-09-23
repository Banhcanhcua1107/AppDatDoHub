// import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
// import { auth, db } from "./firebase";
// import { doc, setDoc } from "firebase/firestore";

// // Đăng ký
// export const registerUser = async (email: string, password: string) => {
//   const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//   const user = userCredential.user;

//   // Lưu thêm vào Firestore
//   await setDoc(doc(db, "users", user.uid), {
//     email: user.email,
//     createdAt: new Date(),
//   });

//   return user;
// };

// // Đăng nhập
// export const loginUser = async (email: string, password: string) => {
//   const userCredential = await signInWithEmailAndPassword(auth, email, password);
//   return userCredential.user;
// };
