// public/js/auth.js
import { auth, db } from './firebase.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submitBtn');
const formTitle = document.getElementById('form-title');
const toggleForm = document.getElementById('toggleForm');
const toggleLink = document.getElementById('toggleLink');

let isLogin = true;

toggleLink.addEventListener('click', () => {
  isLogin = !isLogin;
  formTitle.textContent = isLogin ? "Login" : "Register";
  submitBtn.textContent = isLogin ? "Login" : "Register";
  toggleForm.innerHTML = isLogin
    ? `Don't have an account? <span id="toggleLink">Register</span>`
    : `Already have an account? <span id="toggleLink">Login</span>`;
  document.getElementById('toggleLink').addEventListener('click', () => toggleLink.click());
});

submitBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  try {
    if (isLogin) {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Logged in!");
      window.location.href = "main.html"; // redirect to main app
    } else {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCred.user.uid), {
        email: email,
        createdAt: new Date()
      });
      alert("Account created!");
      formTitle.textContent = "Login";
      submitBtn.textContent = "Login";
      isLogin = true;
    }
  } catch (err) {
    alert("Error: " + err.message);
  }
});
