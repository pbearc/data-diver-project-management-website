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

document.getElementById("createSprintButton").addEventListener("click", async () => {
  try {
      // Get a reference to the "sprints" and "modals" collections in Firestore
      const sprintsCollection = collection(db, "sprints");
      const modalsCollection = collection(db, "modals");

      // Add a new document with a unique ID to the "sprints" collection
      const sprintDocRef = await addDoc(sprintsCollection, {
          name: '',
          startDate: '', 
          endDate: '',
          notStarted: [],
          inProgress: [],
          completed: [],
          addedTaskID:[],
          removedTaskID: [],
          storyPoint: 0,
          modal: false,
      });

      // Add a new document with a unique ID to the "modals" collection
      const modalDocRef = await addDoc(modalsCollection, {
          sprint: sprintDocRef.id, // Store the sprint ID in the modal document
          sprintChartData: [],
      });

      // Redirect to the sprint backlog page with the sprint ID
      window.location.href = `sprint-backlog.html?id=${sprintDocRef.id}`;
  } catch (error) {
      console.error("Error adding sprint and modal: ", error);
  }
});

function displaySprintBacklogs() {
  const sprintsContainer = document.getElementById("sprintsContainer");
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

        const chartButton = document.createElement("div");
        chartButton.className = "chart-button";
        chartButton.innerText = "Burndown Chart";
        chartButton.addEventListener("click", async(event) => {
          // Prevent the click event from propagating to the card click event
          event.stopPropagation();
          if(sprintData.modal === false) {
            const modal = createAndDisplayModal(sprintId);
            // modal.style.display = "block";
          }
          else {
            
          }
        });

        // Card body
        const cardBody = document.createElement("div");
        cardBody.className = "card-body";
        cardBody.innerHTML = `
          <h5 class="card-title">${sprintData.name}</h5>
          <p class="card-text">${sprintData.startDate} - ${sprintData.endDate}</p>
        `;

        // Append close button and card body to the card
        sprintCard.appendChild(closeButton);
        sprintCard.appendChild(cardBody);
        sprintCard.appendChild(chartButton);

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

async function createAndDisplayModal(sprintId) {

  // Create modal
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <table class="table" style="background-color: white; margin-top: 20px;">
        <thead>
          <tr>
            <th style="text-align: center;">Date</th>
            <th style="text-align: center;">Ideal Remaining Tasks</th>
            <th style="text-align: center;">Actual Remaining Tasks</th>
          </tr>
        </thead>
        <tbody id="tableBody-${sprintId}" style="text-align: center;"></tbody>
      </table>
      <button class="addRowBtn" id="addRowBtn-${sprintId}">Add Row</button>
      <button class="saveRowBtn" id="saveRowBtn-${sprintId}">Save</button>
    </div>
  `;

  // // Modal close button functionality
  const closeButton = modal.querySelector(".close");
  closeButton.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Add event listener for the Add Row button (assuming you have logic for adding rows)
  const addRowBtn = modal.querySelector(`#addRowBtn-${sprintId}`);
  const tableBody = modal.querySelector(`#tableBody-${sprintId}`);
  addRowBtn.addEventListener("click", () => {
    const newRow = document.createElement('tr');

    // Add cells to the new row
    newRow.innerHTML = `
        <td><input type="date"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
    `;

    // Append the new row to the table body
    tableBody.appendChild(newRow);
  });

  const saveRowBtn = modal.querySelector(`#saveRowBtn-${sprintId}`);
  saveRowBtn.addEventListener("click", async () => {
    // Get data from input fields

    // Get all rows in the table
    const rows = modal.querySelectorAll('tr');

    const modalID = await findModalIdBySprintId(sprintId);

    const rowsCollection = collection(db, "modals", modalID, "rows");

    const querySnapshot = await getDocs(rowsCollection);
    querySnapshot.forEach((doc) => {
      deleteDoc(doc.ref);
      print("deleted")
});

    try {
        // Get a reference to the "rows" subcollection within the modal document
        const modalID = await findModalIdBySprintId(sprintId);
        const rowsCollection = collection(db, "modals", modalID, "rows");

        // Iterate through each row in the table
        rows.forEach(async (row) => {
            // Extract data from the current row's input fields and table cells
            const date = row.querySelector("input[type='date']").value;
            const idealRemainingTasks = row.querySelector('td:nth-child(2)').textContent;
            const actualRemainingTasks = row.querySelector('td:nth-child(3)').textContent;

            // Prepare data object for the current row
            const rowData = {
                date: date,
                idealRemainingTasks: idealRemainingTasks,
                actualRemainingTasks: actualRemainingTasks
            };

            // Add the row data as a new document in the "rows" subcollection
            await addDoc(rowsCollection, rowData);

            console.log("Row data added to subcollection 'rows':", rowData);
        });

        console.log("All row data added to subcollection 'rows'.");
    } catch (error) {
        console.error("Error adding row data:", error);
    }
  });

  // Append the "Add Row" button to the modal content
  modal.querySelector(".modal-content").appendChild(saveRowBtn);

  // Append the modal to the body or another container
  document.body.appendChild(modal);

  try {
    // Display the modal if it's not already displayed
    if (!modal.style.display || modal.style.display === "none") {
      modal.style.display = "block";
    }
  } catch (error) {
    console.error("Error displaying modal: ", error);
  }

  const modalId = await findModalIdBySprintId(sprintId);

  if (modalId) {
    const modalDocRef = doc(db, "modals", modalId);
    const modalDoc = await getDoc(modalDocRef);

    if (modalDoc.exists()) {
      const modalData = modalDoc.data();

      // Fetch the subcollection data within the modal document
      const rowsCollection = collection(db, "modals", modalId, "rows");
      const rowsSnapshot = await getDocs(rowsCollection);

      modalData.sprintChartData = [];

      // Iterate through subcollection documents and add them to modalData.rows
      rowsSnapshot.forEach((doc) => {
        modalData.sprintChartData.push(doc.data());
      });
      const entriesToRemove = modalData.sprintChartData.length

      await updateDoc(modalDocRef, { sprintChartData: modalData.sprintChartData });

      console.log(modalData.sprintChartData)

      for (let i = 0; i < entriesToRemove; i++) {
        const data = modalData.sprintChartData.pop();
        console.log(data);
        const tableBody = modal.querySelector(`#tableBody-${sprintId}`);
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
          <td><input type="date" value="${data.date}"></td>
          <td contenteditable="true">${data.idealRemainingTasks}</td>
          <td contenteditable="true">${data.actualRemainingTasks}</td>
        `;
        console.log(newRow)
        tableBody.appendChild(newRow);
      }
    }

  }

  return modal;
}

function findModalIdBySprintId(sprintId) {
  const modalsCollection = collection(db, "modals");

  // Get all documents in the "modals" collection
  return getDocs(modalsCollection)
    .then((querySnapshot) => {
      let modalId = null;
      querySnapshot.forEach((doc) => {
        const modalData = doc.data();
        if (modalData.sprint === sprintId) {
          modalId = doc.id;
        }
      });
      return modalId;
    })
    .catch((error) => {
      console.error("Error finding modal ID: ", error);
      return null;
    });
}

// Call the function to display Sprint Backlogs when the page loads
window.addEventListener("load", () => {
  displaySprintBacklogs();
});
