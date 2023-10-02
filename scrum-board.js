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
  
    // Get a reference to the "sprints" collection in Firestore
    const sprintsCollection = collection(db, "sprints");
  
    // Add a new document with a unique ID to the "sprints" collection
    addDoc(sprintsCollection, {
      name: sprintName,
      date: new Date().toLocaleDateString(), // You can format the date as desired
      notStarted: [],
      inProgress: [],
      completed: [],
      addedTaskID:[],
      removedTaskID: [],
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
      querySnapshot.forEach((docs) => {
        const sprintData = docs.data();
        const sprintId = docs.id; // Extract the sprintId here

        // Create a card or element to display sprintData.name and sprintData.date
        const sprintCard = document.createElement("div");
        sprintCard.className = "card"; // Add class for styling
        sprintCard.setAttribute("data-sprint-id", sprintId);

        // Close button
        const closeButton = document.createElement("div");
        closeButton.className = "close-button";
        closeButton.innerText = "x";
        closeButton.addEventListener("click", async(event) => {
          // Prevent the click event from propagating to the card click event
          event.stopPropagation();
          const confirmDelete = confirm("Do you want to delete this sprint?");
          if (confirmDelete) {
            await deleteDoc(doc(db, "sprints", sprintId));

            sprintCard.remove();
          }
        });
        
        // Card body
        const cardBody = document.createElement("div");
        cardBody.className = "card-body";
        cardBody.innerHTML = `
          <h5 class="card-title">${sprintData.sprintName}</h5>
          <p class="card-text">${sprintData.startDate} - ${sprintData.endDate}</p>
          
        `;
        
        // Append close button and card body to the card
        sprintCard.appendChild(closeButton);
        sprintCard.appendChild(cardBody);

        // Append the card to the container
        sprintsContainer.appendChild(sprintCard);

        // Attach a click event listener to the card
        sprintCard.addEventListener("click", () => {
          // Construct the URL with the sprintId parameter and navigate to the Sprint Backlog page
          window.location.href = `sprint-backlog.html?id=${sprintId}`;
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

