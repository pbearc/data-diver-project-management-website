// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  getDocs,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";
import { deleteDoc } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";

// Your web app's Firebase configuration
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

// Helper function to reset form fields
const resetFormFields = (fields, initialValues) => {
  fields.forEach((field) => {
    field.value = initialValues[field.id] || "";
  });
};

// Helper function to create buttons
const createButton = (text, position, eventHandler) => {
  const button = document.createElement("button");
  button.innerHTML = text;
  button.style.position = "absolute";
  button.style[position.y] = "10px";
  button.style[position.x] = "10px";
  button.addEventListener("click", eventHandler);
  return button;
};

// Main execution starts when DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  let editingTaskId = null;
  const formFields = document.querySelectorAll(".form-control");

  const tagSelect = document.getElementById("tag");

  const initialFormValues = {};
  formFields.forEach((field) => {
    initialFormValues[field.id] = field.value;
  });

  function displayTask(taskData, taskId) {
    const taskList = document.getElementById("taskList");
    const taskItem = document.createElement("div");

    taskItem.addEventListener("click", () => {
      displayTaskDetails(taskData); // Call a function to display task details
    });

    // Style your task item
    taskItem.className = "task-item";

    const deleteButton = createButton(
      "X",
      { x: "left", y: "bottom" },
      (event) => {
        event.stopPropagation();
        const confirmDelete = confirm("Do you want to delete this task?");
        if (confirmDelete) {
          deleteTask(taskId);
        }
      }
    );

    const editButton = createButton(
      "Edit",
      { x: "right", y: "bottom" },
      (event) => {
        event.stopPropagation();
        Object.keys(taskData).forEach((key) => {
          const field = document.getElementById(key);
          if (field) {
            field.value = taskData[key];
          }
        });
        editingTaskId = taskId;
        floatingWindow.style.display = "block";
      }
    );

    // Determine class based on priority
    let priorityClass = "priority-text-";
    switch (taskData.priority.toLowerCase()) {
      case "low":
        priorityClass += "low";
        break;
      case "medium":
        priorityClass += "medium";
        break;
      case "important":
        priorityClass += "important";
        break;
      case "urgent":
        priorityClass += "urgent";
        break;
      default:
        priorityClass += "default";
    }

    taskItem.innerHTML = `
    <p class="task-name">Name: ${taskData.taskName}</p>
    <p class="task-name">Tag: ${taskData.tag}</p>
    <p>Story Point: ${taskData.storyPoint}</p>
    <p>Priority: <span class="${priorityClass}">${taskData.priority}</span></p>
  `;

    [deleteButton, editButton].forEach((button) =>
      taskItem.appendChild(button)
    );
    taskList.appendChild(taskItem);
  }

  function displayTaskDetails(taskData) {
    const taskDetailsContent = document.getElementById("taskDetailsContent");

    let priorityClass = "priority-text-";
    switch (taskData.priority.toLowerCase()) {
      case "low":
        priorityClass += "low";
        break;
      case "medium":
        priorityClass += "medium";
        break;
      case "important":
        priorityClass += "important";
        break;
      case "urgent":
        priorityClass += "urgent";
        break;
      default:
        priorityClass += "default";
    }
    
    // Populate the task details in the pop-up window
    taskDetailsContent.innerHTML = `
      <p>Name: ${taskData.taskName}</p>
      <p>Tag: ${taskData.tag}</p>
      <p>Story Point: ${taskData.storyPoint}</p>
      <p>Category: ${taskData.category}</p>
      <p>Priority: <span class="${priorityClass}">${taskData.priority}</span></p>
      <p>Assignee: ${taskData.assignee}</p>
      <p>Task Stage: ${taskData.taskStatus}</p>
      <p>Task Description: ${taskData.taskDescription}</p>
      <p>Task Status: ${taskData.taskStatus}</p>
    `;

    const taskDetailsWindow = document.getElementById("taskDetailsWindow");
    taskDetailsWindow.style.display = "block";

    // Add an event listener to close the pop-up window
    const closeTaskDetailsButton = document.getElementById("closeTaskDetails");
    closeTaskDetailsButton.addEventListener("click", () => {
      taskDetailsWindow.style.display = "none";
    });
  }

  async function deleteTask(taskId) {
    const taskRef = doc(db, "tasks", taskId);
    await deleteDoc(taskRef);
  }

  async function updateTask(taskId, newData) {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, newData);
  }

  function displayTasksRealtime(sortOrder = "OldestToRecent") {
    const tasksCollection = collection(db, "tasks");
    const filterValue = document.getElementById("filter").value.replace("-filter", "");
  
    onSnapshot(tasksCollection, (querySnapshot) => {
      const taskList = document.getElementById("taskList");
      taskList.innerHTML = "";
  
      let sortedDocs;
  
      switch (sortOrder) {
        case "RecentToOldest":
          sortedDocs = querySnapshot.docs.sort(
            (a, b) => b.data().timestamp - a.data().timestamp
          );
          break;
        case "LowestToUrgent":
          sortedDocs = querySnapshot.docs.sort((a, b) => {
            const priorityOrder = ["Low", "Medium", "Important", "Urgent"];
            return (
              priorityOrder.indexOf(a.data().priority) -
              priorityOrder.indexOf(b.data().priority)
            );
          });
          break;
        case "UrgentToLowest":
          sortedDocs = querySnapshot.docs.sort((a, b) => {
            const priorityOrder = ["Urgent", "Important", "Medium", "Low"];
            return (
              priorityOrder.indexOf(a.data().priority) -
              priorityOrder.indexOf(b.data().priority)
            );
          });
          break;
        default:
          sortedDocs = querySnapshot.docs.sort(
            (a, b) => a.data().timestamp - b.data().timestamp
          );
      }
      sortedDocs.forEach((doc) => {
        const taskData = doc.data();
  
        if (filterValue === "" || taskData.tag.includes(filterValue)) {
          displayTask(taskData, doc.id);
        }
      });
    });
  }

  displayTasksRealtime();

  const filterDropdown = document.getElementById("filter");
  filterDropdown.addEventListener("change", () => {
    displayTasksRealtime();
  });

  const sortingDropdown = document.getElementById("sorting");
  sortingDropdown.addEventListener("change", () => {
    const selectedValue = sortingDropdown.value;
    switch (selectedValue) {
      case "Recent to Oldest":
        displayTasksRealtime("RecentToOldest");
        break;
      case "Oldest to Recent":
        displayTasksRealtime("OldestToRecent");
        break;
      case "Lowest to Urgent":
        displayTasksRealtime("LowestToUrgent");
        break;
      case "Urgent to Lowest":
        displayTasksRealtime("UrgentToLowest");
        break;
      default:
        displayTasksRealtime();
    }
  });
  
  // Event listeners for buttons and windows
  const addTaskButton = document.getElementById("addTaskButton");
  const floatingWindow = document.getElementById("floatingWindow");
  const closeFloatingWindow = document.getElementById("closeFloatingWindow");
  const saveTaskButton = document.getElementById("saveTaskButton");

  addTaskButton.addEventListener("click", () => {
    floatingWindow.style.display = "block";
    resetFormFields(formFields, initialFormValues);
  });

  closeFloatingWindow.addEventListener("click", () => {
    floatingWindow.style.display = "none";
  });

  saveTaskButton.addEventListener("click", () => {
    const taskData = Object.fromEntries(
      Array.from(formFields).map((field) => [field.id, field.value])
    );

    const selectedTags = Array.from(tagSelect.selectedOptions).map(
      (option) => option.value
    );

    // Ensure unique selections
    const uniqueTags = Array.from(new Set(selectedTags));
    
    taskData.tag = uniqueTags.join(", ")
    
    // Validate required form fields
    if (
      !taskData.taskName ||
      !taskData.tag ||
      !taskData.storyPoint ||
      !taskData.priority ||
      !taskData.assignee ||
      !taskData.taskDescription ||
      !taskData.taskStatus ||
      !taskData.category
    ) {
      alert("Please fill out all fields.");
      return; // Don't proceed with saving if validation fails
    }

    taskData.timestamp = Date.now();

    if (editingTaskId) {
      updateTask(editingTaskId, taskData);
      floatingWindow.style.display = "none";
      editingTaskId = null;
    } else {
      const tasksCollection = collection(db, "tasks");
      addDoc(tasksCollection, taskData).then(() => {
        floatingWindow.style.display = "none";
      });
    }
  });
});