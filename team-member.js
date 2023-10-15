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
  query,
  where,
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
  const dropdownMenu = document.getElementById("teamMemberDropdown");
  const selectedUser = dropdownMenu.value; // Assuming you have a dropdown menu with the id 'dropdownMenu'

  // Fetch the user data from the 'users' collection based on the selectedUser
  const usersCollection = collection(db, "users");
  const userQuery = query(
    usersCollection,
    where("username", "==", selectedUser)
  ); // Rename the variable here
  getDocs(userQuery) // Use the new variable here
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        saveToUsersAdded(userData);
      });
    })
    .catch((error) => {
      console.error("Error fetching user: ", error);
    });
});

function saveToUsersAdded(userData) {
  const usersAddedCollection = collection(db, "users_added");
  const { username, isAdmin } = userData; // Extract the necessary fields from the userData
  const data = { username, isAdmin };

  addDoc(usersAddedCollection, data)
    .then((docRef) => {
      console.log("Document written with ID: ", docRef.id);
      displayTeamMembers(); // Call the display function after the new member is added
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    });
}

async function displayTeamMembersInDropdown() {
  const usersSnapshot = await getDocs(collection(db, "users"));
  const usersAddedSnapshot = await getDocs(collection(db, "users_added"));
  const dropdown = document.getElementById("teamMemberDropdown");
  dropdown.innerHTML = "";

  const usersAddedUsernames = usersAddedSnapshot.docs.map(
    (doc) => doc.data().username
  );

  if (usersAddedUsernames.length === usersSnapshot.size) {
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.text = "All team members added";
    dropdown.appendChild(defaultOption);
  } else {
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (!usersAddedUsernames.includes(data.username)) {
        const option = document.createElement("option");
        option.value = data.username;
        option.text = data.username;
        dropdown.appendChild(option);
      }
    });
  }
}

function displayTeamMembers() {
  const teamMembersContainer = document.getElementById("teamMembersContainer");
  teamMembersContainer.innerHTML = ""; // Clear the container before adding new members

  const usersAddedCollection = collection(db, "users_added");

  getDocs(usersAddedCollection)
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const teamMemberData = doc.data();
        const teamMemberId = doc.id; // Extract the team member's ID here

        // Create a card or element to display the team member's data
        const teamMemberCard = document.createElement("div");
        teamMemberCard.className = "card"; // Add class for styling
        teamMemberCard.setAttribute("data-team-member-id", teamMemberId);

        // Card body
        const cardBody = document.createElement("div");
        cardBody.className = "card-body";
        cardBody.innerHTML = `
          <h6 class="card-title">${teamMemberData.username}</h6>
          <p class="card-text">${
            teamMemberData.isAdmin ? "Admin" : "Member"
          }</p>
        `;

        // Append card body to the card
        teamMemberCard.appendChild(cardBody);

        // Append the card to the container
        teamMembersContainer.appendChild(teamMemberCard);
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
  displayTeamMembersInDropdown();
  displayTeamMembers();

  const usersAddedCollection = collection(db, "users_added");
  onSnapshot(usersAddedCollection, () => {
    displayTeamMembersInDropdown();
  });
});
