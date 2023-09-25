import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getFirestore, collection, addDoc, doc, updateDoc, getDocs, onSnapshot, deleteDoc, query as firestoreQuery, where, getDoc } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";

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
const addedTaskIds = new Set();
const removedTaskIds = new Set();
const columns = document.querySelectorAll(".task-column");
const addButton = document.getElementById("addButton");
addButton.addEventListener("click", addTaskToColumn);

const timeSpentEntriesMap = new Map(); // Map to store time spent entries for each task

async function populateDropdown() {
  const querySnapshot = await getDocs(collection(db, "tasks"));
  const dropdown = document.getElementById("taskDropdown");
  dropdown.innerHTML = ""; 

  querySnapshot.forEach((doc) => {
    const id = doc.id;
    const data = doc.data();
    
    if (!addedTaskIds.has(id) || removedTaskIds.has(id)) {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = data.taskName;
      dropdown.appendChild(option);
    }
  });
}

async function addTaskToColumn() {
  const dropdown = document.getElementById("taskDropdown");
  const selectedTaskId = dropdown.value;
  if (!selectedTaskId) return; // No task selected
  
  // Add to the set of added task IDs
  addedTaskIds.add(selectedTaskId);

  // Retrieve task data from Firestore
  const taskDoc = await getDoc(doc(db, "tasks", selectedTaskId));
  const taskData = taskDoc.data();

  // Check if the task already exists in the timeSpentEntriesMap, and initialize if not
  if (!timeSpentEntriesMap.has(taskData.taskName)) {
    timeSpentEntriesMap.set(taskData.taskName, []);
  }

  // Create the task element (replace this with your task structure)
  const taskElement = document.createElement("div");
  taskElement.id = selectedTaskId;
  taskElement.className = "task";
  taskElement.textContent = dropdown.options[dropdown.selectedIndex].text;
  taskElement.draggable = true; // Make the task draggable
  
  taskElement.addEventListener("click", () => {
    showTaskDetails(taskData);
  });

  taskElement.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", taskElement.id);
  });

  // Add the task element to column1
  const column1 = document.getElementById("column1");
  column1.appendChild(taskElement);

  removedTaskIds.delete(selectedTaskId);

  // Repopulate the dropdown to remove the added task
  populateDropdown();
}

columns.forEach((column) => {
  column.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  column.addEventListener("drop", (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    const taskElement = document.getElementById(taskId);

    if (e.target.classList.contains("task-column")) {
      e.target.appendChild(taskElement);
    }
  });
});

const deleteArea = document.getElementById("deleteArea");

deleteArea.addEventListener("dragover", (e) => {
  e.preventDefault();
});

