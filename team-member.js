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
  getDoc,
  orderBy,
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
const productBacklogButton = document.getElementById("product_backlog_button");
const scumboardButton = document.getElementById("scrum_board_button");
const teamMemberButton = document.getElementById("team_member_button");

scumboardButton.addEventListener("click", () => {
  const routeTo = "scrum-board.html";
  const username = window.history.state.username;
  const admin = window.history.state.isAdmin;
  window.history.pushState({ username: username, isAdmin: admin }, "", routeTo);
  window.location.href = routeTo; // Redirect to the desired page
});

productBacklogButton.addEventListener("click", () => {
  const routeTo = "product-backlog.html";
  const username = window.history.state.username;
  const admin = window.history.state.isAdmin;
  window.history.pushState({ username: username, isAdmin: admin }, "", routeTo);
  window.location.href = routeTo; // Redirect to the desired page
});

teamMemberButton.addEventListener("click", () => {
  const routeTo = "team-member.html";
  const username = window.history.state.username;
  const admin = window.history.state.isAdmin;
  window.history.pushState({ username: username, isAdmin: admin }, "", routeTo);
  window.location.href = routeTo; // Redirect to the desired page
});

const addTeamMemberButton = document.getElementById("addTeamMemberButton");

addTeamMemberButton.addEventListener("click", () => {
  window.location.href = "account-creation.html"; // Redirect to the account creation page
});

function displayTeamMembers() {
  const teamMembersContainer = document.getElementById("teamMembersContainer");
  const teamMembersCollection = collection(db, "users");

  // Get all documents in the "sprints" collection
  getDocs(teamMembersCollection)
    .then((querySnapshot) => {
      querySnapshot.forEach(async (docs) => {
        const teamMemberData = docs.data();
        const teamMemberId = docs.id; // Extract the sprintId here

        // Create a card or element to display sprintData.name and sprintData.date
        const teamMemberCard = document.createElement("div");
        teamMemberCard.className = "card"; // Add class for styling
        teamMemberCard.setAttribute("data-sprint-id", teamMemberId);

        // Card body
        const cardBody = document.createElement("div");
        cardBody.className = "card-body";
        cardBody.innerHTML = `
          <h6 class="card-title">${teamMemberData.username}</h6>
          <p class="card-text">${
            teamMemberData.isAdmin ? "Admin" : "Member"
          }</p>
        `;

        // Append close button and card body to the card
        teamMemberCard.appendChild(cardBody);

        // Append the card to the container
        teamMembersContainer.appendChild(teamMemberCard);

        // // Attach a click event listener to the card
        // teamMemberCard.addEventListener("click", () => {
        //   // Construct the URL with the sprintId parameter and navigate to the Sprint Backlog page
        //   const routeTo = `team-member-details.html?id=${teamMemberId}`;
        //   const username = window.history.state.username;
        //   const admin = window.history.state.isAdmin;
        //   window.history.pushState(
        //     { username: username, isAdmin: admin },
        //     "",
        //     routeTo
        //   );
        //   window.location.href = routeTo; // Redirect to the desired page
        // });
      });
    })
    .catch((error) => {
      console.error("Error fetching team member: ", error);
    });
}

// const createAccountButton = document.getElementById("create_account_button");
// const checkAdmin = window.history.state.isAdmin;
// if (checkAdmin === "true") {
//   createAccountButton.style.display = "block"; // Show the button
//   createAccountButton.addEventListener("click", () => {
//     const routeTo = "account-creation.html";
//     const username = window.history.state.username;
//     const admin = window.history.state.isAdmin;
//     window.history.pushState(
//       { username: username, isAdmin: admin, previousPage: "scrum-board.html" },
//       "",
//       routeTo
//     );
//     window.location.href = routeTo;
//   });
// } else {
//   createAccountButton.style.display = "hide"; // Hide the button
// }

// Call the function to display Sprint Backlogs when the page loads
window.addEventListener("load", () => {
  displayTeamMembers();
});
