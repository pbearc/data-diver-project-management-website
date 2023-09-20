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
  