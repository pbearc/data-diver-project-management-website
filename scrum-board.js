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

async function populateTasks(columnId) {
  const columnElement = document.getElementById(columnId);
  const querySnapshot = await getDocs(collection(db, "tasks"));

  querySnapshot.forEach((doc) => {
    const taskData = doc.data();
    const taskElement = document.createElement("div");
    taskElement.className = "task";
    taskElement.textContent = taskData.taskName;
    taskElement.draggable = true;
    taskElement.id = doc.id; // Set a unique ID for each task card

    const taskElements = columnElement.querySelectorAll(".task");

    taskElements.forEach((taskElement) => {
      taskElement.draggable = true; // Make the task card draggable
      taskElement.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", e.target.id);
      });
    });

    taskElement.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", e.target.id);
    });

    // Add a click event listener to show task details in the modal
    taskElement.addEventListener("click", () => {
      showTaskDetails(taskData); // Pass the task data to the function
    });

    columnElement.appendChild(taskElement);
  });
}

const columns = document.querySelectorAll(".task-column");

columns.forEach((column) => {
  column.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  document.addEventListener("drop", (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    const taskElement = document.getElementById(taskId);
  
    // Check if the drop target is a column
    if (e.target.classList.contains("task-column")) {
      e.target.appendChild(taskElement);
    }
  });

  column.addEventListener("drop", (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    const taskElement = document.getElementById(taskId);
    column.appendChild(taskElement);
  });
});

function drop(event) {
  event.preventDefault();
  const taskId = event.dataTransfer.getData("text/plain");
  const taskElement = document.getElementById(taskId);
  event.target.appendChild(taskElement);
}

const getColoredTags = (tagString) => {
  const tagsArray = tagString.split(", ");
  const coloredTags = tagsArray
    .map((tag) => {
      const tagClass = `tag-${tag.toLowerCase()}`;
      return `<span class="${tagClass}">${tag}</span>`;
    })
    .join(", ");
  return coloredTags;
};

const getPriorityClass = (priority) => {
  let priorityClass = "priority-text-";
  switch (priority.toLowerCase()) {
    case "low":
      return (priorityClass += "low");
    case "medium":
      return (priorityClass += "medium");
    case "important":
      return (priorityClass += "important");
    case "urgent":
      return (priorityClass += "urgent");
    default:
      return (priorityClass += "default");
  }
};
// Function to display task details in the modal
function showTaskDetails(taskData) {
  const taskDetailsWindow = document.getElementById("taskDetailsWindow");
  const taskDetailsContent = document.getElementById("taskDetailsContent");
  const priorityClass = getPriorityClass(taskData.priority);
  const coloredTags = getColoredTags(taskData.tag);

  taskDetailsContent.innerHTML = `
      <p>Name: ${taskData.taskName}</p>
      <p>Tag: ${coloredTags}</p>
      <p>Story Point: ${taskData.storyPoint}</p>
      <p>Category: ${taskData.category}</p>
      <p>Priority: <span class="${priorityClass}">${taskData.priority}</span></p>
      <p>Assignee: ${taskData.assignee}</p>
      <p>Task Stage: ${taskData.taskStage}</p>
      <p>Task Description: ${taskData.taskDescription}</p>
      <p>Task Status: ${taskData.taskStatus}</p>
    `;

  // Show the modal
  taskDetailsWindow.style.display = "block";

  // Edit Log button click event
  const editLogButton = document.getElementById("editLogButton");
  editLogButton.addEventListener("click", () => {
    // Open the edit task log window
    showEditTaskLogWindow(taskData);
  });

  // Close the modal when the close button or overlay is clicked
  // Add an event listener to close the pop-up window
  const closeTaskDetailsButton = document.getElementById("closeTaskDetails");
  closeTaskDetailsButton.addEventListener("click", () => {
    taskDetailsWindow.style.display = "none";
  });
}

// Inside showEditTaskLogWindow function
function showEditTaskLogWindow(taskData) {
  const editTaskLogWindow = document.getElementById("editTaskLogWindow");
  const teamMemberSelect = document.getElementById("teamMember");
  const logDateInput = document.getElementById("logDate");
  const hoursInput = document.getElementById("hours");
  const minutesInput = document.getElementById("minutes");

  // Set today's date as the default value for the date input
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const formattedDate = `${yyyy}-${mm}-${dd}`;
  logDateInput.value = formattedDate;

  // Populate input fields with existing task data
  teamMemberSelect.value = taskData.assignee; // Assignee can be used as the team member here
  hoursInput.value = Math.floor(taskData.timeSpent) || 0;
  minutesInput.value = (taskData.timeSpent - hoursInput.value) * 60 || 0;

  // Show the edit task log window
  editTaskLogWindow.style.display = "block";

  const cancelLogButton = document.getElementById("cancelLogButton");
  cancelLogButton.addEventListener("click", () => {
    // Close the edit task log window
    const editTaskLogWindow = document.getElementById("editTaskLogWindow");
    editTaskLogWindow.style.display = "none";
  });
}
populateTasks("column1");
