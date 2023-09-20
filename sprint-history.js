<<<<<<< Updated upstream
// Import Firebase functions as before

// Initialize Firebase as before

// Function to display sprint details in a modal
function showSprintDetails(sprintData) {
    // Similar to your showTaskDetails function
  }
  
  // Function to populate sprints
  async function populateSprints() {
    const sprintListElement = document.getElementById("sprintList");
    const querySnapshot = await getDocs(collection(db, "sprints"));
  
    querySnapshot.forEach((doc) => {
      const sprintData = doc.data();
      const sprintElement = document.createElement("div");
      sprintElement.className = "sprint-item";
      sprintElement.textContent = sprintData.sprintName;
      
      // Add a click event listener to show sprint details in the modal
      sprintElement.addEventListener("click", () => {
        showSprintDetails(sprintData); // Pass the sprint data to the function
      });
  
      sprintListElement.appendChild(sprintElement);
    });
  }
  
  populateSprints();
=======
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

// Helper functions
const resetFormFields = (fields, initialValues) => {
  fields.forEach((field) => {
    field.value = initialValues[field.id] || "";
  });
};

const createButton = (text, position, eventHandler) => {
  const button = document.createElement("button");
  button.innerHTML = text;
  button.style.position = "absolute";
  button.style[position.y] = "10px";
  button.style[position.x] = "10px";
  button.addEventListener("click", eventHandler);
  return button;
};

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

const isValidTaskData = (data) => {
  const requiredFields = [
    "taskName",
    "tag",
    "storyPoint",
    "priority",
    "assignee",
    "taskStage",
    "taskDescription",
    "taskStatus",
    "category",
  ];
  return requiredFields.every((field) => Boolean(data[field]));
};

const getUniqueTags = (tagSelect) => {
  const selectedTags = Array.from(tagSelect.selectedOptions).map(
    (option) => option.value
  );
  return Array.from(new Set(selectedTags)).join(", ");
};

const sortTasks = (querySnapshot, sortOrder) => {
  let sortedDocs;

  switch (sortOrder) {
    case "RecentToOldest":
      sortedDocs = querySnapshot.docs.sort((a, b) => b.data().timestamp - a.data().timestamp);
      break;
    case "LowestToUrgent":
    case "UrgentToLowest":
      const priorityOrder = sortOrder === "LowestToUrgent" ? ["Low", "Medium", "Important", "Urgent"] : ["Urgent", "Important", "Medium", "Low"];
      sortedDocs = querySnapshot.docs.sort((a, b) => priorityOrder.indexOf(a.data().priority) - priorityOrder.indexOf(b.data().priority));
      break;
    default:
      sortedDocs = querySnapshot.docs.sort((a, b) => a.data().timestamp - b.data().timestamp);
  }

  return sortedDocs;
}

const getColoredTags = (tagString) => {
  const tagsArray = tagString.split(", ");
  const coloredTags = tagsArray.map(tag => {
    const tagClass = `tag-${tag.toLowerCase()}`;
    return `<span class="${tagClass}">${tag}</span>`;
  }).join(", ");
  return coloredTags;
}

// Assuming the Firebase and helper functions setup is similar to your provided JavaScript code

document.addEventListener("DOMContentLoaded", function () {
    let editingSprintId = null;
  
    displaySprintsRealtime();
  
    async function updateSprint(sprintId, newData) {
      const sprintRef = doc(db, "sprints", sprintId);
      await updateDoc(sprintRef, newData);
    }
  
    function displaySprint(sprintData, sprintId) {
      const sprintList = document.getElementById("sprintList");
      const sprintItem = document.createElement("div");
  
      const editButton = createButton(
        "Edit",
        { x: "right", y: "bottom" },
        (event) => {
          event.stopPropagation();
          Object.keys(sprintData).forEach((key) => {
            const field = document.getElementById(key);
            if (field) {
              field.value = sprintData[key];
            }
          });
          editingSprintId = sprintId;
          floatingWindow.style.display = "block";
        }
      );
  
      sprintItem.innerHTML = `
        <p>Sprint Name: ${sprintData.sprintName}</p>
        <p>Status: ${sprintData.status}</p>
        <p>Sprint Retrospective: ${sprintData.retrospective}</p>
      `;
  
      sprintItem.appendChild(editButton);
      sprintList.appendChild(sprintItem);
    }
  
    function displaySprintsRealtime() {
      const sprintsCollection = collection(db, "sprints");
  
      onSnapshot(sprintsCollection, (querySnapshot) => {
        const sprintList = document.getElementById("sprintList");
        sprintList.innerHTML = "";
  
        querySnapshot.forEach((doc) => {
          const sprintData = doc.data();
          displaySprint(sprintData, doc.id);
        });
      });
    }
  
    // Event listeners for buttons and windows
    const floatingWindow = document.getElementById("floatingWindow");
    const closeFloatingWindow = document.getElementById("closeFloatingWindow");
    const saveRetrospectiveButton = document.getElementById("saveRetrospectiveButton");
  
    closeFloatingWindow.addEventListener("click", () => {
      floatingWindow.style.display = "none";
    });
  
    saveRetrospectiveButton.addEventListener("click", () => {
      const retrospectiveField = document.getElementById("retrospective");
      const retrospectiveData = { retrospective: retrospectiveField.value };
  
      if (editingSprintId) {
        updateSprint(editingSprintId, retrospectiveData);
        floatingWindow.style.display = "none";
        editingSprintId = null;
      }
    });
  });
>>>>>>> Stashed changes
  