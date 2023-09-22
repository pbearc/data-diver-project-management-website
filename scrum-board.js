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

document.getElementById("createSprintButton").addEventListener("click", () => {
    // Generate a unique sprint name or ID, you can use a timestamp for simplicity
    const sprintName = `Sprint ${Date.now()}`;

    console.log("Success")
  
    // Get a reference to the "sprints" collection in Firestore
    const sprintsCollection = collection(db, "sprints");
  
    // Add a new document with a unique ID to the "sprints" collection
    addDoc(sprintsCollection, {
      name: sprintName,
      date: new Date().toLocaleDateString(), // You can format the date as desired
    })
      .then((docRef) => {
        console.log("Sprint created with ID: ", docRef.id);
        window.location.href = `sprint-backlog.html?id=${docRef.id}`;
      })
      .catch((error) => {
        console.error("Error adding sprint: ", error);
      });
});

function displaySprintBacklogs() {
  const sprintsContainer = document.getElementById("sprintsContainer");

  // Reference to the "sprints" collection in Firestore
  const sprintsCollection = collection(db, "sprints");

  // Get all documents in the "sprints" collection
  getDocs(sprintsCollection)
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const sprintData = doc.data();
        // Create a card or element to display sprintData.name and sprintData.date
        const sprintCard = document.createElement("div");
        const sprintId = doc.id; // Extract the sprintId here
        sprintCard.innerHTML = `
          <div class="card" data-sprint-id="${sprintId}"> <!-- Add data-sprint-id attribute -->
            <div class="card-body">
              <h5 class="card-title">${sprintData.name}</h5>
              <p class="card-text">${sprintData.date}</p>
            </div>
          </div>
        `;
        sprintsContainer.appendChild(sprintCard);

        // Attach a click event listener to the card
        sprintsContainer.addEventListener("click", (event) => {
          // Find the closest parent with the class "card"
          const sprintCard = event.target.closest(".card");
      
          // Extract the sprintId from the card's data-sprint-id attribute
          const clickedSprintId = sprintCard.getAttribute("data-sprint-id")
          
          // Check if the data-sprint-id attribute exists
          if (clickedSprintId) {
            console.log("data-sprint-id exists:", clickedSprintId);
            // Construct the URL with the sprintId parameter and navigate to the Sprint Backlog page
            window.location.href = `sprint-backlog.html?id=${clickedSprintId}`;
          } else {
            console.log("data-sprint-id does not exist");
          }
        });
        
      });
    })
    .catch((error) => {
      console.error("Error fetching sprint backlogs: ", error);
    });
}

// Call the function to display Sprint Backlogs when the page loads
window.addEventListener("load", () => {
  displaySprintBacklogs();
});

