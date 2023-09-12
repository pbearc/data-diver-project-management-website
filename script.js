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

document.addEventListener("DOMContentLoaded", function () {
  let editingTaskId = null;
  
  function displayTask(taskData, taskId) {
    const taskList = document.getElementById("taskList");
  
    // Create HTML elements to display the task data
    const taskItem = document.createElement("div");
    taskItem.style.backgroundColor = "white"; // Set the background color to white
    taskItem.style.padding = "10px"; // Add some padding
    taskItem.style.margin = "10px"; // Add margin to all sides
    taskItem.style.borderRadius = "5px"; // Add rounded corners
    taskItem.style.boxShadow = "0px 0px 10px rgba(0,0,0,0.1)"; // Add a box shadow for a floating effect
    taskItem.style.position = "relative"; // Set position to relative
  
    // Create the delete button
    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = "X";
    deleteButton.style.position = "absolute";
    deleteButton.style.top = "10px";
    deleteButton.style.right = "10px";
  
    // Add an event listener to the delete button
    deleteButton.addEventListener("click", function () {
      const confirmDelete = confirm("Do you want to delete this task?");
      if (confirmDelete) {
        deleteTask(taskId);
      }
    });

    // Create the edit button
    const editButton = document.createElement("button");
    editButton.innerHTML = "Edit";
    editButton.style.position = "absolute";
    editButton.style.bottom = "10px";
    editButton.style.right = "10px";

    // Add an event listener to the edit button
    editButton.addEventListener("click", function () {
      // Populate the form with the current task data
      document.getElementById("taskName").value = taskData.taskName;
      document.getElementById("category").value = taskData.category;
      document.getElementById("tag").value = taskData.tag;
      document.getElementById("priority").value = taskData.priority;
      document.getElementById("assignee").value = taskData.assignee;
      document.getElementById("storyPoint").value = taskData.storyPoint;
      document.getElementById("taskDescription").value = taskData.taskDescription;
      document.getElementById("taskStatus").value = taskData.taskStatus;

      // Store the taskId being edited
      editingTaskId = taskId;

      // Show the floating window
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
  
    // Append the delete and edit buttons and the task item to the task list
    taskItem.appendChild(deleteButton);
    taskItem.appendChild(editButton);
    taskList.appendChild(taskItem);
  }

  async function deleteTask(taskId) {
    const taskRef = doc(db, "tasks", taskId);
  
    // Delete the document
    try {
      await deleteDoc(taskRef);
      console.log("Document deleted successfully!");
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
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
        // Pass the document ID as the second argument
        displayTask(taskData, doc.id);
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

    if (editingTaskId) {
      updateTask(editingTaskId, taskData);

      // Hide the floating window after updating the task
      floatingWindow.style.display = "none";

      // Reset the editingTaskId variable
      editingTaskId = null;
    }
    else {
    // Add the data to Firestore
      const tasksCollection = collection(db, "tasks"); 
      addDoc(tasksCollection, taskData)
        .then((docRef) => {
          console.log("Document written with ID: ", docRef.id);
          floatingWindow.style.display = "none"; 
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
        });
    }
  });
});
