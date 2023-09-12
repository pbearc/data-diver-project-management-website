// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getFirestore, collection, addDoc, doc, updateDoc, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";
import { deleteDoc } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBbyuRShsNdaTzIcuKKzlvTDl8bCDr8pJY",
  authDomain: "fit2101-project-database.firebaseapp.com",
  databaseURL: "https://fit2101-project-database-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fit2101-project-database",
  storageBucket: "fit2101-project-database.appspot.com",
  messagingSenderId: "841276992676",
  appId: "1:841276992676:web:c7761b64a8d7d43d230a31",
  measurementId: "G-9936B4VLCD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig, "Data Diver");
const db = getFirestore(app)

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
  
  const initialFormValues = {};
  formFields.forEach((field) => {
    initialFormValues[field.id] = field.value;
  });

  function displayTask(taskData, taskId) {
    const taskList = document.getElementById("taskList");
    const taskItem = document.createElement("div");
    
    // Style your task item
    taskItem.style.cssText = 'background-color: white; padding: 10px; margin: 10px; border-radius: 5px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1); position: relative;';
    
    const deleteButton = createButton("X", { x: "right", y: "top" }, () => {
      const confirmDelete = confirm("Do you want to delete this task?");
      if (confirmDelete) {
        deleteTask(taskId);
      }
    });
    
    const editButton = createButton("Edit", { x: "right", y: "bottom" }, () => {
      Object.keys(taskData).forEach((key) => {
        const field = document.getElementById(key);
        if (field) {
          field.value = taskData[key];
        }
      });
      editingTaskId = taskId;
      floatingWindow.style.display = "block";
    });
    
    taskItem.innerHTML = `
      <h3>${taskData.taskName}</h4>
      <p>Category: ${taskData.category}</p>
      <p>Story Point: ${taskData.storyPoint}</p>
      <p>Assignee: ${taskData.assignee}</p>
      <p>Description: ${taskData.taskDescription}</p>
      <p>Status: ${taskData.taskStatus}</p>
    `;

    [deleteButton, editButton].forEach(button => taskItem.appendChild(button));
    taskList.appendChild(taskItem);
  }

  async function deleteTask(taskId) {
    const taskRef = doc(db, "tasks", taskId);
    await deleteDoc(taskRef);
  }

  async function updateTask(taskId, newData) {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, newData);
  }

  function displayTasksRealtime() {
    const tasksCollection = collection(db, "tasks");
  
    onSnapshot(tasksCollection, (querySnapshot) => {
      const taskList = document.getElementById("taskList");
      taskList.innerHTML = "";
      querySnapshot.forEach((doc) => displayTask(doc.data(), doc.id));
    });
  }

  displayTasksRealtime();

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
      Array.from(formFields).map(field => [field.id, field.value])
    );

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