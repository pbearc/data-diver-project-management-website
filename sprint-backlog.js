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
  query as firestoreQuery,
  where,
  getDoc,
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

    if (
      !sprintData.addedTaskID.includes(id) ||
      sprintData.removedTaskID.includes(id)
    ) {
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
addButton.disabled = true; // Disable the button to prevent multiple clicks

  const selectedTaskId = dropdown.value;
  if (!selectedTaskId) {
    addButton.disabled = false; // Enable the button in case of error or no selection
    return; // No task selected
}

  // Add to the set of added task IDs
  sprintData.addedTaskID.push(selectedTaskId);
  sprintData.notStarted.push(selectedTaskId);

  const indexToRemove = sprintData.removedTaskID.indexOf(selectedTaskId);
  sprintData.removedTaskID.splice(indexToRemove, 1);
  
try {
  await updateDoc(sprintDocRef, sprintData);
  // Repopulate the dropdown to remove the added task
  populateDropdown();
  populateColumnsFromSprintData();
} catch (error) {
    console.error("Error adding task:", error);
  } finally {
    addButton.disabled = false; // Enable the button after the operation is complete
  }
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
        const taskElement = createTaskElement(
          taskId,
          taskData,
          taskData.taskName
        );
        column1TaskContainer.appendChild(taskElement);
      })
      .catch((error) => {
        console.error(
          `Error fetching task data for taskId ${taskId}: ${error}`
        );
      });
  }
  for (const taskId of sprintData.inProgress) {
    // Fetch task data for each taskId
    fetchTaskData(taskId)
      .then((taskData) => {
        // Create and append task element
        const taskElement = createTaskElement(
          taskId,
          taskData,
          taskData.taskName
        );
        column2TaskContainer.appendChild(taskElement);
      })
      .catch((error) => {
        console.error(
          `Error fetching task data for taskId ${taskId}: ${error}`
        );
      });
  }
  for (const taskId of sprintData.completed) {
    // Fetch task data for each taskId
    fetchTaskData(taskId)
      .then((taskData) => {
        // Create and append task element
        const taskElement = createTaskElement(
          taskId,
          taskData,
          taskData.taskName
        );
        column3TaskContainer.appendChild(taskElement);
      })
      .catch((error) => {
        console.error(
          `Error fetching task data for taskId ${taskId}: ${error}`
        );
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

  column.addEventListener("drop", async (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    const taskElement = document.getElementById(taskId);

    if (e.target.classList.contains("task-column")) {
      const sourceColumnId = taskElement.parentElement.parentElement.id;
      const targetColumnId = column.id;

      const taskContainerId = `taskContainer${targetColumnId.charAt(targetColumnId.length - 1)}`;
      const taskContainer = document.getElementById(taskContainerId);

      if (taskContainer) {
        // Append the taskElement to taskContainer
        taskContainer.appendChild(taskElement);
      }

      // Update sprintData based on the source and target columns
      if (sourceColumnId === "column1") {
        // Remove the task from sprintData.notStarted
        const indexToRemove = sprintData.notStarted.indexOf(taskId);
        if (indexToRemove !== -1) {
          sprintData.notStarted.splice(indexToRemove, 1);
        }
      } else if (sourceColumnId === "column2") {
        // Remove the task from sprintData.inProgress
        const indexToRemove = sprintData.inProgress.indexOf(taskId);
        if (indexToRemove !== -1) {
          sprintData.inProgress.splice(indexToRemove, 1);
        }
      } else if (sourceColumnId === "column3") {
        // Remove the task from sprintData.inProgress
        const indexToRemove = sprintData.completed.indexOf(taskId);
        if (indexToRemove !== -1) {
          sprintData.completed.splice(indexToRemove, 1);
        }
      }

      if (targetColumnId === "column1") {
        // Add the task to sprintData.notStarted
        sprintData.notStarted.push(taskId);
      } else if (targetColumnId === "column2") {
        // Add the task to sprintData.inProgress
        sprintData.inProgress.push(taskId);
      } else if (targetColumnId === "column3") {
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

deleteArea.addEventListener("drop", async (e) => {
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
  } else if (sourceColumnId === "column2") {
    // Remove the task from sprintData.inProgress
    const indexToRemove = sprintData.inProgress.indexOf(taskId);
    if (indexToRemove !== -1) {
      sprintData.inProgress.splice(indexToRemove, 1);
    }
  } else if (sourceColumnId === "column3") {
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

  // // Add an event listener to the "Show Effort Chart" button
  const showEffortChartButton = document.getElementById("showEffortChartButton");
  showEffortChartButton.addEventListener("click", async () => {
    await displayEffortChart(taskData.taskName);
  });

  // Close the modal when the close button or overlay is clicked
  // Add an event listener to close the pop-up window
  const closeTaskDetailsButton = document.getElementById("closeTaskDetails");
  closeTaskDetailsButton.addEventListener("click", () => {
    taskDetailsWindow.style.display = "none";
  });
}

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
    const q = firestoreQuery(
      taskLogsCollection,
      where("taskName", "==", taskName)
    );
    const querySnapshot = await getDocs(q);

    const timeSpentEntries = [];

    querySnapshot.forEach((doc) => {
      const logData = doc.data();
      timeSpentEntries.push({
        logDate: logData.logDate,
        hours: Math.floor(logData.timeSpent),
        minutes: (logData.timeSpent - Math.floor(logData.timeSpent)) * 60,
      });
    });

    // Sort time entries based on log date
    timeSpentEntries.sort((a, b) => new Date(a.logDate) - new Date(b.logDate));

    timeSpentEntries.forEach((entry) => {
      const timeSpentDetails = formatTimeSpentDetails(
        entry.logDate,
        entry.hours,
        entry.minutes
      );
      content += `<p>${timeSpentDetails}</p>`;

      // Update total time spent
      totalHours += entry.hours;
      totalMinutes += entry.minutes;
    });

    // Calculate total hours and minutes
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes = totalMinutes % 60;

    // Retrieve existing time spent entries from the map
    const existingTimeSpentEntries = timeSpentEntriesMap.get(taskName) || [];

    // Combine existing entries with new entries
    const updatedTimeSpentEntries = [
      ...existingTimeSpentEntries,
      ...timeSpentEntries,
    ];

    // Update the timeSpentEntriesMap with the combined entries
    timeSpentEntriesMap.set(taskName, updatedTimeSpentEntries);

    // Add the "Total Time Spent" to the content
    const formattedTotalTimeSpent = formatTotalTimeSpent(
      totalHours,
      totalMinutes
    );
    content += formattedTotalTimeSpent;

    // Update the total time spent display in the modal
    updateTimeSpentDisplay(taskName, totalHours, totalMinutes);
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
  const taskSelected = document.getElementById("taskSelected");
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
  taskSelected.value = taskData.taskName;
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

function updateTimeSpentDisplay(taskName, totalHours, totalMinutes) {
  const timeSpentDiv = document.getElementById("timeSpentDetails");

  // Find the existing total time spent element
  const totalTimeSpentElement = timeSpentDiv.querySelector(".total-time-spent");

  if (totalTimeSpentElement) {
    // Update the total time spent display
    const formattedHours = totalHours.toString().padStart(2, "0");
    const formattedMinutes = Math.round(totalMinutes)
      .toString()
      .padStart(2, "0");
    const totalTimeSpent = `${formattedHours} hours ${formattedMinutes} mins`;
    totalTimeSpentElement.innerHTML = `Total Time Spent: <span class="time-spent">${totalTimeSpent}</span>`;
  }
}

let isSaving = false;

// Function to save task log to the database
async function saveTaskLog(taskData) {
  const taskSelect = document.getElementById("taskSelected");
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

  const taskName = taskSelect.value;
  const teamMember = teamMemberSelect.value;
  const logDate = logDateInput.value;
  const hours = parseInt(hoursInput.value) || 0;
  const minutes = parseInt(minutesInput.value) || 0;
  const timeSpent = hours + minutes / 60;

  const log = {
    taskName,
    assignee: teamMember,
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

    // Update the display immediately
    await displayTimeSpentEntries(taskName);

    // Update the timeSpentEntriesMap immediately
    const timeSpentEntries = timeSpentEntriesMap.get(taskName) || [];
    timeSpentEntries.push({
      logDate,
      hours,
      minutes,
    });
    timeSpentEntriesMap.set(taskName, timeSpentEntries);
  } catch (error) {
    console.error("Error saving or updating task log entry: ", error);
  }

  isSaving = false;

  // Close the edit task log window after saving
  const editTaskLogWindow = document.getElementById("editTaskLogWindow");
  editTaskLogWindow.style.display = "none";
  saveLogButton.disabled = false;
}

// Function to display the accumulation of effort chart
async function displayEffortChart(taskName) {
  // Fetch data for the accumulation of effort chart from the database
  const effortChartData = await fetchEffortChartData(taskName);

  // Check if effortChartData is successfully obtained
  if (effortChartData.dates && effortChartData.members && effortChartData.timeSpent) {
    // Get the chart container
    const chartContainer = document.getElementById("effortChartCanvas");

    // Check if a chart already exists
    const existingChart = Chart.getChart(chartContainer);

    // Destroy the existing chart if it exists
    if (existingChart) {
      existingChart.destroy();
    }

    // Create the line chart
    const ctx = chartContainer.getContext("2d");

    // Create the new chart
    const newChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: effortChartData.dates,
        datasets: effortChartData.members.map((member, index) => ({
          label: member,
          borderColor: getRandomColor(),
          data: effortChartData.timeSpent[index],
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: "time",
            time: { unit: "day" },
            title: {
              display: true,
              text: "Date",
              font: { weight: "bold", size: 18 },
            },
            ticks: {
              font: { weight: "bold" },
            },
          },
          y: {
            title: {
              display: true,
              text: "Time Spent (hours)",
              font: { weight: "bold", size: 18 },
            },
            ticks: {
              font: { weight: "bold" },
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color: "black",
              font: {
                size: 20,
              },
            },
          },
          title: {
            display: true,
            text: 'Accumulation of Effort Chart',
            font: {
              size: 23,
            },
            padding: {
              top: 10,
              bottom: 30,
            },
          },
          tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const datasetLabel = tooltipItem.dataset.label || "";
            const dataIndex = tooltipItem.dataIndex;
            const timeSpent = tooltipItem.chart.data.datasets[tooltipItem.datasetIndex].data[dataIndex];
            return `${datasetLabel}: ${timeSpent} hours`;
              },
            },
          },
        },
      },
    });

    // Show the modal
    const modal = document.getElementById("effortChartModal");
    modal.style.display = "block";

    // Close modal event
    const closeEffortChart = document.getElementById("closeEffortChart");
    closeEffortChart.onclick = function () {
      modal.style.display = "none";
    };

    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };
  } else {
    console.error('Failed to fetch effortChartData');
  }
}

// Function to fetch data for the accumulation of effort chart
async function fetchEffortChartData(taskName) {
  const dates = []; // Array of dates
  const members = []; // Array of member names
  const timeSpent = []; // Array of time spent data

  try {
    const taskLogsCollection = collection(db, "task_logs");
    const q = firestoreQuery(
      taskLogsCollection,
      where("taskName", "==", taskName)
    );
    const querySnapshot = await getDocs(q);

    // Create a map to organize data by members
    const memberDataMap = new Map();

    querySnapshot.forEach((doc) => {
      const logData = doc.data();

      // Parse the date string into a Date object
      const logDate = new Date(logData.logDate);

      // Check if this member's data already exists in the map
      if (!memberDataMap.has(logData.assignee)) {
        // If not, initialize their data
        memberDataMap.set(logData.assignee, {
          member: logData.assignee,
          data: new Map(),
        });
      }

      const memberData = memberDataMap.get(logData.assignee);

      // Format the date as YYYY-MM-DD
      const formattedDate = `${logDate.getFullYear()}-${(logDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${logDate.getDate().toString().padStart(2, "0")}`;

      // Update the member's data map with the time spent on this date
      if (!memberData.data.has(formattedDate)) {
        memberData.data.set(formattedDate, 0);
      }

      memberData.data.set(
        formattedDate,
        memberData.data.get(formattedDate) + logData.timeSpent
      );
    });

    // Convert the map data to arrays for the chart
    memberDataMap.forEach((memberData) => {
      members.push(memberData.member);

      // Sort dates
      const sortedDates = Array.from(memberData.data.keys()).sort();

      const memberTimeSpentData = sortedDates.map((date) => {
        dates.push(date);
        return memberData.data.get(date);
      });

      timeSpent.push(memberTimeSpentData);
    });

    return { dates, members, timeSpent };
  } catch (error) {
    console.error("Error fetching effort chart data: ", error);
    return { dates: [], members: [], timeSpent: [] };
  }
}

// Function to generate a random color for chart lines
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// const saveButton = document.getElementById('saveButton');

// saveButton.addEventListener('click', async function() {
//   const sprintName = document.getElementById('sprintNameInput').value;
//   const startDate = document.getElementById('startDateInput').value;
//   const endDate = document.getElementById('endDateInput').value;

//   const sprintsCollection = collection(db, "sprints");

//   try {
//     const docRef = await addDoc(sprintsCollection, {
//       sprintName: sprintName,
//       startDate: startDate,
//       endDate: endDate
//     });
//     console.log("Document written with ID: ", docRef.id);
  
//   } catch (error) {
//     console.error("Error adding document: ", error);
//   }
// });

const saveButton = document.getElementById('saveButton');

saveButton.addEventListener('click', async function() {
  const sprintName = document.getElementById('sprintNameInput').value;
  const startDate = document.getElementById('startDateInput').value;
  const endDate = document.getElementById('endDateInput').value;

  if (!sprintName.trim() || !startDate.trim() || !endDate.trim()) {
    alert("All field must be filled");
    return;
  }

  if (new Date(endDate) < new Date(startDate)) {
    alert("End date cannot be earlier than start date");
    return;}
  
  const sprintsCollection = collection(db, "sprints");
  const sprintId = getSprintIdFromURL(); 
  
  const sprintDocRef = doc(sprintsCollection, sprintId);
  const sprintData = (await getDoc(sprintDocRef)).data();

  if (sprintData) {
    try {
      await updateDoc(sprintDocRef, {
        sprintName: sprintName,
        startDate: startDate,
        endDate: endDate
      });
      
      console.log("Document updated");

      document.getElementById('displaySprintName').textContent = sprintName;
      document.getElementById('displayStartDate').textContent = startDate;
      document.getElementById('displayEndDate').textContent = endDate;

      localStorage.setItem('sprintName', sprintName);
      localStorage.setItem('startDate', startDate);
      localStorage.setItem('endDate', endDate);

    } catch (error) {
      console.error("Error updating document: ", error);
    }
  }
});

function getTotalStoryPoints(sprintData) {
  const allTasks = [...sprintData.notStarted, ...sprintData.inProgress, ...sprintData.completed];
  let totalStoryPoints = 0;

  // Loop through all task objects and add their story points to the total
  for (const task of allTasks) {
      totalStoryPoints += task.storyPoints;
  }

  return totalStoryPoints;
}

function getSprintDates(sprintData) {
  const startDate = new Date(sprintData.date);  // Assuming sprintData.date is the start date
  
  // Assume a 2-week sprint but also allow for different durations
  const sprintDurationDays = 14;  
  
  // Calculate end date by adding the sprint duration
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + sprintDurationDays);
  
  // Generate the list of all dates from startDate to endDate
  const dateList = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
      dateList.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dateList;
}

document.getElementById("plotButton").addEventListener("click", plotStoryPoints);

async function plotStoryPoints() {
  
  // Get sprint ID from URL and fetch sprint data from Firestore
  const sprintId = getSprintIdFromURL();
  const sprintDocRef = doc(db, 'sprints', sprintId);
  const sprintData = (await getDoc(sprintDocRef)).data();
  
  // Get total story points and dates using the previously defined functions
  const totalStoryPoints = getTotalStoryPoints(sprintData);
  const dates = getSprintDates(sprintData).map(date => date.toISOString().slice(0, 10));

  // Plotting the chart
  const ctx = document.getElementById('storyPointsChart').getContext('2d');
  new Chart(ctx, {
      type: 'line',
      data: {
          labels: dates,
          datasets: [{
              label: 'Story Points',
              data: new Array(dates.length).fill(null), // Filling with null for an empty chart
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
          }]
      },
      options: {
          scales: {
              y: {
                  max: totalStoryPoints,
                  beginAtZero: true
              }
          }
      }
  });
}

populateDropdown();
populateColumnsFromSprintData();
