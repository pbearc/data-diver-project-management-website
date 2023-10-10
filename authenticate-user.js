import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  query as firestoreQuery,
  where,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBbyuRShsNdaTzIcuKKzlvTDl8bCDr8pJY",
  authDomain: "fit2101-project-database.firebaseapp.com",
  databaseURL:
    "https://fit2101-project-database-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fit2101-project-database",
  storageBucket: "fit2101-project-database.appspot.com",
  messagingSenderId: "841276992676",
  appId: "1:841276992676:web:c7761b64a8d7d43d230a31",
  measurementId: "G-9936B4VLCD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig, "Data Diver");
const db = getFirestore(app, { experimentalAutoDetectLongPolling: true, });


// Function to navigate to product backlog page
function navigateToProductBacklog() {
    window.location.href = "product-backlog.html";
  }

// Function to authenticate the user
async function authenticateUser(username, password) {
    const usersCollection = collection(db, "users");
    const querySnapshot = await getDocs(usersCollection);
  
    let isAuthenticated = false;
  
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.username === username && userData.password === password) {
        isAuthenticated = true;
      }
    });
  
    return isAuthenticated;
  }
  
  const loginButton = document.getElementById("loginButton");
  
  if (loginButton) {
    loginButton.addEventListener("click", async () => {
      const username = document.getElementById("userUsername").value;
      const password = document.getElementById("userPassword").value;
  
      if (username === "" || password === "") {
        alert("Please fill in both username and password.");
        return;
      }
  
      const isAuthenticated = await authenticateUser(username, password);
  
      if (isAuthenticated) {
        //navigateToProductBacklog();
        window.location.href = "product-backlog.html"
      } else {
        alert("Invalid username or password");
      }
    });
  }

  
  

