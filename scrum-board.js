import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getFirestore, collection, addDoc, doc, updateDoc, getDocs, onSnapshot, deleteDoc } 
from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";

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
    
    // Add a click event listener to show task details in the modal
    taskElement.addEventListener("click", () => {
      showTaskDetails(taskData); // Pass the task data to the function
    });
    
    columnElement.appendChild(taskElement);
  });
}

const getColoredTags = (tagString) => {
    const tagsArray = tagString.split(", ");
    const coloredTags = tagsArray.map(tag => {
      const tagClass = `tag-${tag.toLowerCase()}`;
      return `<span class="${tagClass}">${tag}</span>`;
    }).join(", ");
    return coloredTags;
}

const getPriorityClass = (priority) => {
    let priorityClass = "priority-text-";
    switch (priority.toLowerCase()) {
      case "low": return priorityClass += "low";
      case "medium": return priorityClass += "medium";
      case "important": return priorityClass += "important";
      case "urgent": return priorityClass += "urgent";
      default: return priorityClass += "default";
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
  
  // Close the modal when the close button or overlay is clicked
  // Add an event listener to close the pop-up window
  const closeTaskDetailsButton = document.getElementById("closeTaskDetails");
  closeTaskDetailsButton.addEventListener("click", () => {
    taskDetailsWindow.style.display = "none";
  });
}

populateTasks("column1");

