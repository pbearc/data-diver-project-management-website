// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getFirestore, collection, addDoc, doc, updateDoc, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

document.addEventListener("DOMContentLoaded", function () {
  
  function displayTask(taskData) {
    const taskList = document.getElementById("taskList");

    // Create HTML elements to display the task data
    const taskItem = document.createElement("div");
    taskItem.innerHTML = `
      <h3>${taskData.taskName}</h3>
      <p>Category: ${taskData.category}</p>
      <p>Story Point: ${taskData.storyPoint}</p>
      <p>Assignee: ${taskData.assignee}</p>
      <p>Description: ${taskData.taskDescription}</p>
      <p>Status: ${taskData.taskStatus}</p>
    `;

    // Append the task item to the task list
    taskList.appendChild(taskItem);
  }

  // Update Task Function
  async function updateTask(taskId, newData) {
    const taskRef = doc(db, "tasks", taskId);

    // Update the document with the new data
    try {
      await updateDoc(taskRef, newData);
      console.log("Document updated successfully!");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  }

  // Function to retrieve and display data in real-time
  function displayTasksRealtime() {
    const tasksCollection = collection(db, "tasks");

    // Create a real-time listener for changes in the collection
    onSnapshot(tasksCollection, (querySnapshot) => {
      const taskList = document.getElementById("taskList");

      // Clear the existing task list
      taskList.innerHTML = "";

      querySnapshot.forEach((doc) => {
        const taskData = doc.data();

        // Display each task immediately
        displayTask(taskData);
      });
    });
  }

  displayTasksRealtime();

  const addTaskButton = document.getElementById("addTaskButton");
  const floatingWindow = document.getElementById("floatingWindow");
  const closeFloatingWindow = document.getElementById("closeFloatingWindow");
  const saveTaskButton = document.getElementById("saveTaskButton");
  const formFields = document.querySelectorAll(".form-control"); // Select all form fields

  // Store initial/default values for dropdown menus
  const initialCategory = document.getElementById("category").value;
  const initialTag = document.getElementById("tag").value;
  const initialPriority = document.getElementById("priority").value;
  const initialAssignee = document.getElementById("assignee").value;
  const initialTaskStatus = document.getElementById("taskStatus").value;

  addTaskButton.addEventListener("click", function () {
    floatingWindow.style.display = "block"; // Show the floating window
    // Reset text fields
    formFields.forEach((field) => {
      field.value = ""; // Clear the value of each text field
    });
    // Reset dropdown menus to their initial/default values
    document.getElementById("category").value = initialCategory;
    document.getElementById("tag").value = initialTag;
    document.getElementById("priority").value = initialPriority;
    document.getElementById("assignee").value = initialAssignee;
    document.getElementById("taskStatus").value = initialTaskStatus;
  });

  closeFloatingWindow.addEventListener("click", function () {
    floatingWindow.style.display = "none"; // Hide the floating window
  });

  saveTaskButton.addEventListener("click", function () {
    // Get data from form fields
    const taskName = document.getElementById("taskName").value;
    const category = document.getElementById("category").value;
    const tag = document.getElementById("tag").value;
    const priority = document.getElementById("priority").value;
    const assignee = document.getElementById("assignee").value;
    const storyPoint = document.getElementById("storyPoint").value;
    const taskDescription = document.getElementById("taskDescription").value;
    const taskStatus = document.getElementById("taskStatus").value;

    // Create an object with the data
    const taskData = {
      taskName,
      category,
      tag,
      priority,
      assignee,
      storyPoint,
      taskDescription,
      taskStatus,
    };

    // Add the data to Firestore
    const tasksCollection = collection(db, "tasks"); // Replace "tasks" with your Firestore collection name
    addDoc(tasksCollection, taskData)
      .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
        // Optionally, you can clear the form fields or close the floating window here
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });
    floatingWindow.style.display = "none"; // Hide the floating window
  });
});