deleteArea.addEventListener("drop", (e) => {
  e.preventDefault();
  const taskId = e.dataTransfer.getData("text/plain");
  const taskElement = document.getElementById(taskId);

  taskElement.remove();
  addedTaskIds.delete(taskId);
  removedTaskIds.add(taskId);
  populateDropdown();
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
async function showTaskDetails(taskData) {
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

  // Create a div to display time spent details
  const timeSpentDiv = document.createElement("div");
  timeSpentDiv.id = "timeSpentDetails";

  // Append the time spent div to the task details content
  taskDetailsContent.appendChild(timeSpentDiv);

  // Fetch and display time spent entries from Firestore
  await displayTimeSpentEntries(taskData.taskName);

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

// Function to fetch and display time spent entries from Firestore
async function displayTimeSpentEntries(taskName) {
  const timeSpentDiv = document.getElementById("timeSpentDetails");

  // Initialize the content with "Time Spent:"
  let content = "<p>Time Spent:</p>";

  let totalHours = 0;
  let totalMinutes = 0;

  try {
    const taskLogsCollection = collection(db, "task_logs");
    const q = firestoreQuery(taskLogsCollection, where("taskName", "==", taskName));
    const querySnapshot = await getDocs(q);

    const timeSpentEntries = [];

    querySnapshot.forEach((doc) => {
      const logData = doc.data();
      const timeSpentDetails = formatTimeSpentDetails(
        logData.logDate,
        Math.floor(logData.timeSpent),
        (logData.timeSpent - Math.floor(logData.timeSpent)) * 60
      );
      content += `<p>${timeSpentDetails}</p>`;

      // Update total time spent
      totalHours += Math.floor(logData.timeSpent);
      totalMinutes += (logData.timeSpent - Math.floor(logData.timeSpent)) * 60;

      // Add the log entry to the timeSpentEntries array
      timeSpentEntries.push({
        logDate: logData.logDate,
        hours: Math.floor(logData.timeSpent),
        minutes: (logData.timeSpent - Math.floor(logData.timeSpent)) * 60,
      });
    });

    // Calculate total hours and minutes
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes = totalMinutes % 60;

    // Retrieve existing time spent entries from the map
    const existingTimeSpentEntries = timeSpentEntriesMap.get(taskName) || [];

    // Combine existing entries with new entries
    const updatedTimeSpentEntries = [...existingTimeSpentEntries, ...timeSpentEntries];

    // Update the timeSpentEntriesMap with the combined entries
    timeSpentEntriesMap.set(taskName, updatedTimeSpentEntries);

    // Add the "Total Time Spent" to the content
    const formattedTotalTimeSpent = formatTotalTimeSpent(totalHours, totalMinutes);
    content += formattedTotalTimeSpent;
  } catch (error) {
    console.error("Error fetching time spent entries: ", error);
  }

  // Set the innerHTML with the constructed content
  timeSpentDiv.innerHTML = content;
}

// Create a new function to format total time spent
function formatTotalTimeSpent(hours, minutes) {
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = Math.round(minutes).toString().padStart(2, "0");

  return `<p class="total-time-spent">Total Time Spent: <span class="time-spent">${formattedHours} hours ${formattedMinutes} mins</span></p>`;
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

  saveLogButton.removeEventListener("click", saveTaskLog);
  saveLogButton.addEventListener("click", () => {
    saveTaskLog(taskData); // Save the task log data
  });

  const cancelLogButton = document.getElementById("cancelLogButton");
  cancelLogButton.addEventListener("click", () => {
    // Close the edit task log window
    const editTaskLogWindow = document.getElementById("editTaskLogWindow");
    editTaskLogWindow.style.display = "none";
  });
}

// Function to format time spent details
function formatTimeSpentDetails(logDate, hours, minutes) {
  const formattedLogDate = new Date(logDate);
  const formattedDate = formattedLogDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = Math.round(minutes).toString().padStart(2, "0");

  return `<div class="time-spent-entry">${formattedDate}<span class="time-spent">${formattedHours} hours ${formattedMinutes} mins</span></div>`;
}

// Function to update the time spent display
function updateTimeSpentDisplay(taskData) {
  const timeSpentDiv = document.getElementById("timeSpentDetails");

  // Initialize the content with "Time Spent:"
  let content = "<p>Time Spent:</p>";

  const timeSpentEntries = timeSpentEntriesMap.get(taskData.taskName) || [];

  timeSpentEntries.forEach((entry) => {
    const timeSpentDetails = formatTimeSpentDetails(
      entry.logDate,
      entry.hours,
      entry.minutes
    );
    content += `<p>${timeSpentDetails}</p>`;
  });

  // Set the innerHTML with the constructed content
  timeSpentDiv.innerHTML = content;
}

let isSaving = false;

// Function to save task log to the database
async function saveTaskLog(taskData) {
  const teamMemberSelect = document.getElementById("teamMember");
  const logDateInput = document.getElementById("logDate");
  const hoursInput = document.getElementById("hours");
  const minutesInput = document.getElementById("minutes");

  if (
    !teamMemberSelect.value ||
    !logDateInput.value ||
    !hoursInput.value ||
    !minutesInput.value
  ) {
    alert("Please fill in all required fields.");
    return;
  }

  const teamMember = teamMemberSelect.value;
  const logDate = logDateInput.value;
  const hours = parseInt(hoursInput.value) || 0;
  const minutes = parseInt(minutesInput.value) || 0;
  const timeSpent = hours + minutes / 60;

  const log = {
    taskName: taskData.taskName,
    logDate,
    timeSpent,
  };

  if (isSaving) {
    // If a save operation is already in progress, ignore the click
    return;
  }

  isSaving = true;

  saveLogButton.disabled = true;

  const taskLogsCollection = collection(db, "task_logs");

  try {
    // Query the "task_logs" collection for a document with the same task name and logDate
    const q = firestoreQuery(
      taskLogsCollection,
      where("taskName", "==", log.taskName),
      where("logDate", "==", log.logDate)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // If no matching documents found, add a new document to the collection
      await addDoc(taskLogsCollection, log);
      console.log("Task log entry saved successfully.");
    } else {
      // If matching documents found, update the first matching document
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, {
        timeSpent: log.timeSpent, // Update the timeSpent field
      });
      console.log("Task log entry updated successfully.");
    }

    // Update the display
    updateTimeSpentDisplay(taskData.taskName);

    // Add the new entry to the timeSpentEntriesMap
    const timeSpentEntries = timeSpentEntriesMap.get(taskData.taskName) || [];
    timeSpentEntries.push({
      logDate,
      hours,
      minutes,
    });
    timeSpentEntriesMap.set(taskData.taskName, timeSpentEntries);

    // Fetch and display time spent entries from Firestore after saving
    await displayTimeSpentEntries(taskData.taskName); 

  } catch (error) {
    console.error("Error saving or updating task log entry: ", error);
  }
  
  isSaving = false;

  // Close the edit task log window after saving
  const editTaskLogWindow = document.getElementById("editTaskLogWindow");
  editTaskLogWindow.style.display = "none";
  saveLogButton.disabled = false;
}

populateDropdown();
