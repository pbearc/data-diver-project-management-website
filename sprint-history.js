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
const db = getFirestore(app);
// Array to store past sprints
const pastSprints = [
    {
        name: "Sprint 1",
        startDate: "2023-08-01",
        endDate: "2023-08-15",
    },
    {
        name: "Sprint 2",
        startDate: "2023-08-16",
        endDate: "2023-08-30",
    },
    {
        name: "Sprint 3",
        startDate: "2023-09-01",
        endDate: "2023-09-15",
    },
];

// Function to display past sprints
function displayPastSprints() {
    const sprintList = document.getElementById("sprintList");

    pastSprints.forEach((sprint) => {
        const sprintCard = document.createElement("div");
        sprintCard.classList.add("card");
        sprintCard.classList.add("past-sprint-card"); // Add the class name "past-sprint-card"
        sprintCard.classList.add("mb-3");

        sprintCard.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${sprint.name}</h5>
                <p class="card-text"><strong>Start Date:</strong> ${sprint.startDate}</p>
                <p class="card-text"><strong>End Date:</strong> ${sprint.endDate}</p>
            </div>
        `;

        sprintList.appendChild(sprintCard);
    });
}

// Call the function to display past sprints when the page loads
document.addEventListener("DOMContentLoaded", () => {
    displayPastSprints();
});
