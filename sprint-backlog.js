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
const columns = document.querySelectorAll(".task-column");
const addButton = document.getElementById("addButton");
addButton.addEventListener("click", addTaskToColumn);
const sprintsCollection = collection(db, "sprints");
const sprintId = getSprintIdFromURL();
const sprintDocRef = doc(sprintsCollection, sprintId);
const sprintData = (await getDoc(sprintDocRef)).data();

// Inside sprint-backlog.js
function getSprintIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

const timeSpentEntriesMap = new Map(); // Map to store time spent entries for each task

async function populateDropdown() {
  const querySnapshot = await getDocs(collection(db, "tasks"));
  const dropdown = document.getElementById("taskDropdown");
  dropdown.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const id = doc.id;
    const data = doc.data();

    if (!sprintData.addedTaskID.includes(id) || sprintData.removedTaskID.includes(id)) {
      const option = createDropdownOption(id, data.taskName);
      dropdown.appendChild(option);
    }
  });
}

function createDropdownOption(value, text) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  return option;
}

async function addTaskToColumn() {
  const dropdown = document.getElementById("taskDropdown");
  const selectedTaskId = dropdown.value;
  if (!selectedTaskId) return; // No task selected

  // Add to the set of added task IDs
  sprintData.addedTaskID.push(selectedTaskId);
  sprintData.notStarted.push(selectedTaskId)

  const indexToRemove = sprintData.removedTaskID.indexOf(selectedTaskId);
  sprintData.removedTaskID.splice(indexToRemove, 1);
  // removedTaskIds.delete(selectedTaskId);

  await updateDoc(sprintDocRef, sprintData);

  // Repopulate the dropdown to remove the added task
  populateDropdown();
  populateColumnsFromSprintData();
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

async function fetchTaskData(taskId) {
  const taskDoc = await getDoc(doc(db, "tasks", taskId));
  return taskDoc.data();
}

function populateColumnsFromSprintData() {
  const column1TaskContainer = document.getElementById("taskContainer1");
  column1TaskContainer.innerHTML = "";
  const column2TaskContainer = document.getElementById("taskContainer2");
  column2TaskContainer.innerHTML = "";
  const column3TaskContainer = document.getElementById("taskContainer3");
  column3TaskContainer.innerHTML = "";

  // Iterate through the task IDs in sprintData.notStarted
  for (const taskId of sprintData.notStarted) {
    // Fetch task data for each taskId
    fetchTaskData(taskId)
      .then((taskData) => {
        // Create and append task element
        const taskElement = createTaskElement(taskId, taskData, taskData.taskName);
        column1TaskContainer.appendChild(taskElement);
      })
      .catch((error) => {
        console.error(`Error fetching task data for taskId ${taskId}: ${error}`);
      });
  }
  for (const taskId of sprintData.inProgress) {
    // Fetch task data for each taskId
    fetchTaskData(taskId)
      .then((taskData) => {
        // Create and append task element
        const taskElement = createTaskElement(taskId, taskData, taskData.taskName);
        column2TaskContainer.appendChild(taskElement);
      })
      .catch((error) => {
        console.error(`Error fetching task data for taskId ${taskId}: ${error}`);
      });
  }
  for (const taskId of sprintData.completed) {
    // Fetch task data for each taskId
    fetchTaskData(taskId)
      .then((taskData) => {
        // Create and append task element
        const taskElement = createTaskElement(taskId, taskData, taskData.taskName);
        column3TaskContainer.appendChild(taskElement);
      })
      .catch((error) => {
        console.error(`Error fetching task data for taskId ${taskId}: ${error}`);
      });
  }
}

function createTaskElement(id, data, text) {
  const taskElement = document.createElement("div");
  taskElement.id = id;
  taskElement.className = "task";
  taskElement.textContent = text;
  taskElement.draggable = true;

  taskElement.addEventListener("click", () => {
    showTaskDetails(data);
  });

  taskElement.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", id);
  });
  return taskElement;
}

function handleDragAndDrop(column) {
  column.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  column.addEventListener("drop", async(e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    const taskElement = document.getElementById(taskId);

    if (e.target.classList.contains("task-column")) {
      const sourceColumnId = taskElement.parentElement.parentElement.id;
      const targetColumnId = column.id;

      e.target.appendChild(taskElement);

      // Update sprintData based on the source and target columns
      if (sourceColumnId === "column1") {
        // Remove the task from sprintData.notStarted
        const indexToRemove = sprintData.notStarted.indexOf(taskId);
        if (indexToRemove !== -1) {
          sprintData.notStarted.splice(indexToRemove, 1);
        }
      } 
      else if (sourceColumnId === "column2") {
        // Remove the task from sprintData.inProgress
        const indexToRemove = sprintData.inProgress.indexOf(taskId);
        if (indexToRemove !== -1) {
          sprintData.inProgress.splice(indexToRemove, 1);
        }
      }
      else if (sourceColumnId === "column3") {
        // Remove the task from sprintData.inProgress
        const indexToRemove = sprintData.completed.indexOf(taskId);
        if (indexToRemove !== -1) {
          sprintData.completed.splice(indexToRemove, 1);
        }
      }

      if (targetColumnId === "column1") {
        // Add the task to sprintData.notStarted
        sprintData.notStarted.push(taskId);
      } 
      else if (targetColumnId === "column2") {
        // Add the task to sprintData.inProgress
        sprintData.inProgress.push(taskId);
      }
      else if (targetColumnId === "column3") {
        // Add the task to sprintData.inProgress
        sprintData.completed.push(taskId);
      }

      // Update the Firestore document
      await updateDoc(sprintDocRef, sprintData);
    }
  });
}
columns.forEach(handleDragAndDrop);

const deleteArea = document.getElementById("deleteArea");
deleteArea.addEventListener("dragover", (e) => {
  e.preventDefault();
});

deleteArea.addEventListener("drop", async(e) => {
  e.preventDefault();
  const taskId = e.dataTransfer.getData("text/plain");
  const taskElement = document.getElementById(taskId);
  const sourceColumnId = taskElement.parentElement.parentElement.id;

  taskElement.remove();
  const indexToRemove = sprintData.addedTaskID.indexOf(taskId);
  sprintData.addedTaskID.splice(indexToRemove, 1);
  sprintData.removedTaskID.push(taskId);

  // Update sprintData based on the source and target columns
  if (sourceColumnId === "column1") {
    // Remove the task from sprintData.notStarted
    const indexToRemove = sprintData.notStarted.indexOf(taskId);
    if (indexToRemove !== -1) {
      sprintData.notStarted.splice(indexToRemove, 1);
    }
  } 
  else if (sourceColumnId === "column2") {
    // Remove the task from sprintData.inProgress
    const indexToRemove = sprintData.inProgress.indexOf(taskId);
    if (indexToRemove !== -1) {
      sprintData.inProgress.splice(indexToRemove, 1);
    }
  }
  else if (sourceColumnId === "column3") {
    // Remove the task from sprintData.inProgress
    const indexToRemove = sprintData.completed.indexOf(taskId);
    if (indexToRemove !== -1) {
      sprintData.completed.splice(indexToRemove, 1);
    }
  }

  await updateDoc(sprintDocRef, sprintData);
  populateDropdown();
});

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

  // Check if the task already exists in the timeSpentEntriesMap, and initialize if not
  if (!timeSpentEntriesMap.has(taskName)) {
    timeSpentEntriesMap.set(taskName, []);
  }

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
populateColumnsFromSprintData();
